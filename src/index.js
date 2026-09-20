export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const origin = request.headers.get("Origin");
		const responseHeaders = {
			"X-Content-Type-Options": "nosniff",
			"X-Frame-Options": "DENY",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
			"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
		};
		const withSecurityHeaders = response => {
			const headers = new Headers(response.headers);
			Object.entries(responseHeaders).forEach(([key, value]) => headers.set(key, value));
			if (url.protocol === "https:") headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
			return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
		};
		const sendBrevoEmail = async ({ to, subject, text, replyTo }) => {
			if (!env.BREVO_API_KEY) return false;
			const payload = {
				sender: { email: env.BREVO_FROM_EMAIL || "no-reply@auraenter.com", name: "AURA ENTERPRISE" },
				to: [{ email: to }],
				subject,
				textContent: text,
			};
			if (replyTo) payload.replyTo = { email: replyTo };
			const response = await fetch("https://api.brevo.com/v3/smtp/email", {
				method: "POST",
				headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify(payload),
			});
			return response.ok;
		};

		if (url.pathname === "/") {
			return withSecurityHeaders(await env.ASSETS.fetch(
				new Request(new URL("/Main-v6.html", request.url), request),
			));
		}

		const cleanPages = {
			"/about": "/about.html",
			"/services": "/services.html",
			"/contact": "/contact.html",
		};
		if (cleanPages[url.pathname]) {
			return withSecurityHeaders(await env.ASSETS.fetch(
				new Request(new URL(cleanPages[url.pathname], request.url), request),
			));
		}

		const legacyPage = {
			"/about.html": "/about",
			"/services.html": "/services",
			"/contact.html": "/contact",
		}[url.pathname];
		if (legacyPage) return withSecurityHeaders(Response.redirect(new URL(legacyPage, request.url), 301));

		if (url.pathname === "/api/reviews") {
			if (!env.DB) {
				return withSecurityHeaders(Response.json({ error: "Reviews database is not configured." }, { status: 503 }));
			}
			if (request.method === "OPTIONS") return withSecurityHeaders(new Response(null, { status: 204 }));
			if (request.method !== "GET" && request.method !== "POST") return withSecurityHeaders(new Response("Method Not Allowed", { status: 405 }));
			if (request.method === "POST" && origin && origin !== url.origin) return withSecurityHeaders(Response.json({ error: "Invalid origin." }, { status: 403 }));

			await env.DB.prepare(`
				CREATE TABLE IF NOT EXISTS reviews (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
					comment TEXT NOT NULL,
					approved INTEGER NOT NULL DEFAULT 0,
					created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
				)
			`).run();

			if (request.method === "GET") {
				const { results } = await env.DB.prepare(`
					SELECT id, name, rating, comment, created_at
					FROM reviews
					WHERE approved = 1
					ORDER BY created_at DESC
					LIMIT 30
				`).all();
				return withSecurityHeaders(Response.json({ reviews: results }));
			}

			if (request.method === "POST") {
				if (request.headers.get("Content-Type")?.split(";")[0] !== "application/json") return withSecurityHeaders(Response.json({ error: "JSON is required." }, { status: 415 }));
				if (Number(request.headers.get("Content-Length") || 0) > 10000) return withSecurityHeaders(Response.json({ error: "Request is too large." }, { status: 413 }));
				let payload;
				try {
					payload = await request.json();
				} catch {
					return Response.json({ error: "Invalid request." }, { status: 400 });
				}

				const name = String(payload.name || "").trim().slice(0, 80);
				const comment = String(payload.comment || "").trim().slice(0, 600);
				const rating = Number(payload.rating);
				if (String(payload.website || "").trim()) return withSecurityHeaders(Response.json({ message: "Review submitted for approval." }, { status: 201 }));
				if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
					return withSecurityHeaders(Response.json({ error: "Please complete all review fields." }, { status: 400 }));
				}

				await env.DB.prepare(
					"INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)",
				).bind(name, rating, comment).run();
				return withSecurityHeaders(Response.json({ message: "Review submitted for approval." }, { status: 201 }));
			}
		}

		if (url.pathname === "/api/consultations") {
			if (!env.DB) return withSecurityHeaders(Response.json({ error: "Consultation database is not configured." }, { status: 503 }));
			if (request.method === "OPTIONS") return withSecurityHeaders(new Response(null, { status: 204 }));
			if (request.method !== "POST") return withSecurityHeaders(new Response("Method Not Allowed", { status: 405 }));
			if (origin && origin !== url.origin) return withSecurityHeaders(Response.json({ error: "Invalid origin." }, { status: 403 }));
			if (request.headers.get("Content-Type")?.split(";")[0] !== "application/json") return withSecurityHeaders(Response.json({ error: "JSON is required." }, { status: 415 }));
			if (Number(request.headers.get("Content-Length") || 0) > 10000) return withSecurityHeaders(Response.json({ error: "Request is too large." }, { status: 413 }));

			let payload;
			try {
				payload = await request.json();
			} catch {
				return withSecurityHeaders(Response.json({ error: "Invalid request." }, { status: 400 }));
			}

			if (String(payload.website || "").trim()) return withSecurityHeaders(Response.json({ message: "Consultation request received." }, { status: 201 }));
			const name = String(payload.name || "").trim().slice(0, 80);
			const countryCodeDigits = String(payload.countryCode || "").replace(/\D/g, "").slice(0, 15);
			const countryCode = countryCodeDigits ? `+${countryCodeDigits}` : "";
			const phone = String(payload.phone || "").trim().replace(/[^0-9\s().+-]/g, "").slice(0, 24);
			const email = String(payload.email || "").trim().slice(0, 160);
			const service = String(payload.service || "").trim().slice(0, 120);
			const language = String(payload.language || "ar").trim().slice(0, 12);
			const requestLocation = request.cf || {};
			const ipAddress = request.headers.get("CF-Connecting-IP") || "Unavailable";
			const visitorCountry = String(requestLocation.country || "").slice(0, 80);
			const visitorCity = String(requestLocation.city || "").slice(0, 120);
			const visitorRegion = String(requestLocation.region || "").slice(0, 120);
			const visitorLatitude = String(requestLocation.latitude || "").slice(0, 30);
			const visitorLongitude = String(requestLocation.longitude || "").slice(0, 30);
			const fullPhoneDigits = `${countryCode}${phone}`.replace(/\D/g, "");
			if (!name || !/^\+[0-9]{1,15}$/.test(countryCode) || fullPhoneDigits.length < 8 || fullPhoneDigits.length > 15 || (email && !/^\S+@\S+\.\S+$/.test(email)) || payload.consent !== true) {
				return withSecurityHeaders(Response.json({ error: "Please complete the required consultation fields." }, { status: 400 }));
			}

			await env.DB.prepare(`
				CREATE TABLE IF NOT EXISTS consultations (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					country_code TEXT NOT NULL,
					phone TEXT NOT NULL,
					email TEXT,
					service TEXT,
					created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			for (const column of [
				"ip_address TEXT", "visitor_country TEXT", "visitor_city TEXT", "visitor_region TEXT",
				"visitor_latitude TEXT", "visitor_longitude TEXT",
			]) {
				try {
					await env.DB.prepare(`ALTER TABLE consultations ADD COLUMN ${column}`).run();
				} catch {}
			}
			await env.DB.prepare(
				"INSERT INTO consultations (name, country_code, phone, email, service, ip_address, visitor_country, visitor_city, visitor_region, visitor_latitude, visitor_longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			).bind(name, countryCode, phone, email || null, service || null, ipAddress, visitorCountry || null, visitorCity || null, visitorRegion || null, visitorLatitude || null, visitorLongitude || null).run();

			const ownerEmail = env.CONSULTATION_OWNER_EMAIL || "ammar.h@auraenter.com";
			const subject = "New free consultation request";
			const ownerText = [
				"AURA ENTERPRISE - Consultation request",
				`Name: ${name}`,
				`Phone: ${countryCode} ${phone}`,
				`Email: ${email || "Not provided"}`,
				`Service: ${service || "General consultation"}`,
				`IP address: ${ipAddress}`,
				`Approximate location: ${[visitorCity, visitorRegion, visitorCountry].filter(Boolean).join(", ") || "Unavailable"}`,
				`Coordinates: ${visitorLatitude && visitorLongitude ? `${visitorLatitude}, ${visitorLongitude}` : "Unavailable"}`,
			].join("\n");
			await Promise.allSettled([
				sendBrevoEmail({ to: ownerEmail, subject, text: ownerText, replyTo: email || ownerEmail }),
				email ? sendBrevoEmail({
					to: email,
					subject: "Your consultation request was received",
					text: "Your consultation request was received successfully. The AURA ENTERPRISE team will contact you soon. This is an automated email; please do not reply.\n\nThank you for choosing AURA ENTERPRISE.",
				}) : Promise.resolve(false),
			]);
			return withSecurityHeaders(Response.json({ message: "Consultation request received." }, { status: 201 }));
		}

		const response = await env.ASSETS.fetch(request);

		const lastPathSegment = url.pathname.split("/").pop() || "";
		if (response.status === 404 && !lastPathSegment.includes(".")) {
			return withSecurityHeaders(await env.ASSETS.fetch(
				new Request(new URL("/Main-v6.html", request.url), request),
			));
		}

		return withSecurityHeaders(response);
	},
};
