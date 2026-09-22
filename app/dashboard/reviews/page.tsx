import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Star,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ReviewItem from "./review-item";

export default async function ReviewsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const reviews = await prisma.review.findMany({
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
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        ) / reviews.length
      : 0;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-sky-400">
              تقييماتك
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              تقييماتي
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              جميع التقييمات التي أضفتها للعقارات التي استأجرتها.
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

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  متوسط تقييماتك
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-black">
                    {reviews.length > 0
                      ? averageRating.toFixed(1)
                      : "—"}
                  </span>

                  {reviews.length > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.round(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-700"
                            }`}
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10">
                <MessageSquare className="h-6 w-6 text-sky-400" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  إجمالي التقييمات
                </p>

                <p className="mt-1 text-3xl font-black">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* Reviews */}
        {reviews.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>

            <h2 className="mt-5 text-xl font-black">
              لا توجد تقييمات حتى الآن
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              بعد إكمال أحد حجوزاتك، يمكنك تقييم العقار
              ومشاركة تجربتك مع مستخدمي سَكَني.
            </p>

            <Link
              href="/properties"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-l from-sky-500 to-blue-600 px-6 text-sm font-black text-white transition hover:from-sky-400 hover:to-blue-500"
            >
              استكشف العقارات
            </Link>

          </section>
        ) : (
          <section className="space-y-4">

            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={{
                  id: review.id,
                  rating: review.rating,
                  comment: review.comment,
                  createdAt: review.createdAt.toISOString(),
                  propertyId: review.propertyId,
                  property: {
                    id: review.property.id,
                    title: review.property.title,
                    city: review.property.city,
                    category: review.property.category.name,
                    image:
                      review.property.images[0]?.url ?? null,
                  },
                }}
              />
            ))}

          </section>
        )}

      </div>
    </main>
  );
}