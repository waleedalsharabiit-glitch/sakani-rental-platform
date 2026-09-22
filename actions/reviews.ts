"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReviewState = {
  success: boolean;
  message: string;
};

export async function createReview(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "يجب تسجيل الدخول أولاً.",
    };
  }

  const userId = session.user.id;
  const propertyId = String(formData.get("propertyId") || "");
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "").trim();

  if (!propertyId) {
    return {
      success: false,
      message: "العقار غير محدد.",
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      success: false,
      message: "اختر تقييمًا من نجمة إلى خمس نجوم.",
    };
  }

  if (comment.length > 1000) {
    return {
      success: false,
      message: "التعليق طويل جدًا.",
    };
  }

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
      message: "العقار غير موجود.",
    };
  }

  // يجب أن يكون للمستخدم حجز مكتمل للعقار
  const completedBooking = await prisma.booking.findFirst({
    where: {
      userId,
      propertyId,
      status: "COMPLETED",
    },
    select: {
      id: true,
    },
  });

  if (!completedBooking) {
    return {
      success: false,
      message: "يمكنك تقييم العقار بعد اكتمال حجزك.",
    };
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingReview) {
    return {
      success: false,
      message: "لقد قمت بتقييم هذا العقار مسبقًا.",
    };
  }

  await prisma.review.create({
    data: {
      userId,
      propertyId,
      rating,
      comment: comment || null,
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "تم إرسال تقييمك بنجاح.",
  };
}

export async function updateReview(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "يجب تسجيل الدخول أولاً.",
    };
  }

  const userId = session.user.id;
  const reviewId = String(formData.get("reviewId") || "");
  const propertyId = String(formData.get("propertyId") || "");
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "").trim();

  if (!reviewId || !propertyId) {
    return {
      success: false,
      message: "بيانات التقييم غير مكتملة.",
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      success: false,
      message: "اختر تقييمًا من نجمة إلى خمس نجوم.",
    };
  }

  if (comment.length > 1000) {
    return {
      success: false,
      message: "التعليق طويل جدًا.",
    };
  }

  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
      propertyId,
    },
  });

  if (!review) {
    return {
      success: false,
      message: "التقييم غير موجود.",
    };
  }

  await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      rating,
      comment: comment || null,
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");

  return {
    success: true,
    message: "تم تحديث تقييمك بنجاح.",
  };
}

export async function deleteReview(
  reviewId: string,
  propertyId: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "يجب تسجيل الدخول أولاً.",
    };
  }

  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: session.user.id,
      propertyId,
    },
    select: {
      id: true,
    },
  });

  if (!review) {
    return {
      success: false,
      message: "لا يمكنك حذف هذا التقييم.",
    };
  }

  await prisma.review.delete({
    where: {
      id: review.id,
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");

  return {
    success: true,
    message: "تم حذف التقييم.",
  };
}