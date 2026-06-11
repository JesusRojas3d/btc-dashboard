import { getProfileCatalog, setSessionCookie, validateProfileCredentials } from "../_lib/auth.js";

async function readRequestBody(request) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const profileId = String(body?.profileId || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!getProfileCatalog()[profileId]) {
      response.status(404).json({ error: "Perfil no encontrado" });
      return;
    }

    if (!validateProfileCredentials(profileId, password)) {
      response.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

    setSessionCookie(response, profileId);
    response.status(200).json({
      authenticated: true,
      profile: getProfileCatalog()[profileId],
    });
  } catch (error) {
    response.status(500).json({
      error: `Login error: ${error?.message || String(error) || "No se pudo iniciar sesion"}`,
    });
  }
}
