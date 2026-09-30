"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canUpdateReferralStatus } from "@/config/permissions";
import type { Role } from "@/config/roles";

const updateStatusSchema = z.object({
  referralId: z.string().min(1),
  status: z.enum(["OPEN", "URGENT", "ATTENDED", "CLOSED"]),
});

export async function updateReferralStatus(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canUpdateReferralStatus(session.role as Role)) {
    redirect("/dashboard/health/referrals?error=forbidden");
  }

  const rawReferralId = String(formData.get("referralId") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "").trim();

  const parsed = updateStatusSchema.safeParse({
    referralId: rawReferralId,
    status: rawStatus,
  });

  if (!parsed.success) {
    redirect("/dashboard/health/referrals?error=validation");
  }

  try {
    await prisma.healthReferral.update({
      where: {
        id: parsed.data.referralId,
      },
      data: {
        status: parsed.data.status,
      },
    });
  } catch {
    redirect("/dashboard/health/referrals?error=db");
  }

  revalidatePath("/dashboard/health/referrals");
  revalidatePath("/dashboard/health");

  redirect("/dashboard/health/referrals?updated=1");
}
