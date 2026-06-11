import { getProfileCatalog, setSessionCookie, validateProfileCredentials } from "../_lib/auth.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    const profileId = String(request.body?.profileId || "").trim().toLowerCase();
    const password = String(request.body?.password || "");

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
    response.status(500).json({ error: error.message || "No se pudo iniciar sesion" });
  }
}
