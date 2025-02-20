"use server";

import { db, users } from "@/schema";
import { registerSchema } from "@/app/schemas/registerSchema";
import { hashPassword } from "@/utils/password";

export async function registerUser({
  username,
  email,
  password,
  confirmPassword,
}: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const {
      username: validatedName,
      email: validatedEmail,
      password: validatedPassword,
      confirmPassword: validatedConfirmPassword,
    } = await registerSchema.parseAsync({
      username,
      email,
      password,
      confirmPassword,
    });

    if (validatedPassword != validatedConfirmPassword) {
      throw new Error("Confirmation password is different from password");
    }

    const hashedPassword = hashPassword(validatedPassword);
    const newUser = await db
      .insert(users)
      .values({
        name: validatedName,
        email: validatedEmail,
        password: hashedPassword,
        image: "default.png",
      })
      .returning();

    return newUser;
  } catch (error) {
    throw new Error(`Registration failed: ${error}`);
  }
}
