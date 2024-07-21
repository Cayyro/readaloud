declare module 'obsidian' {
    export class Plugin {
        constructor();
        onload(): void;
        onunload(): void;
        addCommand(command: Command): void;
        addSettingTab(settingTab: PluginSettingTab): void;
        registerDomEvent(element: HTMLElement | Document, type: string, callback: (event: any) => any, options?: boolean | AddEventListenerOptions): void;
        app: App;
        loadData(): Promise<any>;
        saveData(data: any): Promise<void>;
    }

    export class PluginSettingTab {
        constructor(app: App, plugin: Plugin);
        display(): void;
        containerEl: HTMLElement;
    }

    export class Setting {
        constructor(containerEl: HTMLElement);
        setName(name: string): this;
        setDesc(desc: string): this;
        addText(callback: (text: TextComponent) => any): this;
        addDropdown(callback: (dropdown: DropdownComponent) => any): this;
        addSlider(callback: (slider: SliderComponent) => any): this;
        setHeading(): this;
    }

    export interface Command {
        id: string;
        name: string;
        editorCallback?: (editor: Editor, view: MarkdownView) => void;
        callback?: () => void;
        checkCallback?: (checking: boolean) => boolean | void;
        hotkeys?: Hotkey[];
    }

    export interface Hotkey {
        modifiers: string[];
        key: string;
    }

    export class Notice {
        constructor(message: string, timeout?: number);
    }

    export class App {
        workspace: Workspace;
    }

    export class Workspace {
        activeLeaf: WorkspaceLeaf;
        getActiveViewOfType<T extends ItemView>(type: new (...args: any[]) => T): T | null;
        activeEditor: {
            editor: Editor;
        };
        on(event: string, callback: (...data: any) => any, ctx?: any): EventRef;
    }

    export class WorkspaceLeaf {
        getViewState(): ViewState;
        setViewState(viewState: ViewState, eState?: any): Promise<void>;
        view: MarkdownView;
    }

    export interface ViewState {
        type: string;
        state?: any;
    }

    export class TextComponent {
        setPlaceholder(placeholder: string): this;
        setValue(value: string): this;
        onChange(callback: (value: string) => any): this;
    }

    export class DropdownComponent {
        addOption(value: string, display: string): this;
        setValue(value: string): this;
        onChange(callback: (value: string) => any): this;
    }

    export class SliderComponent {
        setLimits(min: number, max: number, step: number): this;
        setValue(value: number): this;
        setDynamicTooltip(): this;
        onChange(callback: (value: number) => any): this;
    }

    export class Editor {
        getSelection(): string;
        replaceSelection(value: string): void;
    }

    export class MarkdownView extends ItemView {
        getViewType(): string;
        getMode(): string;
        setMode(mode: string): void;
        editor: Editor;
    }

    export class EventRef {
        constructor();
    }

    export interface HTMLElement {
        createDiv(): HTMLElement;
        createSpan(options: { text: string, cls?: string }): HTMLElement;
        createEl<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: { text?: string, cls?: string, attr?: Record<string, string>, href?: string }): HTMLElementTagNameMap[K];
        appendChild(child: HTMLElement | HTMLImageElement | HTMLAnchorElement): void;
        setAttribute(name: string, value: string): void;
        innerHTML: string;
    }
}

interface HTMLImageElement extends HTMLElement {
    src: string;
    alt: string;
}

interface HTMLAnchorElement extends HTMLElement {
    href: string;
    target: string;
}
