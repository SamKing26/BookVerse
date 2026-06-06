// ==========================================
// APP ROUTER — Page Navigation
// ==========================================
// Manages transitions between Hero → Library → Reader

let currentPage = localStorage.getItem('bookverse_page') || 'hero';
let selectedTheme = localStorage.getItem('bookverse_theme') || 'amber';

// ==========================================
// THEME DEFINITIONS
// ==========================================
const themeDefinitions = {
    midnight: {
        name: 'Midnight Scholar',
        subtitle: 'Dark · Focused',
        accent: '#a8b4cc',
        bg: '#050812',
        text: '#d1d9e6',
        textMuted: 'rgba(168, 180, 204, 0.6)'
    },
    amber: {
        name: 'Amber Candlelight',
        subtitle: 'Warm · Classic',
        accent: '#d4a853',
        bg: '#1a1408',
        text: '#f0e8d4',
        textMuted: 'rgba(212, 168, 83, 0.6)'
    },
    ivory: {
        name: 'Ivory Manuscript',
        subtitle: 'Light · Minimal',
        accent: '#78350f',
        bg: '#f5f2ed',
        text: '#1a1a1a',
        textMuted: 'rgba(26, 26, 26, 0.5)'
    },
    emerald: {
        name: 'Emerald Archives',
        subtitle: 'Rich · Natural',
        accent: '#10b981',
        bg: '#0a1a12',
        text: '#d4ede0',
        textMuted: 'rgba(16, 185, 129, 0.6)'
    },
    crimson: {
        name: 'Crimson Codex',
        subtitle: 'Bold · Dramatic',
        accent: '#fb7185',
        bg: '#1a0808',
        text: '#f0d4d4',
        textMuted: 'rgba(251, 113, 133, 0.6)'
    }
};

// ==========================================
// SAVE / RESTORE PAGE
// ==========================================
function saveCurrentPage(page) {
    currentPage = page;
    localStorage.setItem('bookverse_page', page);
}

// ==========================================
// PAGE TRANSITIONS
// ==========================================
function showHeroPage() {
    saveCurrentPage('hero');
    const hero = document.getElementById('heroPage');
    const library = document.getElementById('libraryPage');
    const app = document.getElementById('app');

    hero.classList.add('visible');
    hero.classList.remove('hidden');
    library.classList.remove('visible');
    library.classList.add('hidden');
    app.style.opacity = '0';
    app.style.pointerEvents = 'none';
}

function showLibraryPage() {
    saveCurrentPage('library');
    const hero = document.getElementById('heroPage');
    const library = document.getElementById('libraryPage');
    const app = document.getElementById('app');

    hero.classList.remove('visible');
    hero.classList.add('hidden');
    library.classList.add('visible');
    library.classList.remove('hidden');
    app.style.opacity = '0';
    app.style.pointerEvents = 'none';

    // Update theme card selection
    updateThemeCards();
}

function showReaderPage() {
    saveCurrentPage('reader');
    const hero = document.getElementById('heroPage');
    const library = document.getElementById('libraryPage');
    const app = document.getElementById('app');

    hero.classList.remove('visible');
    hero.classList.add('hidden');
    library.classList.remove('visible');
    library.classList.add('hidden');
    app.style.opacity = '1';
    app.style.pointerEvents = 'auto';

    // Apply the selected theme
    applyReaderTheme(selectedTheme);

    // Re-render book with new theme
    if (typeof renderBookList === 'function') {
        renderBookList();
    }
    if (typeof loadBook === 'function' && currentBook) {
        loadBook(currentBook);
    }
}

// ==========================================
// THEME SELECTION
// ==========================================
function selectTheme(theme) {
    selectedTheme = theme;
    localStorage.setItem('bookverse_theme', theme);
    updateThemeCards();
}

function updateThemeCards() {
    document.querySelectorAll('.theme-card').forEach(card => {
        const cardTheme = card.dataset.theme;
        card.classList.toggle('active', cardTheme === selectedTheme);
    });
}

function applyReaderTheme(theme) {
    const app = document.getElementById('app');
    if (!app) return;

    // Remove all theme classes
    app.className = '';
    // Add the selected theme class
    app.classList.add(`theme-${theme}`);

    // Also update CSS variables for backward compatibility
    const t = themeDefinitions[theme];
    if (t) {
        document.documentElement.style.setProperty('--accent', t.accent);
        document.documentElement.style.setProperty('--accent-light', t.accent);
    }

    // Update settings panel theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    currentTheme = theme;
}

// ==========================================
// EVENT SETUP
// ==========================================
function setupRouter() {
    // Hero page click/enter
    const heroClickArea = document.getElementById('heroClickArea');
    if (heroClickArea) {
        heroClickArea.addEventListener('click', () => {
            showLibraryPage();
        });
    }

    // Theme card clicks
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            selectTheme(card.dataset.theme);
        });
    });

    // Enter The Library button
    const enterBtn = document.getElementById('libraryEnterBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            showReaderPage();
        });
    }

    // Home button in reader toolbar → back to hero
    const goHome = document.getElementById('goHome');
    if (goHome) {
        goHome.addEventListener('click', () => {
            showHeroPage();
        });
    }

    // Settings panel theme buttons (in-reader theme switching)
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            if (theme && themeDefinitions[theme]) {
                selectTheme(theme);
                applyReaderTheme(theme);
            }
        });
    });

    // Keyboard: Enter on hero/library
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (currentPage === 'hero') {
                e.preventDefault();
                showLibraryPage();
            } else if (currentPage === 'library') {
                e.preventDefault();
                showReaderPage();
            }
        }
    });
}

// ==========================================
// INITIALIZE ROUTER
// ==========================================
function initRouter() {
    setupRouter();

    // Restore saved page or start at hero
    const savedPage = localStorage.getItem('bookverse_page') || 'hero';

    switch (savedPage) {
        case 'library':
            showLibraryPage();
            break;
        case 'reader':
            showReaderPage();
            break;
        default:
            showHeroPage();
    }
}

// Run router after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initRouter, 100);
    });
} else {
    setTimeout(initRouter, 100);
}
