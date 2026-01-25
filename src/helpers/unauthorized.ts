import http from "node:http";

export function unauthorized() {
  const response = new Response(null, {
    status: Number(http.STATUS_CODES["unauthorized"]),
    statusText: "Unauthorized",
  });
  throw response;
}
