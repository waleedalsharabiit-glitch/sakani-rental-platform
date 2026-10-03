import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

import { prisma } from "@/lib/prisma";
import { createMobileAccessToken } from "@/lib/auth/mobile-token";

const googleClient = new OAuth2Client();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const idToken =
      typeof body?.idToken === "string"
        ? body.idToken.trim()
        : "";

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Google ID Token مطلوب",
        },
        { status: 400 }
      );
    }

    const audience = process.env.GOOGLE_WEB_CLIENT_ID;

    if (!audience) {
      return NextResponse.json(
        {
          success: false,
          message: "Google authentication is not configured",
        },
        { status: 500 }
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Google ID Token غير صالح",
        },
        { status: 401 }
      );
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase().trim();

    if (!googleId || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات حساب Google غير مكتملة",
        },
        { status: 401 }
      );
    }

    const name =
      typeof payload.name === "string"
        ? payload.name
        : null;

    const image =
      typeof payload.picture === "string"
        ? payload.picture
        : null;

    // 1. ابحث عن حساب Google المرتبط مسبقًا.
    const existingAccount =
      await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: googleId,
          },
        },
        include: {
          user: true,
        },
      });

 let user = existingAccount?.user ?? null;

// 2. إذا لم يوجد Account، ابحث عن مستخدم بنفس البريد.
if (!user) {
  user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

    // 3. إذا لم يوجد المستخدم، أنشئ مستخدمًا جديدًا.
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          image,
        },
      });
    } else {
      // تحديث بيانات Google الأساسية بدون تغيير كلمة المرور.
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name ?? name,
          image: user.image ?? image,
        },
      });
    }

    // 4. أنشئ علاقة Google بالمستخدم إذا لم تكن موجودة.
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: googleId,
        },
      });
    }

    // 5. أصدر JWT الخاص بتطبيق Sakani.
    const accessToken = await createMobileAccessToken({
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول باستخدام Google بنجاح",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Mobile Google login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تسجيل الدخول باستخدام Google",
      },
      { status: 401 }
    );
  }
}