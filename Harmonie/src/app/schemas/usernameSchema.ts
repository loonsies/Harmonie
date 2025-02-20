import { object, string } from "zod";

export const usernameSchema = object({
  username: string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers")
    .max(32, "Username must be less than 32 characters"),
});
