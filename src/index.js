export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const origin = request.headers.get("Origin");
		const responseHeaders = {
			"X-Content-Type-Options": "nosniff",
			"X-Frame-Options": "DENY",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
			"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
		};
		const withSecurityHeaders = response => {
			const headers = new Headers(response.headers);
			Object.entries(responseHeaders).forEach(([key, value]) => headers.set(key, value));
			if (url.protocol === "https:") headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
			return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
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
			const countryCode = String(payload.countryCode || "").trim().slice(0, 8);
			const phone = String(payload.phone || "").trim().replace(/[^0-9\s().+-]/g, "").slice(0, 24);
			const email = String(payload.email || "").trim().slice(0, 160);
			const service = String(payload.service || "").trim().slice(0, 120);
			if (!name || !/^\+[0-9]{1,4}$/.test(countryCode) || phone.replace(/\D/g, "").length < 6 || (email && !/^\S+@\S+\.\S+$/.test(email)) || payload.consent !== true) {
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
			await env.DB.prepare(
				"INSERT INTO consultations (name, country_code, phone, email, service) VALUES (?, ?, ?, ?, ?)",
			).bind(name, countryCode, phone, email || null, service || null).run();
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
