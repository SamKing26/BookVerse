# BookVerse — Immersive eBook Reader

A beautiful, feature-rich eBook reader with realistic book feel.

## 📁 Project Structure

```
ebook-reader/
├── index.html              # Main HTML file
├── css/                    # Stylesheets
│   ├── variables.css       # CSS variables & reset
│   ├── preloader.css       # Loading animation
│   ├── layout.css          # App layout, sidebar, toolbar
│   ├── book.css            # Book pages, navigation, progress
│   ├── settings.css        # Settings panel
│   └── features.css        # Highlights, notes, search, TTS, etc.
├── js/                     # JavaScript modules
│   ├── book-data.js        # Book content data
│   ├── state.js            # App state variables
│   ├── book-renderer.js    # Core book rendering logic
│   ├── interactions.js     # Event handlers, keyboard shortcuts
│   └── pdf-import.js       # PDF parsing & import
├── assets/                 # Static assets
│   └── tokens.json         # Figma design tokens (optional)
├── figma-tokens.md         # Design token documentation
├── figma-sync.js           # Figma integration module
└── README.md               # This file
```

## 🚀 Quick Start

1. Open `index.html` in a modern browser
2. No build step required — all files are loaded via `<link>` and `<script>` tags
3. For PDF import, you need internet connection (pdf.js loaded from CDN)

## ✨ Features

### Core Reading
- 📖 Realistic 3D book pages with paper texture
- 📄 Page turn animations
- 🌓 4 reading themes (Day, Sepia, Night, Dark)
- 🔤 4 typefaces with adjustable size & spacing
- 📑 Table of contents navigation
- 🔖 Bookmarking
- 💾 Last position memory (localStorage)

### Advanced Features
- 📝 Text highlighting (4 colors)
- 📝 Notes & annotations
- 📖 Dictionary lookup (free API)
- 🔍 Search within book
- 🔊 Text-to-Speech (Read Aloud)
- 🎯 Focus/Immersion mode
- 📄 Go to page
- ⏱ Reading timer & stats

### Import
- 📥 PDF import (drag & drop)
- Text extraction from PDFs
- Customizable page spreads

### Navigation
- ⌨️ Keyboard shortcuts
- 🖱️ Mouse wheel page turn
- 📱 Touch swipe support

## 🎨 Figma Integration

### For Designers
1. See `figma-tokens.md` for all design tokens
2. Import colors, spacing, typography into Figma
3. Use component specs to recreate the UI

### For Developers
1. Export design tokens from Figma as JSON
2. Place in `assets/tokens.json`
3. The app auto-loads and applies them
4. Or use `figma-sync.js` to export current tokens back to Figma

### Figma MCP Workflow
If you have Figma MCP connected:
1. Read Figma design → extract tokens
2. Save as `assets/tokens.json`
3. BookVerse auto-applies the design

## 🔧 Customization

### Add New Books
Edit `js/book-data.js` and add to the `library` array:
```javascript
{
    id: 6,
    title: "Your Book",
    author: "Author Name",
    color: "linear-gradient(145deg, #color1, #color2)",
    icon: "📖",
    chapters: [
        {
            title: "Chapter 1",
            pages: ["<p>Page content...</p>"]
        }
    ]
}
```

### Change Theme Colors
Edit `css/variables.css` and modify the CSS custom properties.

### Add New Features
1. Create new CSS file in `css/`
2. Create new JS file in `js/`
3. Import in `index.html`

## 📱 Responsive

The reader works on:
- Desktop (full experience)
- Tablet (sidebar collapses)
- Mobile (optimized layout)

## 🛠 Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, flexbox, 3D transforms
- **Vanilla JavaScript** — No frameworks, no build step
- **pdf.js** — Mozilla's PDF library (CDN)
- **Web Speech API** — Text-to-Speech
- **localStorage** — Persistent settings & data

## 📄 License

Free to use and modify.
