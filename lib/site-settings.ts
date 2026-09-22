import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: {
      id: "site",
    },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "site",
      },
    });
  }

  return settings;
}