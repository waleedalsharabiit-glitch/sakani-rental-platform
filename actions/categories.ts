"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

type CategoryActionState = {
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

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  };

  const result = categorySchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "يرجى التأكد من صحة البيانات",
    };
  }

  const data = result.data;

  const existingName = await prisma.category.findUnique({
    where: {
      name: data.name,
    },
  });

  if (existingName) {
    return {
      success: false,
      message: "اسم التصنيف مستخدم بالفعل",
    };
  }

  const existingSlug = await prisma.category.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSlug) {
    return {
      success: false,
      message: "الرابط المختصر مستخدم بالفعل",
    };
  }

  await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/properties/new");

  return {
    success: true,
    message: "تمت إضافة التصنيف بنجاح",
  };
}

export async function updateCategory(
  id: string,
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  };

  const result = categorySchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ??
        "يرجى التأكد من صحة البيانات",
    };
  }

  const data = result.data;

  const existingName = await prisma.category.findFirst({
    where: {
      name: data.name,
      NOT: {
        id,
      },
    },
  });

  if (existingName) {
    return {
      success: false,
      message: "اسم التصنيف مستخدم بالفعل",
    };
  }

  const existingSlug = await prisma.category.findFirst({
    where: {
      slug: data.slug,
      NOT: {
        id,
      },
    },
  });

  if (existingSlug) {
    return {
      success: false,
      message: "الرابط المختصر مستخدم بالفعل",
    };
  }

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return {
      success: false,
      message: "التصنيف غير موجود",
    };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/properties/new");

  return {
    success: true,
    message: "تم تعديل التصنيف بنجاح",
  };
}

export async function deleteCategory(
  id: string
): Promise<CategoryActionState> {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          properties: true,
        },
      },
    },
  });

  if (!category) {
    return {
      success: false,
      message: "التصنيف غير موجود",
    };
  }

  if (category._count.properties > 0) {
    return {
      success: false,
      message:
        "لا يمكن حذف هذا التصنيف لأنه مرتبط بعقارات موجودة",
    };
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/properties/new");

  return {
    success: true,
    message: "تم حذف التصنيف بنجاح",
  };
}