import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: number | null;
  }
}
