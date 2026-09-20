"use client";

import { useTransition } from "react";
import { deleteProperty } from "@/actions/properties";

type Props = {
  propertyId: string;
};

export default function DeletePropertyButton({
  propertyId,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذه العملية."
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteProperty(propertyId);

      if (result.success) {
        window.location.reload();
      } else {
        alert(result.message);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      title="حذف العقار"
      className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "..." : "🗑️"}
    </button>
  );
}