import { relations } from "drizzle-orm/relations";
import { users, projects, labels, tasks, notes } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.userId],
		references: [users.id]
	}),
	labels: many(labels),
	tasks: many(tasks),
	notes: many(notes),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects: many(projects),
	labels: many(labels),
	tasks: many(tasks),
	notes: many(notes),
}));

export const labelsRelations = relations(labels, ({one, many}) => ({
	project: one(projects, {
		fields: [labels.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [labels.userId],
		references: [users.id]
	}),
	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
	label: one(labels, {
		fields: [tasks.labelId],
		references: [labels.id]
	}),
	user: one(users, {
		fields: [tasks.userId],
		references: [users.id]
	}),
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