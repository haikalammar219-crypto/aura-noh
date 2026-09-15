export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const response = await env.ASSETS.fetch(request);

		if (response.status === 404 || url.pathname === "/") {
			return await env.ASSETS.fetch(
				new Request(new URL("/Main.html", request.url), request),
			);
		}

		return response;
	},
};
