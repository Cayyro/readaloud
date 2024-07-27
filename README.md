# Read Aloud Plugin for Obsidian

The Read Aloud Plugin for Obsidian uses OpenAI's Text-to-Speech (TTS) API to convert selected text within Obsidian notes into speech. This plugin provides a convenient way to listen to your notes, improving accessibility and enhancing your note-taking experience.

## Features

- **Text-to-Speech Conversion**: Converts selected text to speech using OpenAI's TTS API.
- **Model Selection**: Choose between standard (`tts-1`) and high-definition (`tts-1-hd`) models.
- **Voice Selection**: Select from a variety of voices, including Alloy, Echo, Fable, Onyx, Nova, and Shimmer.
- **Speed Control**: Adjust the speech speed with a slider (range: 0.25 to 4.0, default: 1.0).
- **Cost Estimation**: Provides an estimated cost for the text-to-speech conversion based on the selected model.

## Usage

1. **API Key**: Enter your OpenAI API key in the plugin settings.
2. **Model Selection**: Choose the TTS model (`Standard` or `High Definition`).
3. **Voice Selection**: Select the desired voice.
4. **Speed Control**: Adjust the speech speed as needed.
5. **Read Aloud**: Highlight the text in your note and press `Ctrl + Shift + R` to convert it to speech.

## Cost Information

- **Standard Model**: $15.00 per 1 million characters
- **High Definition Model**: $30.00 per 1 million characters

An Obsidian message will provide an estimate of the cost for the conversion you have sent.

## Installation

1. Download the plugin files and place them in your Obsidian vault's plugin folder.
2. Enable the plugin in Obsidian's community plugins settings.
3. Configure the plugin settings with your OpenAI API key and desired options.

## Support

If you find this plugin useful, you can support the developer by [buying a coffee](https://buymeacoffee.com/alyxo).

---

This plugin uses the OpenAI API for text-to-speech conversion. For more details, visit the [OpenAI API documentation](https://api.openai.com/v1/audio/speech).