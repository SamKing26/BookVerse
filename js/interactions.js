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

    // Toolbar
    on('toggleSidebar', 'click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    on('toggleSettings', 'click', () => {
        document.getElementById('settingsPanel').classList.toggle('collapsed');
    });

    on('toggleToc', 'click', () => {
        document.getElementById('settingsPanel').classList.remove('collapsed');
    });

    on('addBookmark', 'click', toggleBookmark);

    on('toggleFullscreen', 'click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Themes
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // Fonts
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => setFont(btn.dataset.font));
    });

    // Font size
    on('sizeUp', 'click', () => setFontSize(fontSize + 1));
    on('sizeDown', 'click', () => setFontSize(fontSize - 1));

    // Line spacing
    document.querySelectorAll('.spacing-btn').forEach(btn => {
        btn.addEventListener('click', () => setLineSpacing(btn.dataset.spacing));
    });

    // Mouse wheel page turn
    on('readingArea', 'wheel', (e) => {
        if (e.deltaY > 30) nextPage();
        else if (e.deltaY < -30) prevPage();
    }, { passive: true });

    // Touch swipe
    let touchStartX = 0;
    on('readingArea', 'touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    on('readingArea', 'touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextPage();
            else prevPage();
        }
    });

    // Sidebar Search
    on('searchInput', 'input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.book-item').forEach(item => {
            const title = item.querySelector('.book-title-text').textContent.toLowerCase();
            const author = item.querySelector('.book-author-text').textContent.toLowerCase();
            item.style.display = (title.includes(query) || author.includes(query)) ? 'flex' : 'none';
        });
    });

    // Sidebar Import Button
    on('sidebarImportBtn', 'click', () => {
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

    // Focus Mode
    on('focusModeBtn', 'click', toggleFocusMode);

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
            ttsGeneration++; // kill old callbacks
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

    // Close voice picker when clicking outside
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

    // Load voices and auto-select best one
    speechSynthesis.onvoiceschanged = () => {
        const voices = getVoices();
        if (voices.length > 0) {
            console.log('Available voices:', voices.map(v => v.name));
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

    const femaleKeywords = ['female', 'samantha', 'zira', 'hazel', 'karen', 'moira', 'tessa', 'susan', 'fiona', 'alice', 'virginia', 'sabina', 'catherine', 'kate', 'daniel', 'veena', 'heera', 'rishi'];

    const female = [];
    const male = [];
    const other = [];

    allVoices.forEach((v, i) => {
        const name = v.name.toLowerCase();
        const isFem = femaleKeywords.some(k => name.includes(k));
        const entry = { voice: v, globalIndex: i };

        if (isFem) female.push(entry);
        else if (name.includes('male') || name.includes('david') || name.includes('mark') || name.includes('james') || name.includes('daniel') || name.includes('richard') || name.includes('george') || name.includes('arthur') || name.includes('tony') || name.includes('guy') || name.includes('liam') || name.includes('noah') || name.includes('matthew')) male.push(entry);
        else other.push(entry);
    });

    let html = '';

    if (female.length > 0) {
        html += '<div class="voice-group-label">👩 Female</div>';
        female.forEach(({ voice, globalIndex }) => {
            const active = globalIndex === ttsVoiceIndex ? ' active' : '';
            const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '');
            html += `<div class="voice-option${active}" data-index="${globalIndex}">
                <span class="voice-option-icon">👩</span>
                <span class="voice-option-name">${shortName}</span>
                <span class="voice-option-check">✓</span>
            </div>`;
        });
    }

    if (male.length > 0) {
        html += '<div class="voice-group-label">🧑 Male</div>';
        male.forEach(({ voice, globalIndex }) => {
            const active = globalIndex === ttsVoiceIndex ? ' active' : '';
            const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '');
            html += `<div class="voice-option${active}" data-index="${globalIndex}">
                <span class="voice-option-icon">🧑</span>
                <span class="voice-option-name">${shortName}</span>
                <span class="voice-option-check">✓</span>
            </div>`;
        });
    }

    if (other.length > 0) {
        html += '<div class="voice-group-label">🔊 Other</div>';
        other.forEach(({ voice, globalIndex }) => {
            const active = globalIndex === ttsVoiceIndex ? ' active' : '';
            const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '');
            html += `<div class="voice-option${active}" data-index="${globalIndex}">
                <span class="voice-option-icon">🔊</span>
                <span class="voice-option-name">${shortName}</span>
                <span class="voice-option-check">✓</span>
            </div>`;
        });
    }

    list.innerHTML = html;

    // Click handlers for each voice
    list.querySelectorAll('.voice-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const idx = parseInt(opt.dataset.index);
            ttsVoiceIndex = idx;

            // Update button label
            const voice = allVoices[idx];
            const isFem = femaleKeywords.some(k => voice.name.toLowerCase().includes(k));
            const shortName = voice.name.replace('Microsoft ', '').replace('Google ', '').split(' ').slice(0, 2).join(' ');
            document.getElementById('ttsVoiceBtn').textContent = (isFem ? '👩 ' : '🧑 ') + shortName;

            // Close picker
            document.getElementById('voicePicker').classList.remove('open');

            // Restart speech with new voice
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
                document.getElementById('sidebar').classList.add('collapsed');
                document.getElementById('searchBar').classList.remove('visible');
                document.getElementById('gotoModal').classList.remove('visible');
                document.getElementById('dictPopup').classList.remove('visible');
                toggleFocusMode();
                break;
        }
    });
}

// ==========================================
// INITIALIZE
// ==========================================
function init() {
    cacheDOMElements();
    renderBookList();
    loadBook(currentBook);
    setupEventListeners();
    setupKeyboard();
    setupReadingStats();
    setupPdfImport();

    // Preloader
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        document.getElementById('app').classList.add('visible');
    }, 2500);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try { init(); } catch(e) { console.error('Init error:', e); document.getElementById('preloader').innerHTML = '<p style="color:red;padding:20px;">Error: ' + e.message + '</p>'; }
    });
} else {
    try { init(); } catch(e) { console.error('Init error:', e); document.getElementById('preloader').innerHTML = '<p style="color:red;padding:20px;">Error: ' + e.message + '</p>'; }
}
