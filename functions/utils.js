export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function newId(length = 12) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function checkAuth(request, env) {
  const auth = request.headers.get("Authorization");
  const token = env.ADMIN_TOKEN || "admin-secret-token-12345";
  if (!auth || auth !== `Bearer ${token}`) {
    return false;
  }
  return true;
}
