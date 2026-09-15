export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/api/reviews") {
			if (!env.DB) {
				return Response.json({ error: "Reviews database is not configured." }, { status: 503 });
			}

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
				return Response.json({ reviews: results });
			}

			if (request.method === "POST") {
				let payload;
				try {
					payload = await request.json();
				} catch {
					return Response.json({ error: "Invalid request." }, { status: 400 });
				}

				const name = String(payload.name || "").trim().slice(0, 80);
				const comment = String(payload.comment || "").trim().slice(0, 600);
				const rating = Number(payload.rating);
				if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
					return Response.json({ error: "Please complete all review fields." }, { status: 400 });
				}

				await env.DB.prepare(
					"INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)",
				).bind(name, rating, comment).run();
				return Response.json({ message: "Review submitted for approval." }, { status: 201 });
			}

			return new Response("Method Not Allowed", { status: 405 });
		}

		const response = await env.ASSETS.fetch(request);

		if (response.status === 404 || url.pathname === "/") {
			return await env.ASSETS.fetch(
				new Request(new URL("/Main-v4.html", request.url), request),
			);
		}

		return response;
	},
};
