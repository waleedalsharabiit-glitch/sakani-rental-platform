import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyMobileAccessToken } from "@/lib/auth/mobile-token";

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "كلمة المرور الحالية مطلوبة"),

  newPassword: z
    .string()
    .min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل")
    .max(100),
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

    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكن تغيير كلمة المرور لهذا الحساب",
        },
        { status: 400 },
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة المرور الحالية غير صحيحة",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(
      parsed.data.newPassword,
      12,
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "تعذر تغيير كلمة المرور",
      },
      { status: 500 },
    );
  }
}