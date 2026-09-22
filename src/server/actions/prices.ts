"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canCreatePriceQuote } from "@/config/permissions";
import type { Role } from "@/config/roles";
import { isCommunityAllowed } from "@/server/queries";

const priceQuoteSchema = z.object({
  productId: z.string().min(1),
  communityId: z.string().min(1),
  price: z.coerce.number().positive(),
  currency: z.string().min(1).default("LOCAL"),
  source: z.string().optional(),
});

export async function createPriceQuote(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canCreatePriceQuote(session.role as Role)) {
    redirect("/dashboard/prices?error=forbidden");
  }

  const rawProductId = String(formData.get("productId") ?? "").trim();
  const rawCommunityId = String(formData.get("communityId") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();
  const rawCurrency = String(formData.get("currency") ?? "").trim();
  const rawSource = String(formData.get("source") ?? "").trim();

  const parsed = priceQuoteSchema.safeParse({
    productId: rawProductId,
    communityId: rawCommunityId,
    price: rawPrice,
    currency: rawCurrency || undefined,
    source: rawSource || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard/prices?error=validation");
  }

  const communityAllowed = await isCommunityAllowed(
    session,
    parsed.data.communityId
  );

  if (!communityAllowed) {
    redirect("/dashboard/prices?error=community");
  }

  const productCount = await prisma.product.count({
    where: {
      id: parsed.data.productId,
    },
  });

  if (productCount === 0) {
    redirect("/dashboard/prices?error=product");
  }

  try {
    await prisma.priceQuote.create({
      data: {
        productId: parsed.data.productId,
        communityId: parsed.data.communityId,
        price: parsed.data.price,
        currency: parsed.data.currency,
        source: parsed.data.source,
        reportedById: session.id,
      },
    });
  } catch {
    redirect("/dashboard/prices?error=db");
  }

  revalidatePath("/dashboard/prices");
  revalidatePath("/dashboard");

  redirect("/dashboard/prices?created=1");
}
