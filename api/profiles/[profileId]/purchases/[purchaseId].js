import { deletePurchase } from "../../../_lib/purchases-store.js";

function getProfileId(request) {
  return request.query?.profileId;
}

function getPurchaseId(request) {
  return request.query?.purchaseId;
}

export default async function handler(request, response) {
  if (request.method !== "DELETE") {
    response.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  try {
    const deleted = await deletePurchase(getProfileId(request), getPurchaseId(request));

    if (!deleted) {
      response.status(404).json({ error: "Compra no encontrada" });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
