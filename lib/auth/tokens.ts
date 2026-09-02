import { jwtVerify, SignJWT } from "jose";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type TokenPayload = {
  sub: string;
};

async function sign(payload: TokenPayload, ttl: string): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(getSecret());
}

export function signAccessToken(userId: string): Promise<string> {
  return sign({ sub: userId }, ACCESS_TOKEN_TTL);
}

export function signRefreshToken(userId: string): Promise<string> {
  return sign({ sub: userId }, REFRESH_TOKEN_TTL);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
