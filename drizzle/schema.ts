import { pgTable, uniqueIndex, integer, varchar, text, boolean, foreignKey, timestamp, serial } from "drizzle-orm/pg-core"
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

export const projects = pgTable("projects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "projects_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_user_fk"
		}).onDelete("cascade"),
]);

export const labels = pgTable("labels", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	color: varchar({ length: 50 }).default('blue').notNull(),
	projectId: integer("project_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "labels_project_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "labels_user_fk"
		}).onDelete("cascade"),
]);

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	position: integer().default(0).notNull(),
	projectId: integer("project_id").notNull(),
	labelId: integer("label_id").notNull(),
	userId: integer("user_id").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	content: text().default('').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "tasks_project_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.labelId],
			foreignColumns: [labels.id],
			name: "tasks_label_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tasks_user_fk"
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
	done: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "notes_project_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notes_user_fk"
		}),
]);
