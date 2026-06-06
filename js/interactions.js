// Helper: safe addEventListener
function on(id, event, handler) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(event, handler);
    } else {
        console.warn('Missing element:', id);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Navigation
    on('prevPage', 'click', prevPage);
    on('nextPage', 'click', nextPage);

    // Sidebar toggle (close button in sidebar)
    on('closeSidebar', 'click', () => {
        document.getElementById('readerSidebar').classList.add('collapsed');
    });

    // Sidebar toggle (button in toolbar)
    on('toggleSidebarBtn', 'click', () => {
        document.getElementById('readerSidebar').classList.remove('collapsed');
    });

    // Side navigation arrows
    on('navLeft', 'click', prevPage);
    on('navRight', 'click', nextPage);

    // Bookmark button
    on('addBookmark', 'click', () => {
        toggleBookmark();
        updateBookmarkBtn();
    });

    // Settings panel toggle
    on('readerSettingsBtn', 'click', () => {
        document.getElementById('settingsPanel').classList.toggle('collapsed');
    });

    // Font size controls (toolbar)
    on('sizeUp', 'click', () => setFontSize(fontSize + 1));
    on('sizeDown', 'click', () => setFontSize(fontSize - 1));

    // Font size controls (settings panel)
    on('settingsSizeUp', 'click', () => setFontSize(fontSize + 1));
    on('settingsSizeDown', 'click', () => setFontSize(fontSize - 1));

    // Fonts
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.font) {
                setFont(btn.dataset.font);
            }
        });
    });

    // Line spacing
    document.querySelectorAll('.spacing-btn').forEach(btn => {
        btn.addEventListener('click', () => setLineSpacing(btn.dataset.spacing));
    });

    // Fullscreen toggle
    on('fullscreenBtn', 'click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Auto-hide navbar in fullscreen
    let hideTimeout = null;

    function showToolbar() {
        const bottomNav = document.querySelector('.reader-bottom-nav');
        const sideNavs = document.querySelectorAll('.reader-nav-side');
        const sidebar = document.getElementById('readerSidebar');
        if (bottomNav) bottomNav.style.opacity = '1';
        sideNavs.forEach(el => el.style.opacity = '1');
        if (sidebar) sidebar.style.transform = '';

        clearTimeout(hideTimeout);
        if (document.fullscreenElement) {
            hideTimeout = setTimeout(() => {
                if (bottomNav) bottomNav.style.opacity = '0';
                sideNavs.forEach(el => el.style.opacity = '0');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    sidebar.style.transform = 'translateX(-280px)';
                }
            }, 3000);
        }
    }

    document.addEventListener('mousemove', showToolbar);
    document.addEventListener('touchstart', showToolbar);

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            // Enter fullscreen — hide sidebar immediately, others after 3s
            const sidebar = document.getElementById('readerSidebar');
            if (sidebar && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
            }
            showToolbar();
        } else {
            // Exit fullscreen — show everything
            const toolbar = document.querySelector('.reader-toolbar');
            const bottomNav = document.querySelector('.reader-bottom-nav');
            const sideNavs = document.querySelectorAll('.reader-nav-side');
            const sidebar = document.getElementById('readerSidebar');
            if (toolbar) { toolbar.style.opacity = ''; }
            if (bottomNav) { bottomNav.style.opacity = ''; }
            sideNavs.forEach(el => { el.style.opacity = ''; });
            if (sidebar) { sidebar.classList.remove('collapsed'); sidebar.style.transform = ''; }
            clearTimeout(hideTimeout);
        }
    });

    // Touch swipe
    let touchStartX = 0;
    on('readerScroll', 'touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    on('readerScroll', 'touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextPage();
            else prevPage();
        }
    });

    // Sidebar Search
    on('readerSearchInput', 'input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.reader-book-item').forEach(item => {
            const title = item.querySelector('.reader-book-title').textContent.toLowerCase();
            const author = item.querySelector('.reader-book-author').textContent.toLowerCase();
            item.style.display = (title.includes(query) || author.includes(query)) ? 'flex' : 'none';
        });
    });

    // Import Button
    on('readerImportBtn', 'click', () => {
        document.getElementById('pdfModal').classList.add('active');
    });

    // Go To Page
    on('gotoPageBtn', 'click', openGoToPage);
    on('gotoCancel', 'click', () => document.getElementById('gotoModal').classList.remove('visible'));
    on('gotoGo', 'click', () => {
        const page = parseInt(document.getElementById('gotoInput').value);
        if (page >= 1 && page <= totalPagePairs) {
            currentPagePair = page - 1;
            renderPages();
            updateProgress();
            checkBookmark();
        }
        document.getElementById('gotoModal').classList.remove('visible');
    });

    on('gotoInput', 'keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('gotoGo').click();
        if (e.key === 'Escape') document.getElementById('gotoModal').classList.remove('visible');
    });

    on('gotoModal', 'click', (e) => {
        if (e.target === document.getElementById('gotoModal')) {
            document.getElementById('gotoModal').classList.remove('visible');
        }
    });

    // TTS
    on('ttsBtn', 'click', () => {
        const bar = document.getElementById('ttsBar');
        if (bar.classList.contains('visible')) {
            stopTTS();
        } else {
            bar.classList.add('visible');
            speakCurrentPage();
        }
    });

    on('ttsPlayPause', 'click', () => {
        if (ttsPlaying) {
            ttsPlaying = false;
            ttsGeneration++;
            speechSynthesis.cancel();
            document.getElementById('ttsPlayPause').textContent = '▶';
            document.getElementById('ttsPlayPause').classList.remove('playing');
        } else {
            speakCurrentPage();
        }
    });

    on('ttsClose', 'click', stopTTS);

    on('ttsRewind', 'click', () => {
        if (ttsUtterance) {
            speechSynthesis.cancel();
            if (ttsPlaying) speakCurrentPage();
        }
    });

    on('ttsForward', 'click', () => {
        if (ttsPlaying) {
            speechSynthesis.cancel();
            nextPage();
            setTimeout(() => speakCurrentPage(), 400);
        }
    });

    // Speed slider
    on('ttsSpeedSlider', 'input', (e) => {
        ttsSpeed = parseInt(e.target.value) / 100;
        document.getElementById('ttsSpeedValue').textContent = ttsSpeed.toFixed(1) + 'x';
        if (ttsPlaying) {
            ttsGeneration++;
            speechSynthesis.cancel();
            setTimeout(() => speakCurrentPage(), 50);
        }
    });

    // Voice picker
    on('ttsVoiceBtn', 'click', (e) => {
        e.stopPropagation();
        const picker = document.getElementById('voicePicker');
        if (picker.classList.contains('open')) {
            picker.classList.remove('open');
        } else {
            populateVoicePicker();
            picker.classList.add('open');
        }
    });

    document.addEventListener('click', (e) => {
        const picker = document.getElementById('voicePicker');
        if (!e.target.closest('.tts-voice-wrapper')) {
            picker.classList.remove('open');
        }
    });

    // Volume control
    on('ttsVolume', 'input', (e) => {
        ttsVolume = parseInt(e.target.value) / 100;
        updateVolumeIcon();
        if (ttsPlaying) {
            ttsGeneration++;
            speechSynthesis.cancel();
            setTimeout(() => speakCurrentPage(), 50);
        }
    });

    on('ttsVolIcon', 'click', () => {
        const slider = document.getElementById('ttsVolume');
        if (ttsVolume > 0) {
            ttsVolume = 0;
            slider.value = 0;
        } else {
            ttsVolume = 1;
            slider.value = 100;
        }
        updateVolumeIcon();
        if (ttsPlaying) {
            ttsGeneration++;
            speechSynthesis.cancel();
            setTimeout(() => speakCurrentPage(), 50);
        }
    });

    // Load voices
    speechSynthesis.onvoiceschanged = () => {
        const voices = getVoices();
        if (voices.length > 0) {
            autoSelectBestVoice();
        }
    };

    // Search
    on('searchBookBtn', 'click', () => {
        document.getElementById('searchBar').classList.toggle('visible');
        if (document.getElementById('searchBar').classList.contains('visible')) {
            document.getElementById('bookSearchInput').focus();
        } else {
            clearSearch();
        }
    });

    on('bookSearchInput', 'input', () => {
        const query = document.getElementById('bookSearchInput').value.trim().toLowerCase();
        if (query.length < 2) {
            document.getElementById('searchResultsInfo').classList.remove('visible');
            return;
        }

        searchMatches = [];
        let pageIndex = 0;
        for (const chapter of currentBook.chapters) {
            for (const page of chapter.pages) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = page;
                const text = tempDiv.textContent.toLowerCase();
                if (text.includes(query)) {
                    searchMatches.push(pageIndex);
                }
                pageIndex++;
            }
        }

        currentSearchIndex = 0;
        if (searchMatches.length > 0) {
            document.getElementById('searchResultsInfo').textContent = `Found ${searchMatches.length} page(s) containing "${document.getElementById('bookSearchInput').value}"`;
            document.getElementById('searchResultsInfo').classList.add('visible');
            goToSearchMatch();
        } else {
            document.getElementById('searchResultsInfo').textContent = `No results for "${document.getElementById('bookSearchInput').value}"`;
            document.getElementById('searchResultsInfo').classList.add('visible');
        }
    });

    on('searchNextBtn', 'click', () => {
        if (searchMatches.length === 0) return;
        currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;
        goToSearchMatch();
        const query = document.getElementById('bookSearchInput').value.trim().toLowerCase();
        document.getElementById('searchResultsInfo').textContent = `${currentSearchIndex + 1} of ${searchMatches.length} pages containing "${query}"`;
    });

    on('bookSearchInput', 'keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('searchNextBtn').click();
        if (e.key === 'Escape') {
            document.getElementById('searchBar').classList.remove('visible');
            clearSearch();
        }
    });
}

