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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * PUT /api/reviews/:id
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
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

    const { id } = await context.params;

    const existingReview = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "التقييم غير موجود",
        },
        { status: 404 },
      );
    }

    if (existingReview.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكنك تعديل هذا التقييم",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const rating =
      typeof body.rating === "number"
        ? body.rating
        : Number(body.rating);

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : null;

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

    const review = await prisma.review.update({
      where: {
        id,
      },
      data: {
        rating,
        comment: comment || null,
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

    return NextResponse.json({
      success: true,
      message: "تم تعديل التقييم بنجاح",
      data: review,
    });
  } catch (error) {
    console.error("PUT /api/reviews/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تعديل التقييم",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reviews/:id
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
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

    const { id } = await context.params;

    const existingReview = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "التقييم غير موجود",
        },
        { status: 404 },
      );
    }

    if (existingReview.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكنك حذف هذا التقييم",
        },
        { status: 403 },
      );
    }

    await prisma.review.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف التقييم بنجاح",
    });
  } catch (error) {
    console.error(
      "DELETE /api/reviews/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف التقييم",
      },
      { status: 500 },
    );
  }
}