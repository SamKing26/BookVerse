// ==========================================
// STATE
// ==========================================
let currentBook = library[0];
let currentPagePair = 0;
let totalPagePairs = 0;
let bookmarks = new Set();
let currentTheme = 'sepia';
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
