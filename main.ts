import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	headerLevel: string;
	headerName: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	headerLevel: "3",
	headerName: "Daily File Stats",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async writeUnderHeader(): Promise<void> {
		// replace text under particular header
		// get active file
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file");
			return;
		}
		// read file
		const source = await this.app.vault.read(activeFile);
		// get header level and name
		const headerLevel = this.settings.headerLevel;
		const headerName = this.settings.headerName;
		// find header
		const headerRegex = new RegExp(`^#{${+headerLevel}} ${headerName}`, "m");
		const headerIndex = source.search(headerRegex);
		if (headerIndex === -1) {
			new Notice("Header not found");
			return;
		}
		// find next header
		const nextHeaderRegex = new RegExp(`^#+\s\w+`);
		const nextHeaderIndex = source.search(nextHeaderRegex);
		if (nextHeaderIndex === -1) {
			new Notice("Next header not found");
			return;
		}
		// replace text
		const result =
			source.slice(0, headerIndex) +
			"hello world" +
			source.slice(nextHeaderIndex);
		// write file
		this.app.vault.modify(activeFile, result);
	}




		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file");
			return;
		}
		const source = await this.app.vault.read(activeFile);
		const result = readContent();
		this.app.vault.modify(activeFile, result);
	}

	async onload() {
		console.log("loading plugin");
		await this.loadSettings();

		// insert "hello world" at the level two heading called "test" in the current file in obsidian
		this.addCommand({
			id: "hello-world",
			name: "Hello World",
			callback: (editor: Editor, view: MarkdownView) => {
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				const headingLevel = line.match(/^#+/)?.[0].length;
				if (headingLevel === 2) {
					editor.replaceRange(
						"hello world",
						{
							line: cursor.line,
							ch: line.length,
						},
						{
							line: cursor.line,
							ch: line.length,
						}
					);
				}
			},
		});

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon(
		// 	"dice",
		// 	"Sample Plugin",
		// 	(evt: MouseEvent) => {
		// 		// Called when the user clicks the icon.
		// 		new Notice("Hello, you!");
		// 	}
		// );
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass("my-plugin-ribbon-class");

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText("Status Bar Text");

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: "open-sample-modal-simple",
		// 	name: "Open sample modal (simple)",
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	},
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: "sample-editor-command",
		// 	name: "Sample editor command",
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection("Sample Editor Command");
		// 	},
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: "open-sample-modal-complex",
		// 	name: "Open sample modal (complex)",
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView =
		// 			this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {
		console.log("unloading plugin");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Settings: Track daily file changes",
		});
		containerEl.createEl("h3", {
			text: "Header under which file stats are written",
		});

		new Setting(containerEl)
			.setName("Header level")
			.setDesc("The level of the header (1-6)")
			.addDropdown(
				(dd) => {
					dd.addOptions({
						"1": "1",
						"2": "2",
						"3": "3",
						"4": "4",
						"5": "5",
						"6": "6",
					})
						.setValue(this.plugin.settings.headerLevel)
						.onChange((value: string) => {
							console.log("Header level: " + value);
							this.plugin.settings.headerLevel = value;
							this.plugin.saveSettings();
							// this.refreshView();
						});
				}
				// .setPlaceholder(DEFAULT_SETTINGS.headerLevel)
				/* It's setting the value of the dropdown to the value of the headerLevel setting. */
			);

		new Setting(containerEl)
			.setName("File changes header name")
			.setDesc(
				"The name of the header under which file changes are written"
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.headerName)
					.setValue(this.plugin.settings.headerName)
					.onChange(async (value) => {
						console.log("Header name: " + value);
						this.plugin.settings.headerName = value;
						this.plugin.saveSettings();
					})
			);
	}
}
