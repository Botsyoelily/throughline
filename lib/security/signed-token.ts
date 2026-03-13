function encodeBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function decodeBase64UrlToBytes(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

export async function signTokenPayload(payload: string, secret: string) {
  const key = await importHmacKey(secret, "sign");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  let binary = "";

  new Uint8Array(signature).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function createSignedToken<T>(payload: T, secret: string) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signTokenPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySignedToken<T>(token: string, secret: string) {
  const [payloadPart, signaturePart] = token.split(".");

  if (!payloadPart || !signaturePart) {
    return null;
  }

  const key = await importHmacKey(secret, "verify");
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    decodeBase64UrlToBytes(signaturePart),
    new TextEncoder().encode(payloadPart)
  );

  if (!isValid) {
    return null;
  }

  return JSON.parse(decodeBase64Url(payloadPart)) as T;
}
