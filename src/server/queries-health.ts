import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { Roles } from "@/config/roles";
import { getCommunitiesForUser } from "./queries";

export async function getHealthFacilities(session: SessionUser) {
  const communities = await getCommunitiesForUser(session);
  const communityIds = communities.map((c) => c.id);

  if (communityIds.length === 0) {
    return [];
  }

  return prisma.healthFacility.findMany({
    where: {
      communityId: {
        in: communityIds,
      },
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      community: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getHealthReferrals(session: SessionUser) {
  const communities = await getCommunitiesForUser(session);
  const communityIds = communities.map((c) => c.id);

  if (communityIds.length === 0) {
    return [];
  }

  return prisma.healthReferral.findMany({
    where: {
      facility: {
        communityId: {
          in: communityIds,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      facility: {
        select: {
          name: true,
          community: {
            select: {
              name: true,
            },
          },
        },
      },
      agent: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function isFacilityAllowed(
  session: SessionUser,
  facilityId: string
): Promise<boolean> {
  const communities = await getCommunitiesForUser(session);
  const communityIds = communities.map((c) => c.id);

  const count = await prisma.healthFacility.count({
    where: {
      id: facilityId,
      communityId: {
        in: communityIds,
      },
    },
  });

  return count > 0;
}
