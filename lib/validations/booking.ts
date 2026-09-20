import { z } from "zod";

export const bookingSchema = z
  .object({
    propertyId: z.string().min(1, "العقار غير صالح"),
    startDate: z.string().min(1, "اختر تاريخ الوصول"),
    endDate: z.string().min(1, "اختر تاريخ المغادرة"),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "تاريخ الوصول غير صالح",
      });
    }

    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "تاريخ المغادرة غير صالح",
      });
    }

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end <= start
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول",
      });
    }
  });