function populateVoicePicker() {
    const list = document.getElementById('voicePickerList');
    const allVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));

    if (allVoices.length === 0) {
        list.innerHTML = '<div class="voice-group-label">No voices available</div>';
        return;
    }

    const femaleKeywords = ['female', 'samantha', 'zira', 'hazel', 'karen', 'moira', 'tessa', 'susan', 'fiona', 'alice', 'virginia', 'sabina', 'catherine', 'kate', 'veena', 'heera', 'rishi'];
    const maleKeywords = ['male', 'david', 'mark', 'james', 'daniel', 'richard', 'george', 'arthur', 'tony', 'guy', 'liam', 'noah', 'matthew'];

    const female = [];
    const male = [];

    allVoices.forEach((v, i) => {
        const name = v.name.toLowerCase();
        const isFem = femaleKeywords.some(k => name.includes(k));
        const isMale = maleKeywords.some(k => name.includes(k));
        const entry = { voice: v, globalIndex: i };

        if (isFem) female.push(entry);
        else if (isMale) male.push(entry);
    });

    // Limit to 3 each, fill from remaining if needed
    const femaleLimited = female.slice(0, 3);
    const maleLimited = male.slice(0, 3);

    // If we don't have enough, fill from 'other' voices
    if (femaleLimited.length < 3 || maleLimited.length < 3) {
        const used = new Set([...femaleLimited, ...maleLimited].map(e => e.globalIndex));
        const others = allVoices
            .map((v, i) => ({ voice: v, globalIndex: i }))
            .filter(e => !used.has(e.globalIndex));

        for (const o of others) {
            if (femaleLimited.length < 3) femaleLimited.push(o);
            else if (maleLimited.length < 3) maleLimited.push(o);
            if (femaleLimited.length >= 3 && maleLimited.length >= 3) break;
        }
    }

    let html = '';

    html += '<div class="voice-group-label">👩 Female Voices</div>';
    femaleLimited.forEach(({ voice, globalIndex }) => {
        const active = globalIndex === ttsVoiceIndex ? ' active' : '';
        const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '').split(' ').slice(0, 2).join(' ');
        html += `<div class="voice-option${active}" data-index="${globalIndex}">
            <span class="voice-option-icon">👩</span>
            <span class="voice-option-name">${shortName}</span>
            <span class="voice-option-check">✓</span>
        </div>`;
    });

    html += '<div class="voice-group-label">🧑 Male Voices</div>';
    maleLimited.forEach(({ voice, globalIndex }) => {
        const active = globalIndex === ttsVoiceIndex ? ' active' : '';
        const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '').split(' ').slice(0, 2).join(' ');
        html += `<div class="voice-option${active}" data-index="${globalIndex}">
            <span class="voice-option-icon">🧑</span>
            <span class="voice-option-name">${shortName}</span>
            <span class="voice-option-check">✓</span>
        </div>`;
    });

    list.innerHTML = html;

    list.querySelectorAll('.voice-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const idx = parseInt(opt.dataset.index);
            ttsVoiceIndex = idx;

            const voice = allVoices[idx];
            const isFem = femaleKeywords.some(k => voice.name.toLowerCase().includes(k));
            const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '').split(' ').slice(0, 2).join(' ');
            document.getElementById('ttsVoiceBtn').textContent = (isFem ? '👩 ' : '🧑 ') + shortName;

            document.getElementById('voicePicker').classList.remove('open');

            if (ttsPlaying) {
                ttsGeneration++;
                speechSynthesis.cancel();
                setTimeout(() => speakCurrentPage(), 50);
            }
        });
    });
}

