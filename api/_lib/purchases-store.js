import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const seedPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../data/profile-purchases.seed.json");
const profileIds = ["jesus", "alzate"];

let pool;
let setupPromise;

function isValidProfileId(profileId) {
  return profileIds.includes(profileId);
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta configurar DATABASE_URL");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }

  return pool;
}

function normalizePurchase(rawPurchase) {
  if (!rawPurchase || typeof rawPurchase !== "object") {
    return null;
  }

  const normalizedPurchase = {
    id: String(rawPurchase.id || randomUUID()),
    profileId: String(rawPurchase.profileId || ""),
    date: rawPurchase.date,
    btc: Number(rawPurchase.btc),
    priceUsd: Number(rawPurchase.priceUsd || rawPurchase.purchaseBtcPriceUsd || rawPurchase.usd || 0),
  };

  if (
    !isValidProfileId(normalizedPurchase.profileId) ||
    !normalizedPurchase.date ||
    !Number.isFinite(normalizedPurchase.btc) ||
    normalizedPurchase.btc <= 0 ||
    !Number.isFinite(normalizedPurchase.priceUsd) ||
    normalizedPurchase.priceUsd <= 0
  ) {
    return null;
  }

  return normalizedPurchase;
}

function dedupePurchases(purchases) {
  const uniquePurchases = new Map();

  purchases.forEach((purchase) => {
    const normalizedPurchase = normalizePurchase(purchase);
    if (!normalizedPurchase) {
      return;
    }

    const purchaseKey = [
      normalizedPurchase.profileId,
      normalizedPurchase.date,
      Number(normalizedPurchase.btc).toFixed(8),
      Number(normalizedPurchase.priceUsd).toFixed(2),
    ].join("|");

    if (!uniquePurchases.has(purchaseKey)) {
      uniquePurchases.set(purchaseKey, normalizedPurchase);
    }
  });

  return Array.from(uniquePurchases.values()).sort((left, right) => {
    const leftTime = new Date(left.date).getTime();
    const rightTime = new Date(right.date).getTime();
    return rightTime - leftTime;
  });
}

async function readSeedPurchases() {
  const rawSeed = JSON.parse(await readFile(seedPath, "utf8"));
  const purchases = [];

  profileIds.forEach((profileId) => {
    const profilePurchases = Array.isArray(rawSeed?.[profileId]) ? rawSeed[profileId] : [];
    profilePurchases.forEach((purchase) => {
      purchases.push({
        ...purchase,
        profileId,
      });
    });
  });

  return dedupePurchases(purchases);
}

export async function ensurePurchasesSchema() {
  if (!setupPromise) {
    setupPromise = (async () => {
      const db = getPool();
      await db.query(`
        create table if not exists purchases (
          id text primary key,
          profile_id text not null,
          purchase_date timestamptz not null,
          btc numeric not null,
          price_usd numeric not null,
          created_at timestamptz not null default now()
        );
      `);
      await db.query(`
        create index if not exists purchases_profile_date_idx
        on purchases (profile_id, purchase_date desc);
      `);

      const { rows } = await db.query("select count(*)::int as count from purchases;");
      if (Number(rows[0]?.count || 0) === 0) {
        const seedPurchases = await readSeedPurchases();

        for (const purchase of seedPurchases) {
          await db.query(
            `
              insert into purchases (id, profile_id, purchase_date, btc, price_usd)
              values ($1, $2, $3, $4, $5)
              on conflict (id) do nothing;
            `,
            [
              purchase.id,
              purchase.profileId,
              purchase.date,
              purchase.btc,
              purchase.priceUsd,
            ],
          );
        }
      }
    })();
  }

  await setupPromise;
}

function mapRowToPurchase(row) {
  return {
    id: row.id,
    date: new Date(row.purchase_date).toISOString(),
    btc: Number(row.btc),
    priceUsd: Number(row.price_usd),
  };
}

export async function listPurchases(profileId) {
  if (!isValidProfileId(profileId)) {
    throw new Error("Perfil no valido");
  }

  await ensurePurchasesSchema();
  const db = getPool();
  const { rows } = await db.query(
    `
      select id, purchase_date, btc, price_usd
      from purchases
      where profile_id = $1
      order by purchase_date desc, created_at desc;
    `,
    [profileId],
  );
  return rows.map(mapRowToPurchase);
}

export async function createPurchase(profileId, purchase) {
  const normalizedPurchase = normalizePurchase({
    ...purchase,
    profileId,
  });

  if (!normalizedPurchase) {
    throw new Error("Compra invalida");
  }

  await ensurePurchasesSchema();
  const db = getPool();
  await db.query(
    `
      insert into purchases (id, profile_id, purchase_date, btc, price_usd)
      values ($1, $2, $3, $4, $5);
    `,
    [
      normalizedPurchase.id,
      normalizedPurchase.profileId,
      normalizedPurchase.date,
      normalizedPurchase.btc,
      normalizedPurchase.priceUsd,
    ],
  );

  return {
    id: normalizedPurchase.id,
    date: new Date(normalizedPurchase.date).toISOString(),
    btc: normalizedPurchase.btc,
    priceUsd: normalizedPurchase.priceUsd,
  };
}

export async function deletePurchase(profileId, purchaseId) {
  if (!isValidProfileId(profileId)) {
    throw new Error("Perfil no valido");
  }

  await ensurePurchasesSchema();
  const db = getPool();
  const result = await db.query(
    `
      delete from purchases
      where profile_id = $1 and id = $2;
    `,
    [profileId, purchaseId],
  );

  return result.rowCount > 0;
}
