export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    // إذا كان الرابط الرئيسي أو الملف غير موجود، يعرض index.html
    if (response.status === 404 || url.pathname === "/") {
      return await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }
    return response;
  },
};
