// ==========================================
// STATE
// ==========================================
let currentBook = library[0];
let currentPagePair = 0;
let totalPagePairs = 0;
let bookmarks = new Map();
let currentTheme = localStorage.getItem('bookverse_theme') || 'amber';
let currentFont = "'EB Garamond', serif";
let fontSize = 18;
let lineHeight = 1.9;

// Highlights & Notes
let highlights = JSON.parse(localStorage.getItem('bookverse_highlights') || '[]');
let notes = JSON.parse(localStorage.getItem('bookverse_notes') || '[]');
let selectedText = '';

// Search
let searchMatches = [];
let currentSearchIndex = 0;

// TTS
let ttsUtterance = null;
let ttsPlaying = false;
let ttsSpeed = 1;
let ttsVolume = 1;
let ttsVoiceIndex = 0; // 0 = default, then cycles through available voices
const ttsSpeeds = [0.75, 1, 1.25, 1.5, 2];

// Reading Timer
let readingStartTime = Date.now();
let readingTimerInterval = null;

// PDF Import
let pdfRawPages = [];

// ==========================================
// THEME DEFINITIONS (5 Figma themes)
// ==========================================
const readerThemes = {
    midnight: {
        name: 'Midnight Scholar',
        subtitle: 'Dark · Focused',
        paper: 'rgba(10, 12, 20, 0.95)',
        text: '#d1d9e6',
        textMuted: 'rgba(168, 180, 204, 0.6)',
        accent: '#a8b4cc',
        bg: '#050812',
        icon: '🌙'
    },
    amber: {
        name: 'Amber Candlelight',
        subtitle: 'Warm · Classic',
        paper: 'rgba(26, 20, 8, 0.95)',
        text: '#f0e8d4',
        textMuted: 'rgba(212, 168, 83, 0.6)',
        accent: '#d4a853',
        bg: '#1a1408',
        icon: '🕯️'
    },
    ivory: {
        name: 'Ivory Manuscript',
        subtitle: 'Light · Minimal',
        paper: '#ffffff',
        text: '#1a1a1a',
        textMuted: 'rgba(26, 26, 26, 0.5)',
        accent: '#78350f',
        bg: '#f5f2ed',
        icon: '📜'
    },
    emerald: {
        name: 'Emerald Archives',
        subtitle: 'Rich · Natural',
        paper: 'rgba(10, 26, 18, 0.95)',
        text: '#d4ede0',
        textMuted: 'rgba(16, 185, 129, 0.6)',
        accent: '#10b981',
        bg: '#0a1a12',
        icon: '🌿'
    },
    crimson: {
        name: 'Crimson Codex',
        subtitle: 'Bold · Dramatic',
        paper: 'rgba(26, 8, 8, 0.95)',
        text: '#f0d4d4',
        textMuted: 'rgba(251, 113, 133, 0.6)',
        accent: '#fb7185',
        bg: '#1a0808',
        icon: '🔥'
    }
};

// ==========================================
// IMPORTED BOOKS PERSISTENCE
// ==========================================
function loadImportedBooks() {
    try {
        const saved = JSON.parse(localStorage.getItem('bookverse_importedBooks') || '[]');
        saved.forEach(book => {
            if (!library.find(b => b.id === book.id)) {
                library.push(book);
            }
        });
    } catch (e) {}
}

function saveImportedBooks() {
    const imported = library.filter(b => b.isPdf);
    localStorage.setItem('bookverse_importedBooks', JSON.stringify(imported));
}

// Load on startup
loadImportedBooks();
