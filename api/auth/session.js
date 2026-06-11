import { getSessionResponsePayload } from "../_lib/auth.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  response.status(200).json(getSessionResponsePayload(request));
}
