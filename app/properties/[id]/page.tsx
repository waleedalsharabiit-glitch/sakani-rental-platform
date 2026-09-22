import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

import FavoriteButton from "@/components/properties/favorite-button";
import { BookingForm } from "@/components/properties/booking-form";
import { ReviewForm } from "@/components/properties/review-form";
import { PropertyGallery } from "@/app/properties/property-gallery";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const session = await auth();

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

      owner: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
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
          favorites: true,
          reviews: true,
          bookings: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  /*
   * ----------------------------------------------------
   * Favorite
   * ----------------------------------------------------
   */

  const favorite = session?.user?.id
    ? await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: session.user.id,
            propertyId: property.id,
          },
        },
      })
    : null;

  /*
   * ----------------------------------------------------
   * هل يستطيع المستخدم إضافة تقييم؟
   * يجب أن يكون لديه حجز مكتمل
   * ----------------------------------------------------
   */

  const completedBooking =
    session?.user?.id
      ? await prisma.booking.findFirst({
          where: {
            userId: session.user.id,
            propertyId: property.id,
            status: "COMPLETED",
          },
          select: {
            id: true,
          },
        })
      : null;

  /*
   * ----------------------------------------------------
   * هل قام المستخدم بالتقييم مسبقًا؟
   * ----------------------------------------------------
   */

  const userReview =
    session?.user?.id
      ? await prisma.review.findUnique({
          where: {
            userId_propertyId: {
              userId: session.user.id,
              propertyId: property.id,
            },
          },
          select: {
            id: true,
          },
        })
      : null;

  const canReview =
    Boolean(completedBooking) && !userReview;

  /*
   * ----------------------------------------------------
   * Average rating
   * ----------------------------------------------------
   */

  const ratingAggregate = await prisma.review.aggregate({
    where: {
      propertyId: property.id,
    },

    _avg: {
      rating: true,
    },
  });

  const averageRating =
    ratingAggregate._avg.rating ?? 0;

  /*
   * ----------------------------------------------------
   * Similar properties
   * ----------------------------------------------------
   */

  const similarProperties =
    await prisma.property.findMany({
      where: {
        categoryId: property.categoryId,

        id: {
          not: property.id,
        },
      },

      include: {
        category: true,

        images: {
          orderBy: {
            sortOrder: "asc",
          },

          take: 1,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 3,
    });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07090d] text-white"
    >
      {/* ==================================================
          Background
      ================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ==================================================
            Breadcrumb
        ================================================== */}

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/properties"
            className="transition hover:text-cyan-300"
          >
            العقارات
          </Link>

          <ArrowRight className="h-4 w-4" />

          <span className="max-w-[220px] truncate text-slate-300">
            {property.title}
          </span>
        </div>

        {/* ==================================================
            Gallery
        ================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-black/30">

          <PropertyGallery
            images={property.images}
            title={property.title}
          />

          {/* Favorite */}

          <div className="absolute left-6 top-6 z-30">
            <FavoriteButton
              propertyId={property.id}
              initialFavorite={Boolean(favorite)}
            />
          </div>
        </section>

        {/* ==================================================
            Main Content
        ================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-8">

            {/* ==================================================
                Title
            ================================================== */}

            <section>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                      متاح للإيجار
                    </span>

                    <span className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                      {property.category.name}
                    </span>

                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {property.title}
                  </h1>

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">

                    <MapPin className="h-4 w-4 text-cyan-400" />

                    <span>
                      {property.address} ·{" "}
                      {property.city}
                    </span>

                  </div>
                </div>

                {/* Rating */}

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>

                  <div>
                    <p className="font-black">
                      {averageRating
                        ? averageRating.toFixed(1)
                        : "جديد"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {property._count.reviews} تقييم
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* ==================================================
                Description
            ================================================== */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

              <h2 className="text-xl font-black">
                عن هذا العقار
              </h2>

              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-400">
                {property.description ||
                  "لا يوجد وصف مضاف لهذا العقار حتى الآن."}
              </p>

            </section>

            {/* ==================================================
                Details
            ================================================== */}

            <section className="grid gap-4 sm:grid-cols-3">

              <InfoCard
                icon={
                  <MapPin className="h-5 w-5" />
                }
                title="الموقع"
                value={property.city}
              />

              <InfoCard
                icon={
                  <Building2 className="h-5 w-5" />
                }
                title="التصنيف"
                value={property.category.name}
              />

              <InfoCard
                icon={
                  <Heart className="h-5 w-5" />
                }
                title="المفضلة"
                value={`${property._count.favorites}`}
              />

            </section>

            {/* ==================================================
                Owner
            ================================================== */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

              <h2 className="text-xl font-black">
                صاحب العقار
              </h2>

              <div className="mt-5 flex items-center gap-4">

                {property.owner.image ? (
                  <img
                    src={property.owner.image}
                    alt={
                      property.owner.name ||
                      "المالك"
                    }
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-black text-cyan-300">
                    {(property.owner.name || "م")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-bold">
                    {property.owner.name ||
                      "مالك العقار"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    عضو في سَكَني منذ{" "}
                    {property.owner.createdAt.toLocaleDateString(
                      "ar-YE"
                    )}
                  </p>
                </div>

              </div>
            </section>

            {/* ==================================================
                Reviews
            ================================================== */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-black">
                    تقييمات العقار
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    آراء المستخدمين حول العقار
                  </p>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-xl bg-yellow-400/10 px-3 py-2">

                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                  <span className="font-bold">
                    {averageRating
                      ? averageRating.toFixed(1)
                      : "—"}
                  </span>

                </div>

              </div>

              {/* ==================================================
                  Add Review
              ================================================== */}

              {canReview && (
                <div className="mt-6">
                  <ReviewForm
                    propertyId={property.id}
                  />
                </div>
              )}

              {/* Login message */}

              {!session?.user?.id && (
                <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">

                  <p className="text-sm font-bold text-cyan-300">
                    هل استأجرت هذا العقار؟
                  </p>

                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    سجل الدخول حتى تتمكن من تقييم
                    العقار بعد اكتمال الحجز.
                  </p>

                  <Link
                    href={`/login?callbackUrl=/properties/${property.id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    تسجيل الدخول
                    <ArrowLeft className="h-4 w-4" />
                  </Link>

                </div>
              )}

              {/* Booking not completed */}

              {session?.user?.id &&
                !completedBooking &&
                !userReview && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

                    <div className="flex gap-3">

                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                      <div>
                        <p className="text-sm font-bold text-slate-300">
                          التقييم متاح بعد تجربة العقار
                        </p>

                        <p className="mt-1 text-xs leading-6 text-slate-600">
                          يجب أن يكون لديك حجز مكتمل
                          لهذا العقار حتى تتمكن من
                          إضافة تقييم.
                        </p>
                      </div>

                    </div>

                  </div>
                )}

              {/* Already reviewed */}

              {userReview && (
                <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">

                  <div className="flex gap-3">

                    <Star className="mt-0.5 h-5 w-5 shrink-0 fill-emerald-400 text-emerald-400" />

                    <div>
                      <p className="text-sm font-bold text-emerald-300">
                        شكرًا لك على تقييم العقار
                      </p>

                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        لقد قمت بتقييم هذا العقار
                        مسبقًا.
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* ==================================================
                  Reviews List
              ================================================== */}

              {property.reviews.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">

                  <Star className="mx-auto h-8 w-8 text-slate-700" />

                  <p className="mt-3 text-sm font-semibold text-slate-400">
                    لا توجد تقييمات حتى الآن
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    كن أول من يقيّم هذا العقار بعد
                    تجربة الإيجار.
                  </p>

                </div>

              ) : (

                <div className="mt-6 space-y-4">

                  {property.reviews.map(
                    (review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-white/5 bg-black/20 p-5"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex items-center gap-3">

                            {review.user.image ? (
                              <img
                                src={
                                  review.user.image
                                }
                                alt={
                                  review.user.name ||
                                  "مستخدم"
                                }
                                className="h-9 w-9 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-xs font-bold">
                                {(
                                  review.user.name ||
                                  "م"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-bold">
                                {review.user.name ||
                                  "مستخدم"}
                              </p>

                              <p className="text-[11px] text-slate-600">
                                {review.createdAt.toLocaleDateString(
                                  "ar-YE"
                                )}
                              </p>
                            </div>

                          </div>

                          {/* Stars */}

                          <div className="flex gap-0.5">

                            {Array.from({
                              length: 5,
                            }).map(
                              (_, index) => (
                                <Star
                                  key={index}
                                  className={`h-3.5 w-3.5 ${
                                    index <
                                    review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-700"
                                  }`}
                                />
                              )
                            )}

                          </div>

                        </div>

                        {review.comment && (
                          <p className="mt-4 text-sm leading-7 text-slate-400">
                            {review.comment}
                          </p>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          </div>

          {/* ==================================================
              Booking Sidebar
          ================================================== */}

          <aside>

            <div className="sticky top-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0c1016]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">

              <div className="border-b border-white/10 p-6">

                <p className="text-xs text-slate-500">
                  السعر
                </p>

                <div className="mt-1 flex items-end gap-2">

                  <span className="text-3xl font-black text-cyan-300">
                    {property.price.toLocaleString(
                      "ar-YE"
                    )}
                  </span>

                  <span className="mb-1 text-sm text-slate-500">
                    ريال / ليلة
                  </span>

                </div>

              </div>

              <div className="p-6">

                <BookingForm
                  propertyId={property.id}
                  price={property.price}
                  isLoggedIn={Boolean(
                    session?.user?.id
                  )}
                />

              </div>

              <div className="border-t border-white/10 p-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <div>

                    <p className="text-sm font-bold">
                      حجز آمن
                    </p>

                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      تتم مراجعة الحجوزات من إدارة
                      سَكَني قبل التأكيد النهائي.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </aside>
        </div>

        {/* ==================================================
            Similar Properties
        ================================================== */}

        {similarProperties.length > 0 && (
          <section className="mt-16">

            <div className="mb-6 flex items-end justify-between">

              <div>

                <p className="text-xs font-bold text-cyan-400">
                  قد يعجبك أيضًا
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  عقارات مشابهة
                </h2>

              </div>

              <Link
                href="/properties"
                className="text-sm font-semibold text-slate-400 transition hover:text-cyan-300"
              >
                عرض الكل
              </Link>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {similarProperties.map(
                (item) => (
                  <Link
                    key={item.id}
                    href={`/properties/${item.id}`}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-cyan-400/20"
                  >

                    <div className="aspect-[4/3] overflow-hidden bg-slate-900">

                      {item.images[0] ? (
                        <img
                          src={
                            item.images[0].url
                          }
                          alt={
                            item.images[0].alt ||
                            item.title
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-12 w-12 text-slate-700" />
                        </div>
                      )}

                    </div>

                    <div className="p-5">

                      <p className="text-xs text-cyan-400">
                        {item.category.name}
                      </p>

                      <h3 className="mt-2 line-clamp-1 font-bold">
                        {item.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-sm text-slate-500">
                          {item.city}
                        </span>

                        <span className="font-black text-cyan-300">
                          {item.price.toLocaleString(
                            "ar-YE"
                          )}{" "}
                          ريال
                        </span>

                      </div>

                    </div>

                  </Link>
                )
              )}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

/* ==========================================================
   Info Card
========================================================== */

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
        {icon}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>

    </div>
  );
}