import {
	timestamp,
	pgTable,
	text,
	primaryKey,
	integer,
	varchar,
	serial
  } from "drizzle-orm/pg-core"
  import postgres from "postgres"
  import { drizzle } from "drizzle-orm/postgres-js"
  import type { AdapterAccountType } from "next-auth/adapters"

  const connectionString = process.env.AUTH_DRIZZLE_URL || ""
  const pool = postgres(connectionString, { max: 1 })

  export const db = drizzle(pool)

  export const users = pgTable("user", {
	id: text("id")
	  .primaryKey()
	  .$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	password: varchar('password', { length: 255 }),
	image: text("image"),
  })

  export const accounts = pgTable(
	"account",
	{
	  userId: text("userId")
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
  )

  export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
	  .notNull()
	  .references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
  })

  export const songs = pgTable('song', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	download: varchar('download', { length: 255 }).notNull(),
	source: varchar('source', { length: 255 }).notNull(),
	comment: text('comment'),
	tags: text('tags'),
	authorId: text('author_id')
	  .notNull()
    .references(() => users.id, { onDelete: "cascade" })  
  });