function updateVolumeIcon() {
    const icon = document.getElementById('ttsVolIcon');
    if (ttsVolume === 0) icon.textContent = '🔇';
    else if (ttsVolume < 0.3) icon.textContent = '🔈';
    else if (ttsVolume < 0.7) icon.textContent = '🔉';
    else icon.textContent = '🔊';
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        // Don't handle shortcuts when in hero/library pages
        if (typeof currentPage !== 'undefined' && currentPage !== 'reader') return;

        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        switch (e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextPage();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevPage();
                break;
            case 'f':
            case 'F':
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                break;
            case 'b':
            case 'B':
                toggleBookmark();
                break;
            case '/':
                e.preventDefault();
                document.getElementById('searchBar').classList.toggle('visible');
                if (document.getElementById('searchBar').classList.contains('visible')) {
                    document.getElementById('bookSearchInput').focus();
                }
                break;
            case 'g':
            case 'G':
                openGoToPage();
                break;
            case 'Escape':
                document.getElementById('settingsPanel').classList.add('collapsed');
                document.getElementById('readerSidebar').classList.add('collapsed');
                document.getElementById('searchBar').classList.remove('visible');
                document.getElementById('gotoModal').classList.remove('visible');
                document.getElementById('dictPopup').classList.remove('visible');
                break;
        }
    });
}

// ==========================================
// INITIALIZE
// ==========================================
function init() {
    cacheDOMElements();
    loadBookmarks();
    loadLastPosition();
    renderBookList();
    loadBook(currentBook);
    renderBookmarksList();
    setupEventListeners();
    setupKeyboard();
    setupReadingStats();
    setupPdfImport();

    // Apply saved theme
    applyReaderTheme(currentTheme);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try { init(); } catch(e) { console.error('Init error:', e); }
    });
} else {
    try { init(); } catch(e) { console.error('Init error:', e); }
}
