import { object, string } from "zod";

export const userSettingsSchema = object({
  username: string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
  email: string().min(1, "Email is required").email("Invalid email"),
  currentPassword: string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  newPassword: string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  confirmPassword: string().optional(),
})
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );
