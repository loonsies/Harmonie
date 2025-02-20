import { auth, unstable_update } from "@/auth";
import { getUserFromId, getUserFromName } from "@/utils/db";
import { db, users } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { userSettingsSchema } from "@/app/schemas/userSettingsSchema";
import { usernameSchema } from "@/app/schemas/usernameSchema";
import { verifyPassword, hashPassword } from "@/utils/password";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();

    // Determine if this is a username-only update or full settings update
    const isUsernameOnly = Object.keys(data).length === 1 && "username" in data;

    const validatedData = isUsernameOnly
      ? await usernameSchema.parseAsync(data)
      : await userSettingsSchema.parseAsync(data);

    // Check if username is already taken by another user
    if (validatedData.username) {
      const existingUser = await getUserFromName(validatedData.username);

      if (existingUser && existingUser.id !== session.user.id) {
        return new NextResponse("Username already taken", { status: 400 });
      }
    }

    // Verify current password if trying to change password
    if ("newPassword" in validatedData && validatedData.newPassword) {
      const user = await getUserFromId(session.user.id);

      if (!user?.password || !validatedData.currentPassword) {
        return new NextResponse("Invalid current password", { status: 400 });
      }

      if (
        !(await verifyPassword(user.password, validatedData.currentPassword))
      ) {
        return new NextResponse("Invalid current password", { status: 400 });
      }
    }

    // Prepare update data based on what was provided
    const updateData: Record<string, any> = {};
    if (validatedData.username) updateData.name = validatedData.username;
    if ("email" in validatedData && validatedData.email)
      updateData.email = validatedData.email;
    if ("newPassword" in validatedData && validatedData.newPassword) {
      updateData.password = await hashPassword(validatedData.newPassword);
    }

    // Update user data
    await db.update(users).set(updateData).where(eq(users.id, session.user.id));

    await unstable_update({
      user: {
        ...session.user,
        ...(validatedData.username && { name: validatedData.username }),
        ...("email" in validatedData && { email: validatedData.email }),
      },
    });

    return new NextResponse("Settings updated", { status: 200 });
  } catch (error) {
    console.error("Settings update error:", error);
    return new NextResponse("Error updating settings", { status: 500 });
  }
}
