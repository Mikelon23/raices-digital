import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { getCommunitiesForUser } from "./queries";

export async function getListings(session: SessionUser) {
  const communities = await getCommunitiesForUser(session);
  const communityIds = communities.map((c) => c.id);

  if (communityIds.length === 0) {
    return [];
  }

  return prisma.listing.findMany({
    where: {
      communityId: {
        in: communityIds,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      product: {
        select: {
          name: true,
          unit: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

