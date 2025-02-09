import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { users } from "@/schema";
import type { InferSelectModel } from "drizzle-orm";
import { verifyPassword } from "@/utils/password";

const connectionString = process.env.AUTH_DRIZZLE_URL || "";
const queryClient = postgres(connectionString);
const db = drizzle({ client: queryClient });
type User = InferSelectModel<typeof users>;

export async function getUserFromDb(
  email: string,
  password: string
): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .execute();
  const user = result[0];

  if (
    user &&
    user.password &&
    (await verifyPassword(user.password, password))
  ) {
    return user;
  }
  return null;
}
