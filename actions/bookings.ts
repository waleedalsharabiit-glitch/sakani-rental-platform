"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";

type BookingState = {
  success: boolean;
  message: string;
};

export const initialBookingState: BookingState = {
  success: false,
  message: "",
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function startOfDay(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return date;
}

export async function createBooking(
  _previousState: BookingState,
  formData: FormData
): Promise<BookingState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "يجب تسجيل الدخول أولًا",
      };
    }

    const rawData = {
      propertyId: getString(formData, "propertyId"),
      startDate: getString(formData, "startDate"),
      endDate: getString(formData, "endDate"),
    };

    const validation = bookingSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "بيانات الحجز غير صحيحة",
      };
    }

    const startDate = startOfDay(
      validation.data.startDate
    );

    const endDate = startOfDay(
      validation.data.endDate
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return {
        success: false,
        message: "التاريخ المحدد غير صالح",
      };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) {
      return {
        success: false,
        message: "لا يمكن اختيار تاريخ في الماضي",
      };
    }

    if (endDate <= startDate) {
      return {
        success: false,
        message:
          "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول",
      };
    }

    const property = await prisma.property.findUnique({
      where: {
        id: validation.data.propertyId,
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    if (!property) {
      return {
        success: false,
        message: "العقار غير موجود",
      };
    }

    /*
     * التعارض:
     *
     * حجز جديد:
     * startDate -> endDate
     *
     * يتعارض إذا:
     *
     * booking.startDate < newEnd
     * AND
     * booking.endDate > newStart
     *
     * نستثني الحجوزات الملغاة.
     */
    const conflictingBooking =
      await prisma.booking.findFirst({
        where: {
          propertyId: property.id,

          status: {
            not: "CANCELLED",
          },

          startDate: {
            lt: endDate,
          },

          endDate: {
            gt: startDate,
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
          "العقار محجوز خلال الفترة التي اخترتها",
      };
    }

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) /
        millisecondsPerDay
    );

    if (nights <= 0) {
      return {
        success: false,
        message: "عدد الليالي غير صالح",
      };
    }

    const totalPrice =
      nights * property.price;

    await prisma.booking.create({
      data: {
        startDate,
        endDate,
        totalPrice,
        status: "PENDING",
        userId: session.user.id,
        propertyId: property.id,
      },
    });

    revalidatePath(
      `/properties/${property.id}`
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");

    return {
      success: true,
      message:
        "تم إرسال طلب الحجز بنجاح. بانتظار تأكيد الإدارة.",
    };
  } catch (error) {
    console.error("CREATE_BOOKING_ERROR", error);

    return {
      success: false,
      message:
        "حدث خطأ أثناء إنشاء الحجز. حاول مرة أخرى.",
    };
  }
}