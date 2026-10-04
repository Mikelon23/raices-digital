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

export async function getActiveListings(session: SessionUser) {
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
      status: "OPEN",
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

export async function isListingAllowed(
  session: SessionUser,
  listingId: string
): Promise<boolean> {
  const communities = await getCommunitiesForUser(session);
  const communityIds = communities.map((c) => c.id);

  const count = await prisma.listing.count({
    where: {
      id: listingId,
      communityId: {
        in: communityIds,
      },
    },
  });

  return count > 0;
}
