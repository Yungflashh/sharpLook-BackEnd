import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CLIENT", "VENDOR", "ADMIN", "SUPERADMIN"]),
  acceptedPersonalData: z.union([z.boolean(), z.literal("true"), z.literal("false")]),
  phone: z.string().optional(),
  referredByCode: z.string().optional(),
});
