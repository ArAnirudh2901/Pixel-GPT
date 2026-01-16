# AI Image Editor

A conversational AI-powered image editor built with Next.js 16 and ImageKit.io. Describe your edits in natural language and watch them apply in real-time.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![ImageKit](https://img.shields.io/badge/ImageKit-SDK-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## Features

- 🖼️ **Live Image Transformations** - Real-time preview using ImageKit SDK
- 🤖 **AI-Powered Editing** - Describe edits in natural language (powered by Gemini)
- ↩️ **Undo Support** - Revert to previous transformation states
- 💾 **Persistent Sessions** - Chat history saved to MongoDB Atlas
- 📤 **Drag & Drop Upload** - Automatic upload to ImageKit

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd ai-image-editor
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
# MongoDB
MONGODB_URI="your-mongodb-uri"
MONGODB_DB="ai_image_editor"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# ImageKit (Server-side)
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# ImageKit (Client-side)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Click **Launch Editor**
2. Upload an image (drag & drop or click)
3. Describe your edits:
   - "Remove the background"
   - "Crop to face"
   - "Add drop shadow"
   - "Make it grayscale"
   - "Resize to 16:9"
4. Click **↩ Undo** to revert changes
5. Click **+ New Image** to start fresh

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Framework |
| @imagekit/next | Image transformations |
| @google/generative-ai | AI chat (Gemini) |
| MongoDB | Session persistence |
| Tailwind CSS | Styling |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Generate transformation params |
| `/api/upload-auth` | GET | ImageKit upload credentials |
| `/api/history` | GET/POST | Load/save session history |

## License

MIT
