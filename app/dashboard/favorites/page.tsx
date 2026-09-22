import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Search,
  Star,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FavoriteButton from "@/components/properties/favorite-button";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
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
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-rose-400">
              العقارات المحفوظة
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              المفضلة
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              العقارات التي حفظتها للعودة إليها لاحقًا.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-slate-300 transition hover:border-sky-500/30 hover:bg-white/[0.07] hover:text-white"
          >
            استكشف العقارات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Count */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10">
            <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              العقارات المحفوظة
            </p>

            <p className="mt-0.5 text-lg font-black">
              {favorites.length}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {favorites.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-400/10">
              <Heart className="h-8 w-8 text-rose-400" />
            </div>

            <h2 className="mt-5 text-xl font-black">
              لا توجد عقارات في المفضلة
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              عندما تجد عقارًا مناسبًا، اضغط على أيقونة القلب
              لإضافته إلى المفضلة والعودة إليه بسهولة لاحقًا.
            </p>

            <Link
              href="/properties"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-sky-500 to-blue-600 px-6 text-sm font-black text-white transition hover:from-sky-400 hover:to-blue-500"
            >
              <Search className="h-4 w-4" />
              استكشف العقارات
            </Link>
          </section>
        ) : (
          /* Favorites grid */
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => {
              const property = favorite.property;

              const ratings = property.reviews.map(
                (review) => review.rating,
              );

              const averageRating =
                ratings.length > 0
                  ? ratings.reduce(
                      (sum, rating) => sum + rating,
                      0,
                    ) / ratings.length
                  : 0;

              const image =
                property.images[0]?.url ?? null;

              return (
                <article
                  key={favorite.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-sky-500/20"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-800">
                    {image ? (
                      <img
                        src={image}
                        alt={
                          property.images[0]?.alt ??
                          property.title
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-600">
                        لا توجد صورة
                      </div>
                    )}

                    {/* Favorite */}
                    <div className="absolute right-4 top-4 z-10">
                      <FavoriteButton
                        propertyId={property.id}
                        initialFavorite={true}
                      />
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-4 right-4">
                      <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        {property.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/properties/${property.id}`}
                          className="block truncate text-lg font-black transition hover:text-sky-400"
                        >
                          {property.title}
                        </Link>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {property.city}
                            {property.address
                              ? ` · ${property.address}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      {ratings.length > 0 && (
                        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-yellow-400/10 px-2 py-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />

                          <span className="text-xs font-black text-yellow-300">
                            {averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                      <div>
                        <span className="text-xl font-black text-white">
                          {property.price.toLocaleString(
                            "ar-YE",
                          )}
                        </span>

                        <span className="mr-1 text-xs text-slate-500">
                          ريال / شهر
                        </span>
                      </div>

                      <Link
                        href={`/properties/${property.id}`}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-white/[0.05] px-4 text-xs font-bold text-slate-300 transition hover:bg-sky-500/10 hover:text-sky-300"
                      >
                        عرض العقار
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}