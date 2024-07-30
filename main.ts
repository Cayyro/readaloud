import { Plugin, PluginSettingTab, Setting, requestUrl, Notice, App } from 'obsidian';

interface ReadAloudPluginSettings {
    apiKey: string;
    model: string;
    voice: string;
    speed: number;
}

const DEFAULT_SETTINGS: ReadAloudPluginSettings = {
    apiKey: '',
    model: 'tts-1',
    voice: 'alloy',
    speed: 1.0
}

export default class ReadAloudPlugin extends Plugin {
    settings: ReadAloudPluginSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ReadAloudSettingTab(this.app, this));

        this.addCommand({
            id: 'read-aloud',
            name: 'Read selected text aloud',
            editorCallback: (editor, view) => {
                this.speakText(editor.getSelection());
            }
        });
    }

    async sendTextToOpenAI(text: string) {
        try {
            const response = await requestUrl({
                url: 'https://api.openai.com/v1/audio/speech',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.settings.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.settings.model,
                    input: text,
                    voice: this.settings.voice,
                    speed: this.settings.speed
                }),
                contentType: 'application/json',
                responseType: 'arraybuffer'
            });
            return response;
        } catch (error) {
            console.error('Error sending text to OpenAI:', error);
            throw error;
        }
    }

    async speakText(text: string) {
        try {
            const response = await this.sendTextToOpenAI(text);
            this.playAudio(response.arrayBuffer);
        } catch (error) {
            new Notice('Failed to convert text to speech. Check console for details.');
        }
    }

    playAudio(arrayBuffer: ArrayBuffer) {
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        }, (error) => {
            console.error('Error decoding audio data:', error);
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
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

        containerEl.empty();

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
        const link = infoEl.createEl('a', { text: 'https://api.openai.com/v1/audio/speech', href: 'https://api.openai.com/v1/audio/speech' });
        link.setAttribute('target', '_blank');
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

        const coffeeLink = containerEl.createEl('a', { href: 'https://buymeacoffee.com/alyxo' });
        coffeeLink.setAttribute('target', '_blank');
        const coffeeImg = coffeeLink.createEl('img', { attr: { src: 'https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png', alt: 'Buy Me a Coffee' } });
        containerEl.appendChild(coffeeLink);
    }
}