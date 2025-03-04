import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, accounts, sessions, users } from "@/schema";
import { loginSchema } from "@/app/schemas/loginSchema";
import { getUserFromDb } from "@/utils/db";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
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
              role: user.role,
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
      profile(profile) {
        return {
          id: profile.id,
          name: null,
          email: profile.email,
          image: profile.image,
          role: 0,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}`;
    },
    async session({ session, trigger, token, newSession }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string | null;
        session.user.role = token.role as number;
      }
      if (trigger === "update" && session && session.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.image = session.user.image;
        token.role = session.user.role;
      }
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, trigger, session, user }) {
      if (user) {
        token.role = user.role;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.image = session.user.image;
        token.role = session.user.role;
      }
      return token;
    },
  },
  trustHost: true,
});
