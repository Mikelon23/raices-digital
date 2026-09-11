import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/config/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Credenciales inválidas.",
        },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive || !user.passwordHash) {
      return NextResponse.json(
        {
          ok: false,
          error: "Credenciales inválidas.",
        },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          ok: false,
          error: "Credenciales inválidas.",
        },
        { status: 401 }
      );
    }

    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Falta configurar AUTH_SECRET.",
        },
        { status: 500 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      name: user.name,
      email: user.email,
      role: user.role,
    })
      .setSubject(user.id)
      .setIssuedAt(now)
      .setExpirationTime(now + SESSION_MAX_AGE_SECONDS)
      .sign(new TextEncoder().encode(secret));

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error de servidor.",
      },
      { status: 500 }
    );
  }
}
