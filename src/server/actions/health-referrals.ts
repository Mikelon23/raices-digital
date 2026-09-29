"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canCreateHealthReferral } from "@/config/permissions";
import type { Role } from "@/config/roles";
import { isFacilityAllowed } from "@/server/queries-health";

const healthReferralSchema = z.object({
  facilityId: z.string().min(1),
  personName: z.string().min(2),
  personPhone: z.string().optional(),
  reason: z.string().min(5),
  status: z.enum(["OPEN", "URGENT", "ATTENDED", "CLOSED"]).default("OPEN"),
  notes: z.string().optional(),
});

export async function createHealthReferral(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canCreateHealthReferral(session.role as Role)) {
    redirect("/dashboard/health/referrals?error=forbidden");
  }

  const rawFacilityId = String(formData.get("facilityId") ?? "").trim();
  const rawPersonName = String(formData.get("personName") ?? "").trim();
  const rawPersonPhone = String(formData.get("personPhone") ?? "").trim();
  const rawReason = String(formData.get("reason") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "OPEN").trim();
  const rawNotes = String(formData.get("notes") ?? "").trim();

  const parsed = healthReferralSchema.safeParse({
    facilityId: rawFacilityId,
    personName: rawPersonName,
    personPhone: rawPersonPhone || undefined,
    reason: rawReason,
    status: rawStatus,
    notes: rawNotes || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard/health/referrals?error=validation");
  }

  const facilityAllowed = await isFacilityAllowed(
    session,
    parsed.data.facilityId
  );

  if (!facilityAllowed) {
    redirect("/dashboard/health/referrals?error=facility");
  }

  try {
    await prisma.healthReferral.create({
      data: {
        facilityId: parsed.data.facilityId,
        agentId: session.id,
        personName: parsed.data.personName,
        personPhone: parsed.data.personPhone,
        reason: parsed.data.reason,
        status: parsed.data.status,
        notes: parsed.data.notes,
      },
    });
  } catch {
    redirect("/dashboard/health/referrals?error=db");
  }

  revalidatePath("/dashboard/health/referrals");
  revalidatePath("/dashboard/health");
  revalidatePath("/dashboard");

  redirect("/dashboard/health/referrals?created=1");
}
