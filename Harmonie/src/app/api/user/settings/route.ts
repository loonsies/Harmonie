import { auth } from "@/auth";
import { getUserFromId } from "@/utils/db";
import { db, users } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { userSettingsSchema } from "@/app/schemas/userSettingsSchema";
import { verifyPassword, hashPassword } from "@/utils/password";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const validatedData = await userSettingsSchema.parseAsync(data);

    // Verify current password if trying to change password
    if (validatedData.newPassword) {
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

    // Update user data
    await db
      .update(users)
      .set({
        name: validatedData.username,
        email: validatedData.email,
        ...(validatedData.newPassword && {
          password: await hashPassword(validatedData.newPassword),
        }),
      })
      .where(eq(users.id, session.user.id));

    return new NextResponse("Settings updated", { status: 200 });
  } catch (error) {
    console.error("Settings update error:", error);
    return new NextResponse("Error updating settings", { status: 500 });
  }
}
