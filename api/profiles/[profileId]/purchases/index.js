import { createPurchase, listPurchases } from "../../../_lib/purchases-store.js";

function getProfileId(request) {
  return request.query?.profileId;
}

export default async function handler(request, response) {
  const profileId = getProfileId(request);

  if (request.method === "GET") {
    try {
      const purchases = await listPurchases(profileId);
      response.status(200).json({ purchases });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
    return;
  }

  if (request.method === "POST") {
    try {
      const purchase = await createPurchase(profileId, request.body?.purchase);
      response.status(201).json({ purchase });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
    return;
  }

  response.status(405).json({ error: "Metodo no permitido" });
}
