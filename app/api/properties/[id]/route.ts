import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const property = await prisma.property.findUnique({
      where: {
        id,
      },
      include: {
        category: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        amenities: true,

        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        reviews: {
          orderBy: {
            createdAt: "desc",
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
        },

        _count: {
          select: {
            reviews: true,
            favorites: true,
            bookings: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          message: "العقار غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    const ratingsTotal = property.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      property.reviews.length > 0
        ? ratingsTotal / property.reviews.length
        : 0;

    return NextResponse.json({
      success: true,

      data: {
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

        images: property.images.map((image) => ({
          id: image.id,
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
        })),

        amenities: property.amenities.map((amenity) => ({
          id: amenity.id,
          name: amenity.name,
          description: amenity.description,
        })),

        owner: property.owner,

        reviews: property.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          user: review.user,
        })),

        rating: {
          average: Number(averageRating.toFixed(1)),
          count: property._count.reviews,
        },

        favoritesCount: property._count.favorites,
        bookingsCount: property._count.bookings,

        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      },
    });
  } catch (error) {
    console.error("PROPERTY_DETAILS_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب بيانات العقار",
      },
      {
        status: 500,
      }
    );
  }
}