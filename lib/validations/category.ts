import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم التصنيف يجب أن يكون حرفين على الأقل")
    .max(50, "اسم التصنيف طويل جدًا"),

  slug: z
    .string()
    .trim()
    .min(2, "الرابط المختصر مطلوب")
    .max(50, "الرابط المختصر طويل جدًا")
    .regex(
      /^[a-z0-9-]+$/,
      "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط"
    ),

  description: z
    .string()
    .trim()
    .max(300, "الوصف طويل جدًا")
    .optional()
    .or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;