import { SignJWT, jwtVerify } from "jose";

const secret = process.env.MOBILE_AUTH_SECRET;

if (!secret) {
  throw new Error("MOBILE_AUTH_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

export type MobileTokenPayload = {
  userId: string;
  role: string;
};

export async function createMobileAccessToken(
  payload: MobileTokenPayload
) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyMobileAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);

  return {
    userId: String(payload.userId),
    role: String(payload.role),
  };
}