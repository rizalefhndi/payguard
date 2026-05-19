import { DefaultSession } from "next-auth"

declare module "next-auth" {
  // Add `role` to the built-in `User` type returned by adapters
  interface User {
    id?: string
    role?: string
  }

  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}