/* eslint-disable obsidianmd/ui/sentence-case, obsidianmd/settings-tab/no-problematic-settings-headings */
import { App, PluginSettingTab, SecretComponent, Setting } from 'obsidian';
import BrainOSPlugin from './main';

export interface RuntimeAuthSettings {
	username: string;
	passwordSecretId: string;
}

export interface BrainOSPluginSettings {
	runtimeBaseUrl: string;
	batchSize: number;
	auth: RuntimeAuthSettings | null;
}

export const DEFAULT_SETTINGS: BrainOSPluginSettings = {
	runtimeBaseUrl: 'http://localhost:4096',
	batchSize: 5,
	auth: null
};

export class BrainOSSettingTab extends PluginSettingTab {
	plugin: BrainOSPlugin;

	constructor(app: App, plugin: BrainOSPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('BrainOS runtime settings')
			.setHeading();

		new Setting(containerEl)
			.setName('Runtime base url')
			.setDesc('Base url for opencode serve (HTTP).')
			.addText((text) =>
				text
					.setPlaceholder('http://localhost:4096')
					.setValue(this.plugin.settings.runtimeBaseUrl)
					.onChange(async (value) => {
						const normalized = value.trim();
						this.plugin.settings.runtimeBaseUrl = normalized || DEFAULT_SETTINGS.runtimeBaseUrl;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Batch size')
			.setDesc('Reserved for runtime batch processing commands (MVP setting persistence).')
			.addText((text) =>
				text
					.setPlaceholder(String(DEFAULT_SETTINGS.batchSize))
					.setValue(String(this.plugin.settings.batchSize))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (Number.isInteger(parsed) && parsed > 0) {
							this.plugin.settings.batchSize = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		const authEnabled = this.plugin.settings.auth !== null;

		new Setting(containerEl)
			.setName('Enable runtime basic auth')
			.setDesc('When enabled, the health check sends an Authorization header.')
			.addToggle((toggle) =>
				toggle
					.setValue(authEnabled)
					.onChange(async (enabled) => {
						this.plugin.settings.auth = enabled
							? (this.plugin.settings.auth ?? { username: 'opencode', passwordSecretId: '' })
							: null;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName('Authentication username')
			.setDesc('Default OpenCode username is "opencode".')
			.addText((text) =>
				text
					.setPlaceholder('opencode')
					.setValue(this.plugin.settings.auth?.username ?? '')
					.setDisabled(!authEnabled)
					.onChange(async (value) => {
						if (!this.plugin.settings.auth) {
							return;
						}

						this.plugin.settings.auth.username = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Authentication password')
			.setDesc('Stored in Obsidian SecretStorage (requires Obsidian 1.11.4+).')
			.addComponent((componentEl) =>
				new SecretComponent(this.app, componentEl)
					.setValue(this.plugin.settings.auth?.passwordSecretId ?? '')
					.onChange(async (value) => {
						if (!this.plugin.settings.auth) {
							return;
						}

						this.plugin.settings.auth.passwordSecretId = value.trim();
						await this.plugin.saveSettings();
					})
			);
	}
}
