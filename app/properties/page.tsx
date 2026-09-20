import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, MapPin, SlidersHorizontal, Building2 } from "lucide-react";
import { PropertyCard } from "./property-card";

type SearchParams = {
  q?: string;
  city?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const city = params.city?.trim() || "";
  const category = params.category?.trim() || "";

  const minPrice = params.minPrice
    ? Number(params.minPrice)
    : undefined;

  const maxPrice = params.maxPrice
    ? Number(params.maxPrice)
    : undefined;

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
              description: {
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
          city: {
            equals: city,
          },
        }
      : {}),

    ...(category
      ? {
          categoryId: category,
        }
      : {}),

    ...(minPrice !== undefined && !Number.isNaN(minPrice)
      ? {
          price: {
            gte: minPrice,
          },
        }
      : {}),

    ...(maxPrice !== undefined && !Number.isNaN(maxPrice)
      ? {
          price: {
            ...(minPrice !== undefined &&
            !Number.isNaN(minPrice)
              ? { gte: minPrice }
              : {}),
            lte: maxPrice,
          },
        }
      : {}),
  };

  const [properties, categories, cities] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.property.findMany({
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    }),
  ]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.12),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-300">
              <Building2 className="h-4 w-4" />
              اكتشف مكانك القادم
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              اعثر على
              <span className="block bg-gradient-to-l from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                المكان المناسب لك
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              استكشف مجموعة من العقارات والغرف والفلل والمكاتب،
              واعثر على المكان الذي يناسب احتياجاتك وميزانيتك.
            </p>
          </div>

          {/* Search */}
          <form
            method="GET"
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr_1fr_auto]">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  name="q"
                  defaultValue={q}
                  placeholder="ابحث عن عقار، غرفة، فيلا..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/80 pr-12 pl-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10"
                />
              </div>

              {/* City */}
              <select
                name="city"
                defaultValue={city}
                className="h-14 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-sm text-white outline-none focus:border-sky-500/50"
              >
                <option value="">كل المدن</option>

                {cities.map((item) => (
                  <option key={item.city} value={item.city}>
                    {item.city}
                  </option>
                ))}
              </select>

              {/* Category */}
              <select
                name="category"
                defaultValue={category}
                className="h-14 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-sm text-white outline-none focus:border-sky-500/50"
              >
                <option value="">كل التصنيفات</option>

                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 px-7 font-bold text-white shadow-lg shadow-sky-900/20 transition hover:scale-[1.02] hover:from-sky-400 hover:to-blue-500"
              >
                <Search className="h-5 w-5" />
                بحث
              </button>
            </div>

            {/* Price filters */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                name="minPrice"
                type="number"
                min="0"
                defaultValue={params.minPrice}
                placeholder="الحد الأدنى للسعر"
                className="h-12 rounded-2xl border border-white/10 bg-slate-900/60 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50"
              />

              <input
                name="maxPrice"
                type="number"
                min="0"
                defaultValue={params.maxPrice}
                placeholder="الحد الأعلى للسعر"
                className="h-12 rounded-2xl border border-white/10 bg-slate-900/60 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Properties */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-sky-400">
              <SlidersHorizontal className="h-4 w-4" />
              نتائج البحث
            </div>

            <h2 className="text-2xl font-black sm:text-3xl">
              العقارات المتاحة
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {properties.length === 0
                ? "لم يتم العثور على عقارات"
                : `تم العثور على ${properties.length} عقار`}
            </p>
          </div>

          {(q ||
            city ||
            category ||
            params.minPrice ||
            params.maxPrice) && (
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              مسح الفلاتر
            </Link>
          )}
        </div>

        {/* Empty state */}
        {properties.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500/10">
              <Search className="h-9 w-9 text-sky-400" />
            </div>

            <h3 className="text-xl font-bold">
              لا توجد عقارات مطابقة
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
              جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر
              للعثور على المزيد من العقارات.
            </p>

            <Link
              href="/properties"
              className="mt-6 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-400"
            >
              عرض جميع العقارات
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}