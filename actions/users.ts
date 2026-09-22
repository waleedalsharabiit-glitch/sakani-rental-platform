"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type UserActionState = {
  success: boolean;
  message: string;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

export async function updateUserRole(
  formData: FormData
): Promise<void> {
  const session = await requireAdmin();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || !userId) {
    return;
  }

  if (role !== "USER" && role !== "ADMIN") {
    return;
  }

  if (session.user.id === userId && role !== "ADMIN") {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function deleteUser(
  formData: FormData
): Promise<void> {
  const session = await requireAdmin();

  const userId = formData.get("userId");

  if (typeof userId !== "string" || !userId) {
    return;
  }

  if (session.user.id === userId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      _count: {
        select: {
          properties: true,
          bookings: true,
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  if (!user) {
    return;
  }

  if (user._count.properties > 0) {
    return;
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}