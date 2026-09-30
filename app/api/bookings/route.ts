import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileAccessToken } from "@/lib/auth/mobile-token";

async function getUserFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring("Bearer ".length).trim();

  if (!token) {
    return null;
  }

  try {
    return await verifyMobileAccessToken(token);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح",
        },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
            },
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        property: {
          id: booking.property.id,
          title: booking.property.title,
          city: booking.property.city,
          address: booking.property.address,
          price: booking.property.price,
          image: booking.property.images[0]?.url ?? null,
          category: {
            id: booking.property.category.id,
            name: booking.property.category.name,
            slug: booking.property.category.slug,
          },
        },
      })),
    });
  } catch (error) {
    console.error("BOOKINGS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الحجوزات",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const propertyId = String(body.propertyId ?? "").trim();
    const startDateValue = String(body.startDate ?? "").trim();
    const endDateValue = String(body.endDate ?? "").trim();

    if (!propertyId || !startDateValue || !endDateValue) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الحجز غير مكتملة",
        },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "تواريخ الحجز غير صحيحة",
        },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول",
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          message: "العقار غير موجود",
        },
        { status: 404 }
      );
    }

    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: startDate,
        },
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "العقار محجوز في هذه الفترة",
        },
        { status: 409 }
      );
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) /
        millisecondsPerDay
    );

    const totalPrice = days * property.price;

    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        propertyId,
        startDate,
        endDate,
        totalPrice,
        status: "PENDING",
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحجز بنجاح",
        data: {
          id: booking.id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt,
          property: {
            id: booking.property.id,
            title: booking.property.title,
            image: booking.property.images[0]?.url ?? null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("BOOKING_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء الحجز",
      },
      { status: 500 }
    );
  }
}