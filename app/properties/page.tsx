import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import FavoriteButton from "@/components/properties/favorite-button";

type SearchParams = {
  q?: string;
  city?: string;
  category?: string;
  sort?: string;
  page?: string;
};

const ITEMS_PER_PAGE = 9;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const city = params.city?.trim() || "";
  const category = params.category?.trim() || "";
  const sort = params.sort || "newest";

  const currentPage = Math.max(
    1,
    Number(params.page || "1"),
  );

  const session = await auth();

  const where = {
    ...(q
      ? {
          OR: [
            {
              title: {
                contains: q,
              },
            },
            {
              city: {
                contains: q,
              },
            },
            {
              address: {
                contains: q,
              },
            },
          ],
        }
      : {}),

    ...(city
      ? {
          city,
        }
      : {}),

    ...(category
      ? {
          categoryId: category,
        }
      : {}),
  };

  let orderBy:
    | { createdAt: "asc" | "desc" }
    | { price: "asc" | "desc" } = {
    createdAt: "desc",
  };

  if (sort === "price-low") {
    orderBy = {
      price: "asc",
    };
  }

  if (sort === "price-high") {
    orderBy = {
      price: "desc",
    };
  }

  const [
    properties,
    totalProperties,
    categories,
    cityResults,
  ] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
    }),

    prisma.property.count({
      where,
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.property.findMany({
      distinct: ["city"],
      select: {
        city: true,
      },
      orderBy: {
        city: "asc",
      },
    }),
  ]);

  const totalPages = Math.ceil(
    totalProperties / ITEMS_PER_PAGE,
  );

  let favoriteIds: string[] = [];

  if (session?.user?.id) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
        propertyId: {
          in: properties.map((property) => property.id),
        },
      },
      select: {
        propertyId: true,
      },
    });

    favoriteIds = favorites.map(
      (favorite) => favorite.propertyId,
    );
  }

  function createUrl(values: Record<string, string>) {
    const urlParams = new URLSearchParams();

    if (q) urlParams.set("q", q);
    if (city) urlParams.set("city", city);
    if (category) urlParams.set("category", category);
    if (sort) urlParams.set("sort", sort);

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    return `/properties?${urlParams.toString()}`;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07090d] text-white"
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

  {/* Page Navigation */}
  <div className="mb-6 flex items-center justify-between">
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
    >
      <ArrowLeft className="h-4 w-4" />
      العودة للرئيسية
    </Link>

    <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
      <Link
        href="/dashboard"
        className="transition hover:text-cyan-400"
      >
        الرئيسية
      </Link>

      <span>/</span>

      <span className="text-slate-400">
        استكشاف العقارات
      </span>
    </div>
  </div>

  {/* Header */}
  <section className="mb-8">
          <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                استكشف سَكَني
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                اعثر على
                <span className="bg-gradient-to-l from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}
                  مكانك المثالي
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                استكشف مجموعة من العقارات المتاحة للإيجار،
                وقارن الخيارات واختر المكان المناسب لك.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xl font-black">
                    {totalProperties}
                  </p>
                  <p className="text-xs text-slate-500">
                    عقار متاح
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <form
            action="/properties"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          >
            <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  name="q"
                  defaultValue={q}
                  placeholder="ابحث باسم العقار أو المدينة..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 pr-12 pl-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-black/30"
                />
              </div>

              <select
                name="city"
                defaultValue={city}
                className="h-14 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-slate-300 outline-none focus:border-cyan-400/50"
              >
                <option value="">كل المدن</option>

                {cityResults.map((item) => (
                  <option
                    key={item.city}
                    value={item.city}
                    className="bg-[#0d1117]"
                  >
                    {item.city}
                  </option>
                ))}
              </select>

              <select
                name="category"
                defaultValue={category}
                className="h-14 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-slate-300 outline-none focus:border-cyan-400/50"
              >
                <option value="">كل التصنيفات</option>

                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    className="bg-[#0d1117]"
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-7 font-bold text-slate-950 transition hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20"
              >
                <Search className="h-5 w-5" />
                بحث
              </button>
            </div>
          </form>
        </section>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <SlidersHorizontal className="h-4 w-4" />

            <span>
              عرض{" "}
              <strong className="text-white">
                {properties.length}
              </strong>{" "}
              من{" "}
              <strong className="text-white">
                {totalProperties}
              </strong>{" "}
              عقار
            </span>
          </div>

        <form
  action="/properties"
  className="flex items-center gap-2"
