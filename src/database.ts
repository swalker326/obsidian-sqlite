import { createClient } from '@libsql/client';
import * as path from 'path';
import { Note } from './types';

export class DatabaseManager {
    private client: ReturnType<typeof createClient>;

    constructor(
        private configDir: string,
        private localDbName: string,
        private remoteDbUrl: string,
        private authToken: string,
        private syncInterval: number = 60 // sync every 60 seconds by default
    ) { }

    async initialize() {
        const localDbPath = path.join(this.configDir, this.localDbName);

        this.client = createClient({
            url: this.remoteDbUrl,
            // url: `file:${localDbPath}`,
            // syncUrl: this.remoteDbUrl,
            authToken: this.authToken,
            // syncInterval: this.syncInterval
        });

        // Create table if not exists
        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                content TEXT,
                created_at INTEGER,
                updated_at INTEGER
            )
        `);
    }

    async addNote(title: string, content: string): Promise<number> {
        const now = Date.now();
        const result = await this.client.execute({
            sql: 'INSERT INTO notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING id',
            args: [title, content, now, now]
        });
        return result.rows[0].id as number;
    }

    async getNote(id: number): Promise<Note | undefined> {
        const result = await this.client.execute({
            sql: 'SELECT * FROM notes WHERE id = ?',
            args: [id]
        });
        return result.rows[0] as Note | undefined;
    }

    async getAllNotes(): Promise<Note[]> {
        const result = await this.client.execute('SELECT * FROM notes');
        console.log("::RESULT", result)
        return result.rows as Note[];
    }

    async updateNote(id: number, title: string, content: string): Promise<void> {
        const now = Date.now();
        await this.client.execute({
            sql: 'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?',
            args: [title, content, now, id]
        });
    }

    async deleteNote(id: number): Promise<void> {
        await this.client.execute({
            sql: 'DELETE FROM notes WHERE id = ?',
            args: [id]
        });
    }

    async sync(): Promise<void> {
        await this.client.sync();
    }

    close() {
        // No need to explicitly close the connection
    }
}