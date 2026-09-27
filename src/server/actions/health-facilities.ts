"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canUpdateHealthFacilities } from "@/config/permissions";
import type { Role } from "@/config/roles";
import { isCommunityAllowed } from "@/server/queries";

const healthFacilitySchema = z.object({
  name: z.string().min(3),
  type: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  communityId: z.string().min(1),
});

export async function createHealthFacility(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canUpdateHealthFacilities(session.role as Role)) {
    redirect("/dashboard/health/facilities?error=forbidden");
  }

  const rawName = String(formData.get("name") ?? "").trim();
  const rawType = String(formData.get("type") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const rawAddress = String(formData.get("address") ?? "").trim();
  const rawCommunityId = String(formData.get("communityId") ?? "").trim();

  const parsed = healthFacilitySchema.safeParse({
    name: rawName,
    type: rawType,
    phone: rawPhone || undefined,
    address: rawAddress || undefined,
    communityId: rawCommunityId,
  });

  if (!parsed.success) {
    redirect("/dashboard/health/facilities?error=validation");
  }

  const communityAllowed = await isCommunityAllowed(
    session,
    parsed.data.communityId
  );

  if (!communityAllowed) {
    redirect("/dashboard/health/facilities?error=community");
  }

  try {
    await prisma.healthFacility.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        phone: parsed.data.phone,
        address: parsed.data.address,
        communityId: parsed.data.communityId,
        isActive: true,
      },
    });
  } catch {
    redirect("/dashboard/health/facilities?error=db");
  }

  revalidatePath("/dashboard/health/facilities");
  revalidatePath("/dashboard/health");
  revalidatePath("/dashboard");

  redirect("/dashboard/health/facilities?created=1");
}
