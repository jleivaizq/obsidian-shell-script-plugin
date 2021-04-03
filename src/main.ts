import { App, Plugin, PluginSettingTab, Setting, Command } from 'obsidian';
import { exec } from 'child_process';

interface ScriptPluginSettings {
	scripts: Array<string>
}

const DEFAULT_COMMANDS = 5;

const DEFAULT_SETTINGS: ScriptPluginSettings = {
	scripts: ['','','','',''],
}

export default class ScriptPlugin extends Plugin {
	settings: ScriptPluginSettings;

	async onload() {
		await this.loadSettings();
	    this.addSettingTab(new ScriptSettingTab(this.app, this));
	    this.createCommands();
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	createCommands() : void {
        for(let index=0; index < DEFAULT_COMMANDS; index++) {
		    this.addCommand(this.newScriptCommand(index))
        };
    }

    newScriptCommand(index: number) : Command {
       return {
           id: `execute-script-${index}`,
		   name: `Execute script ${index}`,
		   checkCallback: (checking: boolean) => {
		       let activeLeaf: any = this.app.workspace.activeLeaf;
               let editor = activeLeaf.view.sourceMode.cmEditor;
               let script = this.settings.scripts[index];

		       if (checking) {
		           return editor && script !== ''
               }

               exec(script, (error, stdout, stderr) => {
                   if (error) {
                       console.log(`error: ${error.message}`);
                       return false;
                   }
                   editor.replaceSelection(stdout);
               });
		   }
       }
    }
}

class ScriptSettingTab extends PluginSettingTab {
	plugin: ScriptPlugin;

	constructor(app: App, plugin: ScriptPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
	    this.createScriptCommandSettings(this.containerEl);
	}

	createScriptCommandSettings(containerEl: HTMLElement) : void {
		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for script execution plugin.'});
        for(let index=0; index < DEFAULT_COMMANDS; index++) {
		    this.newScriptCommandSettings(containerEl, index)
        }
    }

    newScriptCommandSettings(containerEl: HTMLElement, index: number) : void {
        new Setting(containerEl)
              .setName(`Script command [${index}]`)
		      .setDesc(`Script to execute for command ${index}`)
		      .addText(text => text
		      	.setPlaceholder('Introduce the script to execute. Output will be placed on your note')
		      	.setValue(this.plugin.settings.scripts[index])
		      	.onChange(async (value) => {
		      		this.plugin.settings.scripts[index] = value;
		      		await this.plugin.saveSettings();
		      	})
		      );
    }
}
