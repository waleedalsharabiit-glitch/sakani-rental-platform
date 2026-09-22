"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(propertyId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      requiresLogin: true,
      message: "يجب تسجيل الدخول أولاً",
    };
  }

  const userId = session.user.id;

  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
    },
  });

  if (!property) {
    return {
      success: false,
      requiresLogin: false,
      message: "العقار غير موجود",
    };
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });

    revalidatePath("/properties");
    revalidatePath("/dashboard/favorites");
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      requiresLogin: false,
      favorite: false,
      message: "تمت إزالة العقار من المفضلة",
    };
  }

  await prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
  });

  revalidatePath("/properties");
  revalidatePath("/dashboard/favorites");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    requiresLogin: false,
    favorite: true,
    message: "تمت إضافة العقار إلى المفضلة",
  };
}