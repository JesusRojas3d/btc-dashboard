import { fetchBitcoinNews } from "./_lib/news-feed.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    const news = await fetchBitcoinNews();
    response.status(200).json(news);
  } catch (error) {
    response.status(502).json({ error: error.message });
  }
}
