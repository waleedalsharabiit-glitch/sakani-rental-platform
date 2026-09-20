import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@sakani.com",
    },
    update: {
      role: "ADMIN",
      password,
      name: "مدير سَكَني",
    },
    create: {
      name: "مدير سَكَني",
      email: "admin@sakani.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });