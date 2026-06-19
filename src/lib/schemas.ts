import { z } from "zod"

export const roleSchema = z.enum(["BUYER", "SELLER", "ADMIN"])
