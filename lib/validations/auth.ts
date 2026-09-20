import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "الاسم يجب أن يكون حرفين على الأقل")
      .max(50, "الاسم طويل جدًا"),

    email: z
      .string()
      .email("البريد الإلكتروني غير صالح")
      .max(100, "البريد الإلكتروني طويل جدًا"),

    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .max(100, "كلمة المرور طويلة جدًا"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;