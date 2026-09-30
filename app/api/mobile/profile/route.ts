import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyMobileAccessToken } from "@/lib/auth/mobile-token";

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100)
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),
});

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح",
        },
        { status: 401 },
      );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز المصادقة غير موجود",
        },
        { status: 401 },
      );
    }

    const payload = await verifyMobileAccessToken(token);

    const body = await request.json();

    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: {
        id: payload.userId,
      },
      data: {
        ...(parsed.data.name !== undefined
          ? { name: parsed.data.name }
          : {}),
        ...(parsed.data.phone !== undefined
          ? { phone: parsed.data.phone || null }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
      user,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "تعذر تحديث الملف الشخصي",
      },
      { status: 500 },
    );
  }
}