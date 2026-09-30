import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const sort = searchParams.get("sort") || "newest";

    const pageParam = Number(searchParams.get("page") || "1");
    const page = Number.isFinite(pageParam) && pageParam > 0
      ? Math.floor(pageParam)
      : 1;

    const perPage = 9;
    const skip = (page - 1) * perPage;

    const where = {
      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                city: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                address: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(city
        ? {
            city: {
              equals: city,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
    };

    let orderBy;

    switch (sort) {
      case "price_low":
        orderBy = {
          price: "asc" as const,
        };
        break;

      case "price_high":
        orderBy = {
          price: "desc" as const,
        };
        break;

      default:
        orderBy = {
          createdAt: "desc" as const,
        };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          category: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
              images: true,
            },
          },
        },
      }),
      prisma.property.count({
        where,
      }),
    ]);

    const items = properties.map((property) => ({
      id: property.id,
      title: property.title,
      slug: property.slug,
      description: property.description,
      price: property.price,
      address: property.address,
      city: property.city,
      latitude: property.latitude,
      longitude: property.longitude,

      category: {
        id: property.category.id,
        name: property.category.name,
        slug: property.category.slug,
      },

      image: property.images[0]?.url ?? null,
      imagesCount: property._count.images,
      reviewsCount: property._count.reviews,
      favoritesCount: property._count.favorites,

      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("PROPERTIES_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب العقارات",
      },
      {
        status: 500,
      }
    );
  }
}