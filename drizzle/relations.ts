import { relations } from "drizzle-orm/relations";
import { users, projects, notes, label } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.userId],
		references: [users.id]
	}),
	notes: many(notes),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects: many(projects),
	notes: many(notes),
	labels: many(label),
}));

export const notesRelations = relations(notes, ({one}) => ({
	project: one(projects, {
		fields: [notes.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [notes.userId],
		references: [users.id]
	}),
}));

export const labelRelations = relations(label, ({one}) => ({
	user: one(users, {
		fields: [label.userId],
		references: [users.id]
	}),
}));