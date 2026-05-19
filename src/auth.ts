import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { User as NextAuthUser } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return user
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const t = token as JWT & { id?: string; role?: string }
        const u = user as NextAuthUser
        if (u.id) t.id = u.id
        if (u.role) t.role = u.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        const t = token as JWT & { id?: string; role?: string }
        session.user.id = t.id as string
        session.user.role = t.role as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})