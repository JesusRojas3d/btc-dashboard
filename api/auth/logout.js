import { clearSessionCookie } from "../_lib/auth.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  clearSessionCookie(response);
  response.status(200).json({ ok: true });
}
