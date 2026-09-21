"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageCommunities } from "@/config/permissions";
import type { Role } from "@/config/roles";
import { slugify } from "@/lib/utils";

const communitySchema = z.object({
  name: z.string().min(3),
  region: z.string().optional(),
});

export async function createCommunity(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageCommunities(session.role as Role)) {
    redirect("/dashboard/communities?error=forbidden");
  }

  const rawName = String(formData.get("name") ?? "").trim();
  const rawRegion = String(formData.get("region") ?? "").trim();

  const parsed = communitySchema.safeParse({
    name: rawName,
    region: rawRegion || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard/communities?error=validation");
  }

  const slugBase = slugify(parsed.data.name);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  try {
    await prisma.community.create({
      data: {
        name: parsed.data.name,
        region: parsed.data.region,
        slug,
        isActive: true,
      },
    });
  } catch {
    redirect("/dashboard/communities?error=db");
  }

  revalidatePath("/dashboard/communities");
  revalidatePath("/dashboard");

  redirect("/dashboard/communities?created=1");
}
