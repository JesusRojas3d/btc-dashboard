import {
  createPurchase,
  deletePurchase,
  listPurchases,
  replacePurchases,
} from "./_lib/purchases-store.js";
import { ensureAuthenticatedProfile } from "./_lib/auth.js";

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

function getStringQueryValue(queryValue) {
  if (Array.isArray(queryValue)) {
    return String(queryValue[0] || "");
  }

  return String(queryValue || "");
}

export default async function handler(request, response) {
  const profileId = getStringQueryValue(request.query?.profileId).trim().toLowerCase();

  if (!profileId) {
    response.status(400).json({ error: "Falta profileId" });
    return;
  }

  if (!ensureAuthenticatedProfile(request, response, profileId)) {
    return;
  }

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
      const body = await readRequestBody(request);
      const purchase = await createPurchase(profileId, body?.purchase);
      response.status(201).json({ purchase });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
    return;
  }

  if (request.method === "PUT") {
    try {
      const body = await readRequestBody(request);
      const purchases = await replacePurchases(profileId, body?.purchases);
      response.status(200).json({ purchases });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
    return;
  }

  if (request.method === "DELETE") {
    try {
      const purchaseId = getStringQueryValue(request.query?.purchaseId).trim();

      if (!purchaseId) {
        response.status(400).json({ error: "Falta purchaseId" });
        return;
      }

      const removed = await deletePurchase(profileId, purchaseId);
      response.status(200).json({ removed });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
    return;
  }

  response.status(405).json({ error: "Metodo no permitido" });
}
