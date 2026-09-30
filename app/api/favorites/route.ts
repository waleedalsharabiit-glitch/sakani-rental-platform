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

/**
 * GET /api/favorites
 *
 * جلب جميع العقارات المفضلة للمستخدم الحالي.
 */
export async function GET(request: NextRequest) {
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

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        property: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              orderBy: {
                sortOrder: "asc",
              },
              take: 1,
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    const data = favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      property: {
        id: favorite.property.id,
        title: favorite.property.title,
        slug: favorite.property.slug,
        description: favorite.property.description,
        price: favorite.property.price,
        address: favorite.property.address,
        city: favorite.property.city,
        latitude: favorite.property.latitude,
        longitude: favorite.property.longitude,
        category: favorite.property.category,
        image: favorite.property.images[0]?.url ?? null,
      },
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET_FAVORITES_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "فشل جلب المفضلة",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/favorites
 *
 * إضافة عقار إلى المفضلة.
 *
 * Body:
 * {
 *   "propertyId": "..."
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const propertyId =
      typeof body?.propertyId === "string"
        ? body.propertyId.trim()
        : "";

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          message: "معرف العقار مطلوب",
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

    const existingFavorite =
      await prisma.favorite.findUnique({
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

    if (existingFavorite) {
      return NextResponse.json({
        success: true,
        message: "العقار موجود بالفعل في المفضلة",
        data: {
          id: existingFavorite.id,
          propertyId,
          isFavorite: true,
        },
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
      select: {
        id: true,
        propertyId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "تمت إضافة العقار إلى المفضلة",
        data: {
          ...favorite,
          isFavorite: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST_FAVORITE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "فشل إضافة العقار إلى المفضلة",
      },
      { status: 500 },
    );
  }
}