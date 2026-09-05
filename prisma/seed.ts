import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@raices.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const agentPasswordHash = await bcrypt.hash("Agent123!", 10);
  const producerPasswordHash = await bcrypt.hash("Producer123!", 10);
  const buyerPasswordHash = await bcrypt.hash("Buyer123!", 10);

  const community = await prisma.community.upsert({
    where: { slug: "comunidad-piloto" },
    update: {},
    create: {
      name: "Comunidad Piloto",
      slug: "comunidad-piloto",
      region: "Local",
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador Raíces",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agente@raices.local" },
    update: {},
    create: {
      name: "Agente Comunitario",
      email: "agente@raices.local",
      passwordHash: agentPasswordHash,
      role: "COMMUNITY_AGENT",
      isActive: true,
    },
  });

  const producer = await prisma.user.upsert({
    where: { email: "productor@raices.local" },
    update: {},
    create: {
      name: "Productor Local",
      email: "productor@raices.local",
      passwordHash: producerPasswordHash,
      role: "PRODUCER",
      isActive: true,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "comprador@raices.local" },
    update: {},
    create: {
      name: "Comprador Local",
      email: "comprador@raices.local",
      passwordHash: buyerPasswordHash,
      role: "BUYER",
      isActive: true,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_communityId: {
        userId: agent.id,
        communityId: community.id,
      },
    },
    update: {},
    create: {
      userId: agent.id,
      communityId: community.id,
      communityRole: "AGENT",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_communityId: {
        userId: producer.id,
        communityId: community.id,
      },
    },
    update: {},
    create: {
      userId: producer.id,
      communityId: community.id,
      communityRole: "MEMBER",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_communityId: {
        userId: buyer.id,
        communityId: community.id,
      },
    },
    update: {},
    create: {
      userId: buyer.id,
      communityId: community.id,
      communityRole: "MEMBER",
    },
  });

  const categories = ["Granitos", "Hortalizas", "Frutas"];

  for (const name of categories) {
    await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const products = [
    { name: "Maíz", unit: "kg", category: "Granitos" },
    { name: "Frijol", unit: "kg", category: "Granitos" },
    { name: "Tomate", unit: "kg", category: "Hortalizas" },
    { name: "Cebolla", unit: "kg", category: "Hortalizas" },
    { name: "Manzana", unit: "kg", category: "Frutas" },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        name_unit: {
          name: product.name,
          unit: product.unit,
        },
      },
      update: {},
      create: {
        name: product.name,
        unit: product.unit,
        category: {
          connect: {
            name: product.category,
          },
        },
      },
    });
  }

  await prisma.healthFacility.upsert({
    where: { id: "seed-health-facility" },
    update: {},
    create: {
      id: "seed-health-facility",
      name: "Centro de Salud Piloto",
      type: "CLINIC",
      phone: "000000000",
      address: "Centro comunitario",
      communityId: community.id,
      isActive: true,
    },
  });

  const priceCount = await prisma.priceQuote.count();

  if (priceCount === 0) {
    const maize = await prisma.product.findUnique({
      where: {
        name_unit: {
          name: "Maíz",
          unit: "kg",
        },
      },
    });

    if (maize) {
      await prisma.priceQuote.create({
        data: {
          productId: maize.id,
          communityId: community.id,
          price: 18.5,
          currency: "LOCAL",
          source: "SEED",
          reportedById: agent.id,
        },
      });
    }
  }

  console.log("Seed completado correctamente.");
  console.log("Usuarios de prueba creados:");
  console.log(`Admin: ${admin.email}`);
  console.log(`Agente: ${agent.email}`);
  console.log(`Productor: ${producer.email}`);
  console.log(`Comprador: ${buyer.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  