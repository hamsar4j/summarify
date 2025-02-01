## Summarify

Summarify is a web extension that can be used to summarise webpages quickly using local LLMs. Built with Vite and TailwindCSS, it provides a lightweight and efficient way to generate summaries without relying on external APIs.

### Setup

1. Install dependencies

   ```console
   yarn install
   ```

2. Build the extension

   ```console
   yarn build
   ```

3. For Dev Testing

   ```console
   yarn dev
   ```

4. Load the extension in chrome
   - open chrome and go to chrome://extensions/
   - enable dev mode & click load unpacked
   - select the dist folder created by yarn build

The extension is now installed and ready to use!

### Running Ollama (Local LLM Backend)

Summarify leverages Ollama to run LLMs locally. Follow these steps to set it up:

1. Allow local access (MacOS)

```console
   launchctl setenv OLLAMA_ORIGINS "*"
```

2. Download the model

```console
   ollama pull {model_name}
```

3. Start ollama server

```console
   ollama serve
```

### Demo

![](https://github.com/hamsar4j/summarify/blob/main/public/screenshot_main.png)

![](https://github.com/hamsar4j/summarify/blob/main/public/screenshot_loading.png)

![](https://github.com/hamsar4j/summarify/blob/main/public/screenshot_text.png)
