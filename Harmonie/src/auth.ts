import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, accounts, sessions, users } from "@/schema";
import { loginSchema } from "@/app/schemas/loginSchema";
import { getUserFromDb } from "@/utils/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials || !credentials.email || !credentials.password) {
            return null;
          }

          const { email, password } = await loginSchema.parseAsync(credentials);
          const user = await getUserFromDb(email, password);

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } else {
            return null;
          }
        } catch (error) {
          throw new Error(
            JSON.stringify({ errors: "Authorize error", status: false })
          );
        }
      },
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}`;
    },
    async session({ session, trigger, token, newSession }) {
      if (trigger === "update" && newSession?.name) {
        session.user.name = newSession.name;
      }
      if (session.user?.name) {
        session.user.name = token.name;
      }
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      let newUser = { ...user } as any;
      if (newUser.first_name && newUser.last_name)
        token.name = `${newUser.first_name} ${newUser.last_name}`;
      return token;
    },
  },
});
