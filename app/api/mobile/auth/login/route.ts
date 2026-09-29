import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createMobileAccessToken } from "@/lib/auth/mobile-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .toLowerCase()
      .trim();

    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني وكلمة المرور مطلوبان",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    const accessToken = await createMobileAccessToken({
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MOBILE_LOGIN_API_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: 500 }
    );
  }
}