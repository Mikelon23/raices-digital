import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [users, communities, products, facilities] = await Promise.all([
      prisma.user.count(),
      prisma.community.count(),
      prisma.product.count(),
      prisma.healthFacility.count(),
    ]);

    return NextResponse.json({
      ok: true,
      service: "raices-digital",
      database: "connected",
      timestamp: new Date().toISOString(),
      counters: {
        users,
        communities,
        products,
        facilities,
      },
    });
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        ok: false,
        service: "raices-digital",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}