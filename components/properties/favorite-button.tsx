"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";
import { useRouter } from "next/navigation";

type FavoriteButtonProps = {
  propertyId: string;
  initialFavorite?: boolean;
};

export default function FavoriteButton({
  propertyId,
  initialFavorite = false,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleFavorite(propertyId);

      if (result.requiresLogin) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent("/properties")}`,
        );
        return;
      }

      if (result.success && "favorite" in result) {
        setFavorite(result.favorite ?? false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={
        favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"
      }
      className={`
        group absolute left-4 top-4 z-20
        flex h-11 w-11 items-center justify-center
        rounded-full border backdrop-blur-xl
        shadow-lg transition-all duration-300
        ${
          favorite
            ? "border-rose-400/30 bg-rose-500 text-white"
            : "border-white/20 bg-black/40 text-white hover:scale-110 hover:border-white/40 hover:bg-black/60"
        }
      `}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={`h-5 w-5 transition-all ${
            favorite
              ? "fill-current"
              : "group-hover:scale-110"
          }`}
        />
      )}
    </button>
  );
}