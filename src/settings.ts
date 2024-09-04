import { App, PluginSettingTab, Setting } from 'obsidian';
import SQLitePlugin from './main';

export interface SQLitePluginSettings {
    localDBPath: string;
    remoteDBUrl: string;
    remoteDBSecret: string;
}

export const DEFAULT_SETTINGS: SQLitePluginSettings = {
    localDBPath: '.obsidian-sql-lite.db',
    remoteDBUrl: '',
    remoteDBSecret: ''
}

export class SQLitePluginSettingTab extends PluginSettingTab {
    plugin: SQLitePlugin;

    constructor(app: App, plugin: SQLitePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        new Setting(containerEl)
            .setName('DB URL')
            .setDesc('The Turso DB url')
            .addText(text => text
                .setPlaceholder('Enter your url')
                .setValue(this.plugin.settings.remoteDBUrl)
                .onChange(async (value) => {
                    this.plugin.settings.remoteDBUrl = value;
                    await this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName('DB Secret')
            .setDesc('The Turso DB secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.remoteDBSecret)
                .onChange(async (value) => {
                    this.plugin.settings.remoteDBSecret = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Database file name')
            .setDesc('The name of the SQLite database file (stored in .obsidian folder)')
            .addText(text => text
                .setPlaceholder('Enter file name')
                .setValue(this.plugin.settings.localDBPath)
                .onChange(async (value) => {
                    this.plugin.settings.localDBPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}