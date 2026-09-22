import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email)
          .toLowerCase()
          .trim();

        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // حفظ معرف المستخدم داخل JWT
        token.id = user.id;

        // حفظ صلاحية المستخدم
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // نقل ID من JWT إلى Session
        session.user.id = String(
          token.id ?? token.sub ?? ""
        );

        // نقل الصلاحية من JWT إلى Session
        if (token.role) {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});