import { z } from "zod";

const optionalNumber = (
  min: number,
  max: number,
  message: string
) =>
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return undefined;
      }

      return Number(value);
    },
    z
      .number({
        message,
      })
      .min(min, message)
      .max(max, message)
      .optional()
  );

export const propertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "اسم العقار يجب أن يكون 3 أحرف على الأقل")
    .max(150, "اسم العقار طويل جدًا"),

  slug: z
    .string()
    .trim()
    .min(3, "الرابط المختصر مطلوب")
    .max(150, "الرابط المختصر طويل جدًا")
    .regex(
      /^[a-z0-9-]+$/,
      "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة فقط"
    ),

  description: z
    .string()
    .trim()
    .max(5000, "الوصف طويل جدًا"),

  price: z.coerce
    .number({
      message: "السعر يجب أن يكون رقمًا",
    })
    .positive("السعر يجب أن يكون أكبر من صفر"),

  address: z
    .string()
    .trim()
    .min(3, "العنوان مطلوب")
    .max(250, "العنوان طويل جدًا"),

  city: z
    .string()
    .trim()
    .min(2, "المدينة مطلوبة")
    .max(100, "اسم المدينة طويل جدًا"),

  latitude: optionalNumber(
    -90,
    90,
    "خط العرض يجب أن يكون بين -90 و 90"
  ),

  longitude: optionalNumber(
    -180,
    180,
    "خط الطول يجب أن يكون بين -180 و 180"
  ),

  ownerId: z
    .string()
    .min(1, "يجب اختيار مالك العقار"),

  categoryId: z
    .string()
    .min(1, "يجب اختيار تصنيف العقار"),
});

export type PropertyInput = z.infer<typeof propertySchema>;