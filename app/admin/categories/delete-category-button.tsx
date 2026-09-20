"use client";

import { useState } from "react";

import { deleteCategory } from "@/actions/categories";

type Props = {
  id: string;
  name: string;
};

export function DeleteCategoryButton({
  id,
  name,
}: Props) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف التصنيف "${name}"؟`
    );

    if (!confirmed) return;

    setPending(true);

    const result = await deleteCategory(id);

    setPending(false);

    if (!result.success) {
      window.alert(result.message);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "..." : "حذف"}
    </button>
  );
}