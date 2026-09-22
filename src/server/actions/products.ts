"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageCatalog } from "@/config/permissions";
import type { Role } from "@/config/roles";

const productSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  categoryId: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageCatalog(session.role as Role)) {
    redirect("/dashboard/products?error=forbidden");
  }

  const rawName = String(formData.get("name") ?? "").trim();
  const rawUnit = String(formData.get("unit") ?? "").trim();
  const rawCategoryId = String(formData.get("categoryId") ?? "").trim();

  const parsed = productSchema.safeParse({
    name: rawName,
    unit: rawUnit,
    categoryId: rawCategoryId || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard/products?error=validation");
  }

  try {
    await prisma.product.create({
      data: {
        name: parsed.data.name,
        unit: parsed.data.unit,
        ...(parsed.data.categoryId
          ? {
              category: {
                connect: {
                  id: parsed.data.categoryId,
                },
              },
            }
          : {}),
      },
    });
  } catch {
    redirect("/dashboard/products?error=db");
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");

  redirect("/dashboard/products?created=1");
}
