// ==========================================
// FIGMA DESIGN SYNC
// ==========================================
// This module allows syncing design tokens from Figma
// and applying them to the reader.
//
// HOW TO USE:
// 1. Export design tokens from Figma as JSON
// 2. Place the JSON file in assets/tokens.json
// 3. Call loadFigmaTokens() to apply them
// ==========================================

const figmaTokens = {
    colors: {},
    spacing: {},
    typography: {},
    shadows: {},
    borderRadius: {}
};

// Default tokens (fallback)
const defaultTokens = {
    colors: {
        bg: '#1a1410',
        bgLight: '#2a2118',
        paper: '#f1e8d5',
        text: '#2c1810',
        textMuted: '#6b5b4e',
        accent: '#8b4513',
        accentLight: '#c4956a',
        uiText: '#f5efe6',
        uiMuted: 'rgba(245, 239, 230, 0.5)',
        highlights: {
            yellow: 'rgba(255, 230, 100, 0.35)',
            green: 'rgba(100, 220, 120, 0.3)',
            blue: 'rgba(100, 180, 255, 0.3)',
            pink: 'rgba(255, 120, 160, 0.3)'
        }
    },
    spacing: {
        pagePadding: '50px',
        sidebarWidth: '320px',
        settingsWidth: '300px',
        bookWidth: '580px',
        bookHeight: '780px'
    },
    typography: {
        fontSerif: "'EB Garamond', 'Cormorant Garamond', serif",
        fontDisplay: "'Playfair Display', serif",
        fontUI: "'Inter', sans-serif",
        bodySize: '18px',
        chapterTitle: '32px',
        pageNumber: '11px',
        chapterLabel: '10px',
        dropCap: '72px',
        lineHeight: '1.9'
    },
    shadows: {
        page: '2px 2px 15px rgba(0,0,0,0.2)',
        book: 'rgba(0,0,0,0.4)',
        card: '2px 2px 8px rgba(0,0,0,0.3)',
        popup: '0 8px 30px rgba(0,0,0,0.4)',
        modal: '0 12px 40px rgba(0,0,0,0.5)'
    },
    borderRadius: {
        page: '0 4px 4px 0',
        pageLeft: '4px 0 0 4px',
        button: '8px',
        card: '10px',
        modal: '14px',
        tooltip: '6px'
    }
};

// Apply tokens to CSS variables
function applyTokens(tokens) {
    const root = document.documentElement;

    // Colors
    if (tokens.colors) {
        if (tokens.colors.bg) root.style.setProperty('--bg', tokens.colors.bg);
        if (tokens.colors.bgLight) root.style.setProperty('--bg-light', tokens.colors.bgLight);
        if (tokens.colors.paper) root.style.setProperty('--paper', tokens.colors.paper);
        if (tokens.colors.text) root.style.setProperty('--text', tokens.colors.text);
        if (tokens.colors.textMuted) root.style.setProperty('--text-muted', tokens.colors.textMuted);
        if (tokens.colors.accent) root.style.setProperty('--accent', tokens.colors.accent);
        if (tokens.colors.accentLight) root.style.setProperty('--accent-light', tokens.colors.accentLight);
        if (tokens.colors.uiText) root.style.setProperty('--ui-text', tokens.colors.uiText);
        if (tokens.colors.uiMuted) root.style.setProperty('--ui-muted', tokens.colors.uiMuted);
    }

    // Spacing
    if (tokens.spacing) {
        if (tokens.spacing.pagePadding) root.style.setProperty('--page-padding', tokens.spacing.pagePadding);
        if (tokens.spacing.bookWidth) root.style.setProperty('--book-width', tokens.spacing.bookWidth);
        if (tokens.spacing.bookHeight) root.style.setProperty('--book-height', tokens.spacing.bookHeight);
    }

    // Typography
    if (tokens.typography) {
        if (tokens.typography.fontSerif) root.style.setProperty('--font-serif', tokens.typography.fontSerif);
        if (tokens.typography.fontDisplay) root.style.setProperty('--font-display', tokens.typography.fontDisplay);
        if (tokens.typography.fontUI) root.style.setProperty('--font-ui', tokens.typography.fontUI);
        if (tokens.typography.bodySize) root.style.setProperty('--font-size', tokens.typography.bodySize);
        if (tokens.typography.lineHeight) root.style.setProperty('--line-height', tokens.typography.lineHeight);
    }
}

// Load tokens from JSON file
async function loadFigmaTokens(url = 'assets/tokens.json') {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Tokens file not found');
        const tokens = await response.json();
        applyTokens(tokens);
        console.log('✅ Figma tokens loaded successfully');
        return tokens;
    } catch (error) {
        console.log('ℹ️ No Figma tokens found, using defaults');
        applyTokens(defaultTokens);
        return defaultTokens;
    }
}

// Export for Figma plugin communication
function exportTokensForFigma() {
    const root = document.documentElement;
    const computed = getComputedStyle(root);

    return {
        colors: {
            bg: computed.getPropertyValue('--bg').trim(),
            bgLight: computed.getPropertyValue('--bg-light').trim(),
            paper: computed.getPropertyValue('--paper').trim(),
            text: computed.getPropertyValue('--text').trim(),
            textMuted: computed.getPropertyValue('--text-muted').trim(),
            accent: computed.getPropertyValue('--accent').trim(),
            accentLight: computed.getPropertyValue('--accent-light').trim(),
            uiText: computed.getPropertyValue('--ui-text').trim()
        },
        spacing: {
            pagePadding: computed.getPropertyValue('--page-padding').trim(),
            bookWidth: computed.getPropertyValue('--book-width').trim(),
            bookHeight: computed.getPropertyValue('--book-height').trim()
        },
        typography: {
            fontSerif: computed.getPropertyValue('--font-serif').trim(),
            fontDisplay: computed.getPropertyValue('--font-display').trim(),
            fontUI: computed.getPropertyValue('--font-ui').trim(),
            bodySize: computed.getPropertyValue('--font-size').trim(),
            lineHeight: computed.getPropertyValue('--line-height').trim()
        }
    };
}

// Initialize tokens on load
document.addEventListener('DOMContentLoaded', () => {
    loadFigmaTokens();
});
