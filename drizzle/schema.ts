import { pgTable, uniqueIndex, integer, varchar, text, boolean, serial, timestamp, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	username: varchar({ length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	firebaseUid: text("firebase_uid").notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
}, (table) => [
	uniqueIndex("users_email_unique").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_firebase_uid_unique").using("btree", table.firebaseUid.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_username_unique").using("btree", table.username.asc().nullsLast().op("text_ops")),
]);

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	done: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "projects_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_fk"
		}).onDelete("cascade"),
]);

export const notes = pgTable("notes", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	content: text().default('').notNull(),
	pinned: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	projectId: integer("project_id"),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_fk"
		}),
]);

export const label = pgTable("label", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "label_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_fk"
		}),
]);
