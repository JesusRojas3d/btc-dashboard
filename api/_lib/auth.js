import { createHmac, timingSafeEqual } from "node:crypto";

const sessionCookieName = "btc_dashboard_session";
const sessionDurationSeconds = 60 * 60 * 24 * 30;
const sessionDurationMs = sessionDurationSeconds * 1000;
const profileCatalog = {
  jesus: { id: "jesus", name: "Jesus" },
  alzate: { id: "alzate", name: "Alzate" },
};

function encodeBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function secureCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function appendSetCookie(response, cookieValue) {
  const currentHeader = response.getHeader?.("Set-Cookie");

  if (!currentHeader) {
    response.setHeader("Set-Cookie", cookieValue);
    return;
  }

  const headerValues = Array.isArray(currentHeader) ? currentHeader : [currentHeader];
  response.setHeader("Set-Cookie", [...headerValues, cookieValue]);
}

function getSessionSecret() {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error("Falta configurar SESSION_SECRET");
  }

  return sessionSecret;
}

function getProfilePassword(profileId) {
  const envKey = `PROFILE_PASSWORD_${String(profileId || "").toUpperCase()}`;
  const password = process.env[envKey];

  if (!password) {
    throw new Error(`Falta configurar ${envKey}`);
  }

  return password;
}

function signPayload(encodedPayload) {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function parseCookies(request) {
  const rawCookieHeader = request.headers?.cookie || "";

  return rawCookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((cookies, chunk) => {
      const separatorIndex = chunk.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const cookieName = chunk.slice(0, separatorIndex).trim();
      const cookieValue = chunk.slice(separatorIndex + 1).trim();
      cookies[cookieName] = decodeURIComponent(cookieValue);
      return cookies;
    }, {});
}

function buildCookie(cookieValue, maxAgeSeconds) {
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(cookieValue)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isProduction) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function getProfileCatalog() {
  return profileCatalog;
}

export function validateProfileCredentials(profileId, password) {
  if (!profileCatalog[profileId]) {
    return false;
  }

  const expectedPassword = getProfilePassword(profileId);
  return secureCompare(expectedPassword, password);
}

export function createSession(profileId) {
  if (!profileCatalog[profileId]) {
    throw new Error("Perfil no valido");
  }

  const payload = {
    profileId,
    exp: Date.now() + sessionDurationMs,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readSession(request) {
  try {
    const cookies = parseCookies(request);
    const sessionToken = cookies[sessionCookieName];

    if (!sessionToken) {
      return null;
    }

    const [encodedPayload, providedSignature] = sessionToken.split(".");
    if (!encodedPayload || !providedSignature) {
      return null;
    }

    const expectedSignature = signPayload(encodedPayload);
    if (!secureCompare(expectedSignature, providedSignature)) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(encodedPayload));
    if (!profileCatalog[payload?.profileId]) {
      return null;
    }

    if (!Number.isFinite(payload?.exp) || payload.exp <= Date.now()) {
      return null;
    }

    return {
      profileId: payload.profileId,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(response, profileId) {
  appendSetCookie(response, buildCookie(createSession(profileId), sessionDurationSeconds));
}

export function clearSessionCookie(response) {
  appendSetCookie(response, buildCookie("", 0));
}

export function getAuthenticatedProfile(request) {
  const session = readSession(request);
  return session?.profileId ? profileCatalog[session.profileId] : null;
}

export function ensureAuthenticatedProfile(request, response, expectedProfileId) {
  const profile = getAuthenticatedProfile(request);

  if (!profile) {
    response.status(401).json({ error: "Sesion no valida" });
    return null;
  }

  if (expectedProfileId && profile.id !== expectedProfileId) {
    response.status(403).json({ error: "No tienes permiso para ese perfil" });
    return null;
  }

  return profile;
}

export function getSessionResponsePayload(request) {
  const profile = getAuthenticatedProfile(request);

  if (!profile) {
    return {
      authenticated: false,
      profile: null,
    };
  }

  return {
    authenticated: true,
    profile,
  };
}
