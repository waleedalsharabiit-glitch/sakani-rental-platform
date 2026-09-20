import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PropertyGallery } from "./property-gallery";
import { BookingForm } from "./booking-form";

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [property, session] = await Promise.all([
    prisma.property.findUnique({
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

        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },

        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 5,
        },

        _count: {
          select: {
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    }),

    auth(),
  ]);

  if (!property) {
    notFound();
  }

  const averageRating =
    property.reviews.length > 0
      ? property.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / property.reviews.length
      : 0;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      {/* Navigation */}
      <div className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            العودة إلى العقارات
          </Link>

          <span className="text-sm font-black text-slate-700">
            سَكَني
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href="/properties"
            className="transition hover:text-sky-400"
          >
            العقارات
          </Link>

          <span>/</span>

          <span>{property.category.name}</span>

          <span>/</span>

          <span className="text-slate-300">
            {property.title}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-300">
                {property.category.name}
              </span>

              {property._count.reviews > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {averageRating.toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {property.title}
            </h1>

            <div className="mt-4 flex items-center gap-2 text-slate-400">
              <MapPin className="h-5 w-5 text-sky-400" />

              <span>{property.city}</span>

              <span className="text-slate-700">
                •
              </span>

              <span>{property.address}</span>
            </div>
          </div>

          <button
            type="button"
            aria-label="إضافة إلى المفضلة"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Gallery */}
        <PropertyGallery
          images={property.images}
          title={property.title}
        />

        {/* Content */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main */}
          <div className="space-y-8">
            {/* Description */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h2 className="text-xl font-black">
                عن هذا العقار
              </h2>

              <div className="mt-5 leading-8 text-slate-400">
                {property.description ? (
                  <p className="whitespace-pre-line">
                    {property.description}
                  </p>
                ) : (
                  <p>
                    لم تتم إضافة وصف لهذا العقار حتى الآن.
                  </p>
                )}
              </div>
            </section>

            {/* Location */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10">
                  <MapPin className="h-5 w-5 text-sky-400" />
                </div>

                <div>
                  <h2 className="font-black">
                    موقع العقار
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {property.city}،{" "}
                    {property.address}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                {property.latitude !== null &&
                property.longitude !== null ? (
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10 text-sky-400" />

                    <p className="mt-3 font-bold">
                      موقع العقار متوفر
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {property.latitude.toFixed(5)}
                      {" , "}
                      {property.longitude.toFixed(5)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-slate-600">
                    <MapPin className="mx-auto h-10 w-10" />

                    <p className="mt-3 text-sm">
                      لم يتم تحديد الموقع على الخريطة
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Owner */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h2 className="text-xl font-black">
                المالك
              </h2>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-blue-600">
                  {property.owner.image ? (
                    <img
                      src={property.owner.image}
                      alt={
                        property.owner.name ||
                        "المالك"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-6 w-6 text-white" />
                  )}
                </div>

                <div>
                  <p className="font-bold">
                    {property.owner.name ||
                      "مالك العقار"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    مالك العقار
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    التقييمات
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {property._count.reviews} تقييم
                  </p>
                </div>

                {property._count.reviews > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />

                    <span className="text-xl font-black">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {property.reviews.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <Star className="mx-auto h-8 w-8 text-slate-700" />

                  <p className="mt-3 text-sm text-slate-500">
                    لا توجد تقييمات لهذا العقار حتى الآن.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {property.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10">
                            <UserRound className="h-4 w-4 text-sky-400" />
                          </div>

                          <span className="text-sm font-bold">
                            {review.user.name ||
                              "مستخدم"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                          <span className="text-sm">
                            {review.rating}
                          </span>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="mt-4 text-sm leading-7 text-slate-400">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Booking */}
          <aside>
            <div className="sticky top-6 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/20">
              <div className="mb-6 border-b border-white/10 pb-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-black">
                      {property.price.toLocaleString(
                        "ar-YE"
                      )}
                    </span>

                    <span className="mr-2 text-sm text-slate-500">
                      ريال / ليلة
                    </span>
                  </div>
                </div>
              </div>

              {/* الحجز الحقيقي */}
              <BookingForm
                propertyId={property.id}
                price={property.price}
                isLoggedIn={!!session?.user}
              />

              <div className="mt-5 flex gap-3 border-t border-white/10 pt-5 text-xs leading-6 text-slate-500">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />

                <span>
                  يتم إنشاء طلب الحجز بحالة «قيد الانتظار»
                  حتى يتم تأكيده من الإدارة.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}