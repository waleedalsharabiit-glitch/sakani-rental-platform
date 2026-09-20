"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح");
  }

  return session;
}

export async function uploadPropertyImage(
  propertyId: string,
  formData: FormData
) {
  try {
    await requireAdmin();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return {
        success: false,
        message: "العقار غير موجود",
      };
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        success: false,
        message: "لم يتم اختيار صورة",
      };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        message: "الملف يجب أن يكون صورة",
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: "حجم الصورة يجب ألا يتجاوز 5MB",
      };
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "properties"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    const imageCount = await prisma.image.count({
      where: {
        propertyId,
      },
    });

    const image = await prisma.image.create({
      data: {
        url: `/uploads/properties/${fileName}`,
        alt: property.title,
        sortOrder: imageCount,
        propertyId,
      },
    });

    revalidatePath(
      `/admin/properties/${propertyId}/edit`
    );

    revalidatePath(`/properties/${propertyId}`);

    return {
      success: true,
      message: "تم رفع الصورة بنجاح",
      image,
    };
  } catch (error) {
    console.error("UPLOAD_PROPERTY_IMAGE_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء رفع الصورة",
    };
  }
}

export async function deletePropertyImage(
  imageId: string
) {
  try {
    await requireAdmin();

    const image = await prisma.image.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      return {
        success: false,
        message: "الصورة غير موجودة",
      };
    }

    if (image.url.startsWith("/uploads/")) {
      const filePath = path.join(
        process.cwd(),
        "public",
        image.url
      );

      try {
        await unlink(filePath);
      } catch {
        // الملف غير موجود، نكمل حذف السجل
      }
    }

    await prisma.image.delete({
      where: {
        id: imageId,
      },
    });

    revalidatePath(
      `/admin/properties/${image.propertyId}/edit`
    );

    revalidatePath(
      `/properties/${image.propertyId}`
    );

    return {
      success: true,
      message: "تم حذف الصورة",
    };
  } catch (error) {
    console.error("DELETE_PROPERTY_IMAGE_ERROR:", error);

    return {
      success: false,
      message: "حدث خطأ أثناء حذف الصورة",
    };
  }
}