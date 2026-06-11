import { fetchUsdCopRate } from "./_lib/usd-cop-rate.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    const rate = await fetchUsdCopRate();
    response.status(200).json(rate);
  } catch (error) {
    response.status(502).json({ error: error.message || "No se pudo cargar USD/COP" });
  }
}
