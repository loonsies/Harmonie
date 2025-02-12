"use server";

import { db, users } from "@/app/schema";
import { registerSchema } from "@/app/schemas/registerSchema";
import { saltAndHashPassword } from "@/utils/password";

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
      console.log(validatedPassword);
      console.log(validatedConfirmPassword);
      throw new Error("Confirmation password is different from password");
    }

    const hashedPassword = saltAndHashPassword(validatedPassword);
    const newUser = await db
      .insert(users)
      .values({
        name: validatedName,
        email: validatedEmail,
        password: hashedPassword,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(`Registration failed: ${error}`);
  }
}
