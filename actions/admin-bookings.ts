"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
): Promise<void> {
  try {
    await requireAdmin();

    const bookingId = formData.get("bookingId");
    const status = formData.get("status");

    if (
      typeof bookingId !== "string" ||
      !bookingId
    ) {
      return;
    }

    if (
      status !== "CONFIRMED" &&
      status !== "CANCELLED"
    ) {
      return;
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
      return;
    }

    // لا يمكن تعديل الحجز المكتمل أو الملغي
    if (
      booking.status === "COMPLETED" ||
      booking.status === "CANCELLED"
    ) {
      return;
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
        return;
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
  } catch (error) {
    console.error(
      "UPDATE_BOOKING_STATUS_ERROR",
      error
    );
  }
}