import { Plugin, PluginSettingTab, Setting, Notice, App, WorkspaceLeaf, MarkdownView } from 'obsidian';
import axios from 'axios';

interface ReadAloudPluginSettings {
    apiKey: string;
    model: string;
    voice: string;
    speed: number;
}

const DEFAULT_SETTINGS: ReadAloudPluginSettings = {
    apiKey: '',
    model: 'tts-1',
    voice: 'echo',
    speed: 1.0,
};

export default class ReadAloudPlugin extends Plugin {
    settings: ReadAloudPluginSettings = DEFAULT_SETTINGS;

    async onload() {
        console.log('loading Read Aloud plugin');

        await this.loadSettings();

        this.addCommand({
            id: 'read-aloud',
            name: 'Read Aloud',
            editorCallback: (editor, view) => {
                this.speakText(editor.getSelection());
            }
        });

        this.addSettingTab(new ReadAloudSettingTab(this.app, this));

        this.registerDomEvent(document, 'keydown', (event: KeyboardEvent) => {
            if (event.key === 'R' && event.ctrlKey && event.shiftKey) {
                const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (activeLeaf) {
                    const selectedText = window.getSelection()?.toString() || '';
                    this.speakText(selectedText);
                } else {
                    const editor = this.app.workspace.activeEditor?.editor;
                    if (editor) {
                        this.speakText(editor.getSelection());
                    }
                }
            }
        });
    }

    onunload() {
        console.log('unloading Read Aloud plugin');
    }

    async speakText(text: string) {
        if (!text) {
            new Notice('Please select some text first.');
            return;
        }

        const charCount = text.length;
        const costPerMillionChars = this.settings.model === 'tts-1' ? 15.0 : 30.0;
        const cost = (charCount / 1_000_000) * costPerMillionChars;

        new Notice(`Text is being sent to OpenAI for processing. Estimated cost: $${cost.toFixed(4)}`);

        try {
            const response = await this.sendTextToOpenAI(text);
            this.playAudio(response.data as ArrayBuffer);
        } catch (error) {
            console.error('Error:', error);
            new Notice('Error: Unable to read aloud the selected text.');
        }
    }

    async sendTextToOpenAI(text: string) {
        try {
            const response = await axios.post('https://api.openai.com/v1/audio/speech', {
                model: this.settings.model,
                input: text,
                voice: this.settings.voice,
                speed: this.settings.speed
            }, {
                headers: {
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });
            return response;
        } catch (error) {
            console.error('Error sending text to OpenAI:', error);
            throw error;
        }
    }

    playAudio(data: ArrayBuffer) {
        const blob = new Blob([data], { type: 'audio/mp3' });
        const url = window.URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    }

    async loadSettings() {
        try {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        } catch (error) {
            console.error('Failed to load settings:', error);
            new Notice('Failed to load settings. Please check your settings file.');
            this.settings = DEFAULT_SETTINGS;
        }
    }

    async saveSettings() {
        try {
            await this.saveData(this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            new Notice('Failed to save settings. Please try again.');
        }
    }
}

class ReadAloudSettingTab extends PluginSettingTab {
    plugin: ReadAloudPlugin;

    constructor(app: App, plugin: ReadAloudPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.innerHTML = '';

        new Setting(containerEl)
            .setName('Read aloud plugin settings')
            .setHeading();

        const infoEl = containerEl.createDiv();
        infoEl.createSpan({ text: 'This plugin uses OpenAI to convert selected text to speech.' });
        infoEl.createEl('br');
        infoEl.createSpan({ text: 'The text is sent to OpenAI for processing. You will need an OpenAI API key in order for this plugin to function.' });
        infoEl.createEl('br');
        infoEl.createEl('br');
        infoEl.createSpan({ text: 'The URL where your text is sent is:' });
        infoEl.createEl('a', { text: 'https://api.openai.com/v1/audio/speech', href: 'https://api.openai.com/v1/audio/speech', attr: { target: '_blank' } });
        infoEl.createEl('br');
        infoEl.createEl('br');

        const costInfoEl = containerEl.createDiv();
        costInfoEl.createSpan({ text: 'Be aware, converting text to speech by OpenAI costs money.' });
        costInfoEl.createEl('br');
        costInfoEl.createSpan({ text: 'Standard model is $15.00 per 1M characters.' });
        costInfoEl.createEl('br');
        costInfoEl.createSpan({ text: 'HD model is $30.00 per 1M characters.' });
        costInfoEl.createEl('br');
        costInfoEl.createEl('br');
        costInfoEl.createSpan({ text: 'An Obsidian message in the top right corner will provide an estimate of the cost for the conversion you have sent.' });
        costInfoEl.createEl('br');
        costInfoEl.createEl('br');

        new Setting(containerEl)
            .setName('Read aloud settings')
            .setHeading();

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Enter your OpenAI API key.')
            .addText(text => text
                .setPlaceholder('API Key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Model')
            .setDesc('Select the model quality.')
            .addDropdown(dropdown => dropdown
                .addOption('tts-1', 'Standard')
                .addOption('tts-1-hd', 'High Definition')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Voice')
            .setDesc('Select the voice.')
            .addDropdown(dropdown => dropdown
                .addOption('alloy', 'Alloy')
                .addOption('echo', 'Echo')
                .addOption('fable', 'Fable')
                .addOption('onyx', 'Onyx')
                .addOption('nova', 'Nova')
                .addOption('shimmer', 'Shimmer')
                .setValue(this.plugin.settings.voice)
                .onChange(async (value) => {
                    this.plugin.settings.voice = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Speed')
            .setDesc('Set the speech speed.')
            .addSlider(slider => slider
                .setLimits(0.25, 4.0, 0.05)
                .setValue(this.plugin.settings.speed)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.speed = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Creator Info')
            .setHeading();

        const supportEl = containerEl.createDiv();
        supportEl.createSpan({ text: 'Hi, I am AlyxO. If you find this plugin useful, you can support me by buying me a coffee.' });
        supportEl.createEl('br');

        const coffeeLink = containerEl.createEl('a', { href: 'https://buymeacoffee.com/alyxo', attr: { target: '_blank' } });
        const coffeeImg = document.createElement('img');
        coffeeImg.src = 'https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png';
        coffeeImg.alt = 'Buy Me a Coffee';
        coffeeLink.appendChild(coffeeImg);
        containerEl.appendChild(coffeeLink);
    }
}
