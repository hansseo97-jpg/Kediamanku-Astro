const ADMIN_PATHS = ["/admin", "/admin/"];

function isAdminPath(pathname) {
  return ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}blog/`));
}

function cookieValue(cookieHeader, name) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function onRequest(context, next) {
  const { request, url } = context;
  const responseHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Robots-Tag": "noindex, nofollow",
  };

  if (!isAdminPath(url.pathname)) {
    return next();
  }

  const adminRouteToken = import.meta.env.ADMIN_ROUTE_TOKEN || globalThis.process?.env?.ADMIN_ROUTE_TOKEN;
  if (adminRouteToken) {
    const headerToken = request.headers.get("x-admin-route-token");
    const cookieToken = cookieValue(request.headers.get("cookie"), "kediamanku_admin_gate");
    if (headerToken !== adminRouteToken && cookieToken !== adminRouteToken) {
      return new Response("Admin route locked.", {
        status: 401,
        headers: responseHeaders,
      });
    }
  }

  const response = await next();
  Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}