>
  {q && (
    <input
      type="hidden"
      name="q"
      value={q}
    />
  )}

  {city && (
    <input
      type="hidden"
      name="city"
      value={city}
    />
  )}

  {category && (
    <input
      type="hidden"
      name="category"
      value={category}
    />
  )}

  <select
    name="sort"
    defaultValue={sort}
    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-cyan-400/40"
  >
    <option
      value="newest"
      className="bg-[#0d1117]"
    >
      الأحدث
    </option>

    <option
      value="price-low"
      className="bg-[#0d1117]"
    >
      السعر: من الأقل
    </option>

    <option
      value="price-high"
      className="bg-[#0d1117]"
    >
      السعر: من الأعلى
    </option>
  </select>

  <button
    type="submit"
    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
  >
    تطبيق
  </button>
</form>
        </div>

        {/* Properties */}
        {properties.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5">
              <Building2 className="h-9 w-9 text-slate-600" />
            </div>

            <h2 className="mt-6 text-xl font-bold">
              لم نجد عقارات مطابقة
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              جرّب تغيير كلمات البحث أو اختيار مدينة أو
              تصنيف مختلف.
            </p>

            <Link
              href="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              عرض جميع العقارات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const image = property.images[0]?.url;

              const isFavorite = favoriteIds.includes(
                property.id,
              );

              return (
                <article
                  key={property.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.055]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    {image ? (
                      <img
                        src={image}
                        alt={
                          property.images[0]?.alt ||
                          property.title
                        }
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                        <Building2 className="h-14 w-14 text-slate-700" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                    <FavoriteButton
                      propertyId={property.id}
                      initialFavorite={isFavorite}
                    />

                    <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
                      {property.category.name}
                    </div>

                    <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-300">
                          يبدأ من
                        </p>

                        <p className="mt-0.5 text-xl font-black text-white">
                          {property.price.toLocaleString(
                            "ar-YE",
                          )}{" "}
                          <span className="text-xs font-medium text-slate-300">
                            ريال
                          </span>
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        متاح
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h2 className="line-clamp-1 text-lg font-bold text-white transition group-hover:text-cyan-300">
                        {property.title}
                      </h2>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />

                        <span className="line-clamp-1">
                          {property.city} ·{" "}
                          {property.address}
                        </span>
                      </div>
                    </div>

                    <div className="mb-5 flex items-center gap-4 border-t border-white/5 pt-4">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-white">
                          {property._count.favorites}
                        </span>{" "}
                        مفضلة
                      </div>

                      <div className="h-1 w-1 rounded-full bg-slate-700" />

                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-white">
                          {property._count.reviews}
                        </span>{" "}
                        تقييم
                      </div>
                    </div>

                    <Link
                      href={`/properties/${property.id}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400 hover:text-slate-950"
                    >
                      مشاهدة التفاصيل
                      <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={createUrl({
                  page: String(currentPage - 1),
                })}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400 hover:text-slate-950"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            )
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, pages) => {
                const previous = pages[index - 1];

                return (
                  <div
                    key={page}
                    className="flex items-center gap-2"
                  >
                    {previous && page - previous > 1 && (
                      <span className="px-1 text-slate-600">
                        ...
                      </span>
                    )}

                    <Link
                      href={createUrl({
                        page: String(page),
                      })}
                      className={`
                        flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition
                        ${
                          page === currentPage
                            ? "bg-cyan-400 text-slate-950"
                            : "border border-white/10 bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:text-white"
                        }
                      `}
                    >
                      {page}
                    </Link>
                  </div>
                );
              })}

            {currentPage < totalPages && (
              <Link
                href={createUrl({
                  page: String(currentPage + 1),
                })}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400 hover:text-slate-950"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <section className="relative mt-16 overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 via-white/[0.03] to-blue-500/10 p-8 text-center sm:p-12">
          <div className="absolute right-[-80px] top-[-80px] h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <Sparkles className="mx-auto h-7 w-7 text-cyan-400" />

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              لم تجد ما تبحث عنه؟
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
              تابع سَكَني باستمرار، فالعقارات الجديدة تُضاف
              بشكل مستمر.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}