import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from '@libsql/client';
import * as schema from "./db/schema"
import { notesTable } from './db/schema';
import { eq } from 'drizzle-orm';
import { Vault } from 'obsidian';

export class DatabaseManager {
    private client: ReturnType<typeof createClient>;
    private db: LibSQLDatabase<typeof schema>

    constructor(
        private configDir: string,
        private localDbName: string,
        private remoteDbUrl: string,
        private authToken: string,
        private syncInterval: number = 60 // sync every 60 seconds by default
    ) { }

    async initialize() {
        // const localDbPath = path.join(this.configDir, this.localDbName);

        this.client = createClient({
            url: this.remoteDbUrl,
            // url: `file:${localDbPath}`,
            // syncUrl: this.remoteDbUrl,
            authToken: this.authToken,
            // syncInterval: this.syncInterval
        });
        this.db = drizzle(this.client, { schema })
        this.migrate()

        // TODO: Create table if not exists
        // Will need to migrate maybe? not exactly sure how do do this.
    }
    async migrate() {
        this.client.execute(`CREATE TABLE IF NOT EXISTS \`notes\` (\`path\` text PRIMARY KEY NOT NULL,\`content\` text NOT NULL,\`deleted\` integer DEFAULT false,\`createdAd\` integer,\`updatedAt\` integer);`)
    }
    async pullFromRemote(vault: Vault, force = false) {
        if (force) {
            //pull from the db and overwrite any conflicts with the version on remote
        } else {
            const notes = await this.db.query.notesTable.findMany()
            const conflicts = []
            for (const note of notes) {
                const pathParts = note.path.split('/')
                if (!vault.getFileByPath(note.path)) {
                    if (pathParts.length > 1) {
                        // create the directory
                        await vault.createFolder(pathParts.slice(0, pathParts.length - 1).join('/'))
                    }
                    await vault.create(note.path, note.content)
                } else {
                    // note exists add a conflict
                    conflicts.push(note)
                }
            }
            return conflicts
        }
    }

    async addNote(path: string, content: string) {
        const result = await this.db.insert(notesTable).values({
            path,
            content,
            createdAt: new Date()
        })
    }

    async getNote(path: string) {
        const [result] = await this.db.select().from(notesTable).where(eq(notesTable.path, path))
        return result
    }

    async getAllNotes() {
        const result = await this.db.select().from(notesTable)
        return result
    }

    async updateNote(path: string, content: string) {
        await this.db.update(notesTable).set({
            content,
            path,
            updatedAt: new Date()
        }).where(eq(notesTable.path, path))
    }

    async deleteNote(path: string) {
        await this.db.update(notesTable).set({ deleted: true }).where(eq(notesTable.path, path))
    }
    async hardDelete(path: string) {
        await this.db.delete(notesTable).where(eq(notesTable.path, path))
    }

    async sync(): Promise<void> {
        await this.client.sync();
    }
}