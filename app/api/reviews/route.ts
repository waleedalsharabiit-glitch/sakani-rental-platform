import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileAccessToken } from "@/lib/auth/mobile-token";

function getTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.substring(7).trim();
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  try {
    return await verifyMobileAccessToken(token);
  } catch {
    return null;
  }
}

/**
 * GET /api/reviews?propertyId=...
 */
export async function GET(request: NextRequest) {
  try {
    const propertyId =
      request.nextUrl.searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          message: "معرف العقار مطلوب",
        },
        { status: 400 },
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        propertyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (sum, review) => sum + review.rating,
            0,
          ) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: {
        count: reviews.length,
        averageRating: Number(averageRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب التقييمات",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const propertyId =
      typeof body.propertyId === "string"
        ? body.propertyId.trim()
        : "";

    const rating =
      typeof body.rating === "number"
        ? body.rating
        : Number(body.rating);

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : null;

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          message: "معرف العقار مطلوب",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "التقييم يجب أن يكون بين 1 و5",
        },
        { status: 400 },
      );
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
      return NextResponse.json(
        {
          success: false,
          message: "العقار غير موجود",
        },
        { status: 404 },
      );
    }

    const existingReview =
      await prisma.review.findUnique({
        where: {
          userId_propertyId: {
            userId: user.userId,
            propertyId,
          },
        },
      });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "لقد قمت بتقييم هذا العقار مسبقاً",
        },
        { status: 409 },
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        userId: user.userId,
        propertyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "تمت إضافة التقييم بنجاح",
        data: review,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة التقييم",
      },
      { status: 500 },
    );
  }
}