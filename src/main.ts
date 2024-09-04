import { Plugin, Notice, addIcon } from 'obsidian';
import { SQLitePluginSettings, DEFAULT_SETTINGS, SQLitePluginSettingTab } from './settings';
import { DatabaseManager } from './database';

const SYNC_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-refresh-cw"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;

export default class SQLitePlugin extends Plugin {
    settings: SQLitePluginSettings;
    db: DatabaseManager;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SQLitePluginSettingTab(this.app, this));
        this.db = new DatabaseManager(
            this.app.vault.configDir,
            this.settings.localDBPath,
            this.settings.remoteDBUrl,
            this.settings.remoteDBSecret,
            60 // sync every 60 seconds
        );
        await this.db.initialize();

        addIcon('sync-database', SYNC_ICON);

        this.addRibbonIcon('sync-database', 'Sync Database', async (evt: MouseEvent) => {
            await this.syncDatabase();
        });

        this.addCommand({
            id: 'add-note',
            name: 'Add Note',
            callback: () => this.db.addNote('New Note', 'This is a new note.')
        });

        this.addCommand({
            id: 'get-all-notes',
            name: 'Get All Notes',
            callback: () => this.db.getAllNotes()
        });
    }

    onunload() {
        this.db.close();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async syncDatabase() {
        try {
            await this.db.sync();
            new Notice('Database synced successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            new Notice('Sync failed. Check console for details.');
        }
    }
}