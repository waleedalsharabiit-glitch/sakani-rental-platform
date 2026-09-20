import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Star,
  ArrowLeft,
  ImageIcon,
} from "lucide-react";

type PropertyCardProps = {
  property: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    address: string;
    city: string;
    category: {
      id: string;
      name: string;
    };
    images: {
      id: string;
      url: string;
      alt: string | null;
    }[];
    owner: {
      id: string;
      name: string | null;
    };
    _count: {
      reviews: number;
      bookings: number;
    };
  };
};

export function PropertyCard({
  property,
}: PropertyCardProps) {
  const mainImage = property.images[0];

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-sky-950/20">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={
              mainImage.alt ||
              property.title
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <ImageIcon className="h-12 w-12 text-slate-700" />
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Category */}
        <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
          {property.category.name}
        </div>

        {/* Favorite placeholder */}
        <button
          type="button"
          aria-label="إضافة إلى المفضلة"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition hover:bg-white hover:text-red-500"
        >
          <Heart className="h-5 w-5" />
        </button>

        {/* Image count */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md">
            <ImageIcon className="h-3.5 w-3.5" />
            {property.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-sky-400" />
          <span>{property.city}</span>
          <span className="text-slate-700">•</span>
          <span className="truncate">
            {property.address}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 line-clamp-1 text-lg font-bold text-white transition group-hover:text-sky-400">
          {property.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
          {property.description ||
            "عقار مميز في موقع مناسب، اكتشف المزيد من التفاصيل."}
        </p>

        {/* Rating / bookings */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-slate-300">
              {property._count.reviews > 0
                ? "متاح"
                : "جديد"}
            </span>
          </div>

          <div>
            {property._count.bookings} حجز
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <span className="text-xl font-black text-white">
              {property.price.toLocaleString("ar-YE")}
            </span>

            <span className="mr-1 text-xs text-slate-500">
              ريال
            </span>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="flex items-center gap-2 rounded-xl bg-sky-500/10 px-4 py-2.5 text-sm font-bold text-sky-400 transition hover:bg-sky-500 hover:text-white"
          >
            التفاصيل
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}