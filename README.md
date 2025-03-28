# 🖼️ LLM Image Filter Extension

**An intelligent Chrome extension that automatically detects, tags, and filters AI-generated and stylistic images on Twitter/X**

This extension uses AI models to automatically analyze and classify images in real-time as you browse Twitter/X.

Server API codebase can be found at https://github.com/0xkrauser/smart-filter-api

## How It Works 🔧 <a name="how-it-works"></a>

1. **Image Detection**: The extension scans Twitter/X posts for images in real-time
2. **Data Conversion**: Images are converted to base64 format using optimized canvas processing
3. **AI Classification**: Images are sent to a smart filter API for analysis
4. **Tagging**: Results are tagged and stored locally for future reference
5. **Content Filtering**: Posts with certain tags are automatically blurred/collapsed
6. **User Control**: Users can click to reveal any filtered content

### Key Components

#### `FilterOverlay.tsx`
The main component that:
- Monitors Twitter posts for images
- Triggers AI classification
- Applies visual filters based on tags
- Manages local storage of results

#### `imageUtils.ts`
Handles image processing

#### `tweetStorage.ts`
Manages local data persistence:
- Tweet metadata and tags
- Classification results
- Expiration and cleanup

## Acknowledgments

- Built on the excellent [Chrome Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)

**⚠️ Disclaimer**: This extension is for educational and personal use. AI classification results may not be 100% accurate. Always use your own judgment when evaluating content.
