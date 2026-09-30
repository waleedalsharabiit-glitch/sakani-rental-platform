import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileAccessToken } from "@/lib/auth/mobile-token";

async function getUserId(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyMobileAccessToken(token);

    return payload.userId;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      propertyId: string;
    }>;
  },
) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح",
        },
        { status: 401 },
      );
    }

    const { propertyId } = await context.params;

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          message: "معرف العقار مطلوب",
        },
        { status: 400 },
      );
    }

    const favorite = await prisma.favorite.findUnique({
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

    if (!favorite) {
      return NextResponse.json({
        success: true,
        message: "العقار غير موجود في المفضلة",
        data: {
          propertyId,
          isFavorite: false,
        },
      });
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف العقار من المفضلة",
      data: {
        propertyId,
        isFavorite: false,
      },
    });
  } catch (error) {
    console.error("DELETE_FAVORITE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "فشل حذف العقار من المفضلة",
      },
      { status: 500 },
    );
  }
}