import { object, string } from "zod";

export const registerSchema = object({
  username: string({ required_error: "Username is required" })
    .min(3, "Username is required")
    .regex(/^[a-zA-Z0-9]+$/)
    .max(32, "Username must be less than 32 characters"),
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmPassword: string({
    required_error: "Confirmation password is required",
  })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});
