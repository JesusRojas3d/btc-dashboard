import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const privateSeedPath = resolve(__dirname, "../data/profile-purchases.private.json");
const defaultBaseUrl = "https://btc-dashboard-live-2.vercel.app";
const profileIds = ["jesus", "alzate"];

function normalizeBaseUrl(value) {
  return String(value || defaultBaseUrl).trim().replace(/\/+$/, "");
}

async function readPrivatePurchases() {
  const rawContent = await readFile(privateSeedPath, "utf8");
  const parsedContent = JSON.parse(rawContent);

  return profileIds.reduce((accumulator, profileId) => {
    accumulator[profileId] = Array.isArray(parsedContent?.[profileId]) ? parsedContent[profileId] : [];
    return accumulator;
  }, {});
}

async function askPassword(question) {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(question);
    return String(answer || "").trim();
  } finally {
    rl.close();
  }
}

async function loginAndGetCookie(baseUrl, profileId, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      profileId,
      password,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Login ${profileId}: ${response.status} ${responseText || "Sin detalle"}`);
  }

  const setCookieHeaders =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);

  const cookieHeader = setCookieHeaders
    .map((cookieValue) => String(cookieValue).split(";")[0])
    .filter(Boolean)
    .join("; ");

  if (!cookieHeader) {
    throw new Error(`Login ${profileId}: no llegó cookie de sesión`);
  }

  return cookieHeader;
}

async function replaceRemotePurchases(baseUrl, profileId, purchases, cookieHeader) {
  const response = await fetch(`${baseUrl}/api/purchases?profileId=${encodeURIComponent(profileId)}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader,
    },
    body: JSON.stringify({ purchases }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Restore ${profileId}: ${response.status} ${responseText || "Sin detalle"}`);
  }

  try {
    const payload = JSON.parse(responseText);
    return Array.isArray(payload?.purchases) ? payload.purchases.length : purchases.length;
  } catch {
    return purchases.length;
  }
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.argv[2]);
  const privatePurchases = await readPrivatePurchases();

  console.log(`Restaurando compras hacia ${baseUrl}`);
  console.log(`Archivo usado: ${privateSeedPath}`);

  for (const profileId of profileIds) {
    const envKey = `PROFILE_PASSWORD_${profileId.toUpperCase()}`;
    const password =
      process.env[envKey] ||
      (await askPassword(`Contraseña para ${profileId}: `));

    if (!password) {
      throw new Error(`Falta la contraseña de ${profileId}`);
    }

    const purchases = privatePurchases[profileId];
    const cookieHeader = await loginAndGetCookie(baseUrl, profileId, password);
    const restoredCount = await replaceRemotePurchases(baseUrl, profileId, purchases, cookieHeader);
    console.log(`Perfil ${profileId}: ${restoredCount} compras restauradas`);
  }

  console.log("Listo. Ya puedes refrescar el dashboard.");
}

main().catch((error) => {
  console.error(`Error restaurando compras: ${error.message}`);
  process.exitCode = 1;
});
