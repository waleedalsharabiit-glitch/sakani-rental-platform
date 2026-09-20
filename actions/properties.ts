"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { propertySchema } from "@/lib/validations/property";
import { revalidatePath } from "next/cache";

type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح لك بتنفيذ هذه العملية");
  }

  return session;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseFormData(formData: FormData) {
  return {
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    description: getString(formData, "description"),
    price: getString(formData, "price"),
    address: getString(formData, "address"),
    city: getString(formData, "city"),
    latitude: getString(formData, "latitude"),
    longitude: getString(formData, "longitude"),
    ownerId: getString(formData, "ownerId"),
    categoryId: getString(formData, "categoryId"),
  };
}

/* =========================
   إنشاء عقار
========================= */

export async function createProperty(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const rawData = parseFormData(formData);

    const result = propertySchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        message: "يرجى تصحيح البيانات المدخلة",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const data = result.data;

    const existingSlug = await prisma.property.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingSlug) {
      return {
        success: false,
        message: "هذا الرابط مستخدم لعقار آخر",
        errors: {
          slug: ["اختر رابطًا مختلفًا"],
        },
      };
    }

    await prisma.property.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        address: data.address,
        city: data.city,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        ownerId: data.ownerId,
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/admin/properties");

    return {
      success: true,
      message: "تم إنشاء العقار بنجاح",
    };
  } catch (error) {
    console.error("CREATE_PROPERTY_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء إنشاء العقار",
    };
  }
}

/* =========================
   تعديل عقار
========================= */

export async function updateProperty(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const id = getString(formData, "id");

    if (!id) {
      return {
        success: false,
        message: "معرّف العقار غير موجود",
      };
    }

    const rawData = parseFormData(formData);

    const result = propertySchema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        message: "يرجى تصحيح البيانات المدخلة",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const data = result.data;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return {
        success: false,
        message: "العقار غير موجود",
      };
    }

    const slugOwner = await prisma.property.findFirst({
      where: {
        slug: data.slug,
        NOT: {
          id,
        },
      },
    });

    if (slugOwner) {
      return {
        success: false,
        message: "هذا الرابط مستخدم لعقار آخر",
        errors: {
          slug: ["اختر رابطًا مختلفًا"],
        },
      };
    }

    await prisma.property.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        address: data.address,
        city: data.city,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        ownerId: data.ownerId,
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}/edit`);
    revalidatePath(`/properties/${id}`);

    return {
      success: true,
      message: "تم تحديث العقار بنجاح",
    };
  } catch (error) {
    console.error("UPDATE_PROPERTY_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء تحديث العقار",
    };
  }
}

/* =========================
   حذف عقار
========================= */

export async function deleteProperty(id: string) {
  try {
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        message: "معرّف العقار غير موجود",
      };
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!property) {
      return {
        success: false,
        message: "العقار غير موجود",
      };
    }

    await prisma.property.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/properties");

    return {
      success: true,
      message: "تم حذف العقار بنجاح",
    };
  } catch (error) {
    console.error("DELETE_PROPERTY_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء حذف العقار",
    };
  }
}