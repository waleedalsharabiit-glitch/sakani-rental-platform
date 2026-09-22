"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type BookingActionState = {
  success: boolean;
  message: string;
};

async function requireAdmin() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "ADMIN"
  ) {
    throw new Error("غير مصرح");
  }

  return session;
}

export async function updateBookingStatus(
  formData: FormData
): Promise<BookingActionState> {
  try {
    await requireAdmin();

    const bookingId = formData.get("bookingId");
    const status = formData.get("status");

    if (
      typeof bookingId !== "string" ||
      !bookingId
    ) {
      return {
        success: false,
        message: "معرف الحجز غير صالح",
      };
    }

    if (
      status !== "CONFIRMED" &&
      status !== "CANCELLED"
    ) {
      return {
        success: false,
        message: "حالة الحجز غير صالحة",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
        status: true,
        propertyId: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        message: "الحجز غير موجود",
      };
    }

    // لا يمكن تعديل الحجز المكتمل أو الملغي
    if (
      booking.status === "COMPLETED" ||
      booking.status === "CANCELLED"
    ) {
      return {
        success: false,
        message: "لا يمكن تعديل حالة هذا الحجز",
      };
    }

    // عند التأكيد، نتحقق مرة أخرى من عدم وجود
    // حجز مؤكد متعارض مع نفس العقار.
    if (status === "CONFIRMED") {
      const conflictingBooking =
        await prisma.booking.findFirst({
          where: {
            id: {
              not: booking.id,
            },

            propertyId: booking.propertyId,

            status: "CONFIRMED",

            startDate: {
              lt: booking.endDate,
            },

            endDate: {
              gt: booking.startDate,
            },
          },

          select: {
            id: true,
          },
        });

      if (conflictingBooking) {
        return {
          success: false,
          message:
            "لا يمكن تأكيد الحجز لأن هناك حجزًا مؤكدًا متعارضًا مع نفس الفترة",
        };
      }
    }

    await prisma.booking.update({
      where: {
        id: booking.id,
      },

      data: {
        status,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(
      `/properties/${booking.propertyId}`
    );

    return {
      success: true,
      message:
        status === "CONFIRMED"
          ? "تم تأكيد الحجز بنجاح"
          : "تم إلغاء الحجز بنجاح",
    };
  } catch (error) {
    console.error(
      "UPDATE_BOOKING_STATUS_ERROR",
      error
    );

    return {
      success: false,
      message:
        "حدث خطأ أثناء تحديث الحجز",
    };
  }
}