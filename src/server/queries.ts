import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { Roles } from "@/config/roles";

export async function getCommunitiesForUser(session: SessionUser) {
  if (session.role === Roles.ADMIN) {
    return prisma.community.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });
  }

  return prisma.community.findMany({
    where: {
      isActive: true,
      memberships: {
        some: {
          userId: session.id,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });
}

export async function getCategories() {
  return prisma.productCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      category: true,
    },
  });
}

export async function getPriceQuotes(session: SessionUser) {
  const communities = await getCommunitiesForUser(session);

  const communityIds = communities.map((community) => community.id);

  if (communityIds.length === 0) {
    return [];
  }

  return prisma.priceQuote.findMany({
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
      product: true,
      community: true,
      reportedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function isCommunityAllowed(
  session: SessionUser,
  communityId: string
): Promise<boolean> {
  if (session.role === Roles.ADMIN) {
    const count = await prisma.community.count({
      where: {
        id: communityId,
        isActive: true,
      },
    });

    return count > 0;
  }

  const count = await prisma.membership.count({
    where: {
      userId: session.id,
      communityId,
    },
  });

  return count > 0;
}
