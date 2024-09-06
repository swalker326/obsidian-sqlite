import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const notesTable = sqliteTable('notes', {
    path: text('path').notNull().primaryKey(),
    content: text('content').notNull(),
    deleted: integer("deleted", { mode: "boolean" }).default(false),
    createdAt: integer("createdAd", { mode: "timestamp" }),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
});

export type InsertUser = typeof notesTable.$inferInsert;
export type SelectUser = typeof notesTable.$inferSelect;