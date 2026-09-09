import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/config/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: String(payload.sub),
      name: String(payload.name ?? ""),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}