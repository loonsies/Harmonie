import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Auth0 from "next-auth/providers/auth0";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db, accounts, sessions, users } from "@/schema"
import { signInSchema } from "@/utils/zod"
import { getUserFromDb } from "@/utils/db"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions
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
          if (!credentials) {
            return null;
          }

          const { email, password } = await signInSchema.parseAsync(credentials)
          const user = await getUserFromDb(email, password)

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
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn(userDetail) {
      if (Object.keys(userDetail).length === 0) {
        return false;
      }
      return true;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/protected`;
    },
    async session({ session, token }) {
      if (session.user?.name) session.user.name = token.name;
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
