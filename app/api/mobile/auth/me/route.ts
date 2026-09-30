import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyMobileAccessToken } from "@/lib/auth/mobile-token";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح",
        },
        { status: 401 }
      );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز المصادقة غير موجود",
        },
        { status: 401 }
      );
    }

    const payload = await verifyMobileAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير موجود",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم جلب بيانات المستخدم بنجاح",
      user,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "جلسة الدخول غير صالحة أو منتهية",
      },
      { status: 401 }
    );
  }
}