"use client";

import { useActionState } from "react";
import { useEffect } from "react";

import { deleteCategoryAction } from "@/actions/categories";

type Props = {
  id: string;
  name: string;
};

type DeleteCategoryState = {
  success: boolean;
  message: string;
};

const initialState: DeleteCategoryState = {
  success: false,
  message: "",
};

export function DeleteCategoryButton({
  id,
  name,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    deleteCategoryAction,
    initialState
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      window.location.reload();
    }
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `هل أنت متأكد من حذف التصنيف "${name}"؟`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "جاري الحذف..." : "حذف"}
      </button>

      {state.message && !state.success && (
        <p className="mt-2 max-w-xs text-xs text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}