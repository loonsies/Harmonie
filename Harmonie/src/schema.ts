import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  varchar,
  serial,
  uuid,
  decimal,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";

const connectionString = process.env.AUTH_DRIZZLE_URL || "";
const pool = postgres(connectionString, { max: 1 });

export const db = drizzle(pool);

export const users = pgTable("user", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique(),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified"),
  password: varchar("password", { length: 255 }),
  image: text("image"),
  role: integer("role").default(0),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const songs = pgTable("song", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bmpId: varchar("bmpId", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  download: varchar("download", { length: 255 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  comment: text("comment"),
  tags: text("tags"),
  author: uuid("author")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bpmAuthor: varchar("bmpAuthor", { length: 255 }),
  dateUploaded: timestamp("dateUploaded").defaultNow(),
});

export const ratings = pgTable(
  "rating",
  {
    rating_id: uuid("rating_id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    song_id: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (rating) => ({
    compoundKey: (rating.user_id, rating.song_id),
  })
);
