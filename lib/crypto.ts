function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

function getHashSalt(): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "IP_HASH_SALT environment variable is required in production. " +
        "Generate one with: openssl rand -hex 32"
      );
    }
    // Dev-only fallback — never reaches production
    return "deeplinkos-dev-salt-changeme";
  }
  return salt;
}

export async function hashIp(ip: string) {
  const salt = getHashSalt();
  return (await sha256Hex(`${ip}:${salt}`)).slice(0, 16);
}

export async function hashPassword(password: string) {
  const salt = getHashSalt();
  return sha256Hex(`password:${password}:${salt}`);
}

export async function verifyPassword(password: string, expectedHash: string) {
  return (await hashPassword(password)) === expectedHash;
}
