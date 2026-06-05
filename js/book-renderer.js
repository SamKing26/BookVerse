// ==========================================
// DOM ELEMENTS (lazy — set on init)
// ==========================================
let pageLeft, pageRight, leftContent, rightContent;
let leftChapter, rightChapter, leftPageNum, rightPageNum;
let leftFooterNum, rightFooterNum, progressFill;
let toolbarTitle, bookList, tocList, bookmarkIndicator;

function cacheDOMElements() {
    pageLeft = document.getElementById('pageLeft');
    pageRight = document.getElementById('pageRight');
    leftContent = document.getElementById('leftContent');
    rightContent = document.getElementById('rightContent');
    leftChapter = document.getElementById('leftChapter');
    rightChapter = document.getElementById('rightChapter');
    leftPageNum = document.getElementById('leftPageNum');
    rightPageNum = document.getElementById('rightPageNum');
    leftFooterNum = document.getElementById('leftFooterNum');
    rightFooterNum = document.getElementById('rightFooterNum');
    progressFill = document.getElementById('progressFill');
    toolbarTitle = document.getElementById('toolbarTitle');
    bookList = document.getElementById('bookList');
    tocList = document.getElementById('tocList');
    bookmarkIndicator = document.getElementById('bookmarkIndicator');
}

// ==========================================
// LOAD BOOK
// ==========================================
function loadBook(book) {
    currentBook = book;
    currentPagePair = 0;
    totalPagePairs = book.chapters.reduce((sum, ch) => sum + ch.pages.length, 0);
    toolbarTitle.textContent = book.title;

    loadLastPosition();
    renderTOC();
    renderPages();
    updateProgress();
    checkBookmark();
    updateHighlightCount();
}

// ==========================================
// BOOK LIST
// ==========================================
function renderBookList() {
    const booksHtml = library.map(book => `
        <div class="book-item ${book.id === currentBook.id ? 'active' : ''}" data-id="${book.id}">
            <div class="book-thumb" style="background: ${book.color}">
                ${book.icon}
            </div>
            <div class="book-info">
                <div class="book-title-text">${book.title}</div>
                <div class="book-author-text">${book.author}</div>
                ${book.progress > 0 ? `
                    <div class="book-progress">${book.progress}% complete</div>
                    <div class="book-progress-bar">
                        <div class="book-progress-fill" style="width: ${book.progress}%"></div>
                    </div>
                ` : '<div class="book-progress">Not started</div>'}
            </div>
        </div>
    `).join('');

    // Keep the import button, just update the book list
    const importBtn = bookList.querySelector('#sidebarImportBtn')?.parentElement;
    bookList.innerHTML = '';
    if (importBtn) bookList.appendChild(importBtn);

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'book-section-title';
    sectionTitle.textContent = 'Reading Now';
    bookList.appendChild(sectionTitle);

    const temp = document.createElement('div');
    temp.innerHTML = booksHtml;
    while (temp.firstChild) {
        bookList.appendChild(temp.firstChild);
    }

    bookList.querySelectorAll('.book-item').forEach(item => {
        item.addEventListener('click', () => {
            const bookId = parseInt(item.dataset.id);
            const book = library.find(b => b.id === bookId);
            if (book) {
                loadBook(book);
                renderBookList();
            }
        });
    });
}

// ==========================================
// TABLE OF CONTENTS
// ==========================================
function renderTOC() {
    let pageNum = 1;
    tocList.innerHTML = currentBook.chapters.map((ch, i) => {
        const pageStart = pageNum;
        pageNum += ch.pages.length * 2;
        return `
            <li class="toc-item" data-chapter="${i}">
                <span>${ch.title}</span>
                <span class="toc-page">p. ${pageStart}</span>
            </li>
        `;
    }).join('');

    tocList.querySelectorAll('.toc-item').forEach(item => {
        item.addEventListener('click', () => {
            const chapterIdx = parseInt(item.dataset.chapter);
            let targetPage = 0;
            for (let i = 0; i < chapterIdx; i++) {
                targetPage += currentBook.chapters[i].pages.length;
            }
            currentPagePair = targetPage;
            renderPages();
            updateProgress();
            checkBookmark();
        });
    });
}

// ==========================================
// RENDER PAGES
// ==========================================
function renderPages() {
    const { leftPage, rightPage, leftCh, rightCh, leftNum, rightNum } = getPageData(currentPagePair);

    leftContent.innerHTML = leftPage || '';
    rightContent.innerHTML = rightPage || '';

    // Add imported-text class for PDF books (tighter spacing)
    const importClass = currentBook.isPdf ? ' imported-text' : '';
    leftContent.className = 'page-text' + importClass;
    rightContent.className = 'page-text' + importClass;

    leftChapter.textContent = leftCh || '';
    rightChapter.textContent = rightCh || '';

    leftPageNum.textContent = leftNum || '';
    rightPageNum.textContent = rightNum || '';
    leftFooterNum.textContent = leftNum || '';
    rightFooterNum.textContent = rightNum || '';

    applyFontSettings();

    pageLeft.style.opacity = '0';
    pageRight.style.opacity = '0';
    pageLeft.style.transform = 'translateX(-10px)';
    pageRight.style.transform = 'translateX(10px)';

    requestAnimationFrame(() => {
        pageLeft.style.transition = 'all 0.4s ease';
        pageRight.style.transition = 'all 0.4s ease';
        pageLeft.style.opacity = '1';
        pageRight.style.opacity = '1';
        pageLeft.style.transform = 'translateX(0)';
        pageRight.style.transform = 'translateX(0)';
    });

    document.getElementById('prevPage').disabled = currentPagePair <= 0;
    document.getElementById('nextPage').disabled = currentPagePair >= totalPagePairs - 1;

    saveLastPosition();
    updateReadingStats();
}

function getPageData(pairIndex) {
    let globalIndex = 0;
    for (const chapter of currentBook.chapters) {
        for (let p = 0; p < chapter.pages.length; p++) {
            if (globalIndex === pairIndex) {
                const pageNum = (pairIndex * 2) + 1;
                return {
                    leftPage: p > 0 ? chapter.pages[p - 1] : '',
                    rightPage: chapter.pages[p],
                    leftCh: p > 0 ? chapter.title : '',
                    rightCh: chapter.title,
                    leftNum: p > 0 ? pageNum.toString() : '',
                    rightNum: (pageNum + 1).toString()
                };
            }
            globalIndex++;
        }
    }
    const lastChapter = currentBook.chapters[currentBook.chapters.length - 1];
    const lastPage = lastChapter.pages[lastChapter.pages.length - 1];
    const num = (pairIndex * 2) + 1;
    return {
        leftPage: lastPage,
        rightPage: '',
        leftCh: lastChapter.title,
        rightCh: '',
        leftNum: num.toString(),
        rightNum: (num + 1).toString()
    };
}

// ==========================================
// PAGE TURN
// ==========================================
function nextPage() {
    if (currentPagePair < totalPagePairs - 1) {
        const book = document.getElementById('book');
        book.style.transform = 'rotateY(-5deg)';
        setTimeout(() => { book.style.transform = 'rotateY(0deg)'; }, 300);

        currentPagePair++;
        renderPages();
        updateProgress();
        checkBookmark();
    }
}

function prevPage() {
    if (currentPagePair > 0) {
        const book = document.getElementById('book');
        book.style.transform = 'rotateY(5deg)';
        setTimeout(() => { book.style.transform = 'rotateY(0deg)'; }, 300);

        currentPagePair--;
        renderPages();
        updateProgress();
        checkBookmark();
    }
}

// ==========================================
// PROGRESS
// ==========================================
function updateProgress() {
    const progress = totalPagePairs > 0
        ? ((currentPagePair + 1) / totalPagePairs) * 100
        : 0;
    progressFill.style.width = progress + '%';
    currentBook.progress = Math.round(progress);
}

// ==========================================
// BOOKMARKS
// ==========================================
function checkBookmark() {
    const key = `${currentBook.id}-${currentPagePair}`;
    bookmarkIndicator.classList.toggle('active', bookmarks.has(key));
}

function toggleBookmark() {
    const key = `${currentBook.id}-${currentPagePair}`;
    if (bookmarks.has(key)) {
        bookmarks.delete(key);
    } else {
        bookmarks.add(key);
    }
    checkBookmark();
}

// ==========================================
// THEME
// ==========================================
function setTheme(theme) {
    currentTheme = theme;
    const themes = {
        day: { paper: '#f8f4eb', text: '#2c1810', textMuted: '#6b5b4e' },
        sepia: { paper: '#f1e8d5', text: '#2c1810', textMuted: '#6b5b4e' },
        night: { paper: '#1a1a1a', text: '#e8e0d4', textMuted: '#9a8e80' },
        dark: { paper: '#0d0d0d', text: '#d4ccc0', textMuted: '#7a7068' }
    };

    const t = themes[theme];
    document.documentElement.style.setProperty('--paper', t.paper);
    document.documentElement.style.setProperty('--text', t.text);
    document.documentElement.style.setProperty('--text-muted', t.textMuted);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    const overlay = document.getElementById('ambientOverlay');
    overlay.classList.toggle('active', theme === 'night' || theme === 'dark');
}

// ==========================================
// FONT SETTINGS
// ==========================================
function applyFontSettings() {
    document.querySelectorAll('.page-text').forEach(el => {
        el.style.fontFamily = currentFont;
        el.style.fontSize = fontSize + 'px';
        el.style.lineHeight = lineHeight;
    });
}

function setFont(font) {
    currentFont = font;
    applyFontSettings();
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.font === font);
    });
}

function setFontSize(size) {
    fontSize = Math.max(14, Math.min(28, size));
    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    document.getElementById('sizeValue').textContent = fontSize + 'px';
    applyFontSettings();
}

function setLineSpacing(spacing) {
    lineHeight = parseFloat(spacing);
    document.documentElement.style.setProperty('--line-height', lineHeight);
    applyFontSettings();
    document.querySelectorAll('.spacing-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.spacing === spacing);
    });
}

// ==========================================
// LAST POSITION MEMORY
// ==========================================
function saveLastPosition() {
    const data = { bookId: currentBook.id, page: currentPagePair };
    localStorage.setItem('bookverse_lastPosition', JSON.stringify(data));
}

function loadLastPosition() {
    try {
        const data = JSON.parse(localStorage.getItem('bookverse_lastPosition'));
        if (data && data.bookId === currentBook.id) {
            currentPagePair = data.page || 0;
        }
    } catch (e) {}
}

// ==========================================
// HIGHLIGHTS & NOTES
// ==========================================
function applyHighlight(color) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = `highlight-${color}`;
    span.setAttribute('data-highlight-id', Date.now());

    try {
        range.surroundContents(span);

        const highlightData = {
            id: Date.now(),
            text: selectedText,
            color: color,
            bookId: currentBook.id,
            page: currentPagePair,
            timestamp: new Date().toISOString()
        };

        highlights.push(highlightData);
        saveHighlights();
        updateHighlightCount();
    } catch (e) {
        console.log('Complex selection - use note instead');
    }
}

function addHighlightAndNote(text, color, comment) {
    const highlightData = {
        id: Date.now(),
        text: text,
        color: color,
        bookId: currentBook.id,
        page: currentPagePair,
        comment: comment,
        timestamp: new Date().toISOString()
    };

    highlights.push(highlightData);
    notes.push(highlightData);
    saveHighlights();
    saveNotes();
    updateHighlightCount();
    renderNotesList();
}

function saveHighlights() {
    localStorage.setItem('bookverse_highlights', JSON.stringify(highlights));
}

function saveNotes() {
    localStorage.setItem('bookverse_notes', JSON.stringify(notes));
}

function updateHighlightCount() {}

function renderNotesList() {
    const body = document.getElementById('notesBody');
    const bookNotes = notes.filter(n => n.bookId === currentBook.id);

    if (bookNotes.length === 0) {
        body.innerHTML = `
            <div class="note-empty">
                <span class="note-empty-icon">📝</span>
                Select text to highlight or add notes
            </div>`;
        return;
    }

    body.innerHTML = bookNotes.reverse().map(note => `
        <div class="note-item">
            <div class="note-highlight-text">"${escapeHtml(note.text.substring(0, 100))}${note.text.length > 100 ? '...' : ''}"</div>
            ${note.comment ? `<div class="note-comment">${escapeHtml(note.comment)}</div>` : ''}
            <div class="note-meta">
                <span>Page ${note.page + 1}</span>
                <button class="note-delete" data-id="${note.id}">🗑 Delete</button>
            </div>
        </div>
    `).join('');

    body.querySelectorAll('.note-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            notes = notes.filter(n => n.id !== id);
            highlights = highlights.filter(h => h.id !== id);
            saveHighlights();
            saveNotes();
            renderNotesList();
            updateHighlightCount();
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// DICTIONARY
// ==========================================
async function lookupWord(word) {
    const popup = document.getElementById('dictPopup');
    const wordEl = document.getElementById('dictWord');
    const bodyEl = document.getElementById('dictBody');

    popup.style.left = Math.min(window.innerWidth / 2 - 160, window.innerWidth - 340) + 'px';
    popup.style.top = '120px';

    wordEl.textContent = word;
    bodyEl.innerHTML = '<div class="dict-loading">Looking up definition...</div>';
    popup.classList.add('visible');

    document.getElementById('dictClose').addEventListener('click', () => {
        popup.classList.remove('visible');
    });

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const data = await response.json();

        if (data.title === 'No Definitions Found') {
            bodyEl.innerHTML = '<div class="dict-error">No definitions found for this word.</div>';
            return;
        }

        const entry = data[0];
        const meanings = entry.meanings || [];

        bodyEl.innerHTML = meanings.map(m => `
            <div style="margin-bottom: 12px;">
                <div class="dict-pos">${m.partOfSpeech}</div>
                ${(m.definitions || []).slice(0, 2).map(d => `
                    <div class="dict-def">${d.definition}</div>
                `).join('')}
            </div>
        `).join('');
    } catch (error) {
        bodyEl.innerHTML = '<div class="dict-error">Could not look up word. Check your connection.</div>';
    }
}

// ==========================================
// SEARCH IN BOOK
// ==========================================
function goToSearchMatch() {
    if (searchMatches.length === 0) return;
    currentPagePair = searchMatches[currentSearchIndex];
    renderPages();
    updateProgress();
    checkBookmark();
}

function clearSearch() {
    document.getElementById('bookSearchInput').value = '';
    document.getElementById('searchResultsInfo').classList.remove('visible');
    searchMatches = [];
    currentSearchIndex = 0;
}

// ==========================================
// TEXT-TO-SPEECH
// ==========================================
// Get available voices (male/female)
function getVoices() {
    return speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
}

function getSelectedVoice() {
    const voices = getVoices();
    if (voices.length === 0) return null;
    return voices[ttsVoiceIndex % voices.length];
}

// Auto-select best quality voice
function autoSelectBestVoice() {
    const voices = getVoices();
    if (voices.length === 0) return;

    // Prefer Google or Microsoft premium voices
    const best = voices.find(v =>
        v.name.includes('Google') && v.name.includes('Natural')
    ) || voices.find(v =>
        v.name.includes('Google')
    ) || voices.find(v =>
        v.name.includes('Microsoft') && v.name.includes('Natural')
    ) || voices.find(v =>
        v.name.includes('Microsoft')
    ) || voices.find(v =>
        v.name.includes('Enhanced')
    ) || voices[0];

    ttsVoiceIndex = voices.indexOf(best);
    const btn = document.getElementById('ttsVoiceBtn');
    if (btn) {
        const shortName = best.name.replace('Microsoft ', '').replace('Google ', '').split(' ').slice(0, 2).join(' ');
        btn.textContent = '🔊 ' + shortName;
    }
}

// Split text into sentences for better TTS quality
function splitIntoSentences(text) {
    // Split on sentence endings, keep the punctuation
    const raw = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
    return raw.map(s => s.trim()).filter(s => s.length > 0);
}

// Clean text for better TTS pronunciation
function cleanForSpeech(text) {
    return text
        .replace(/[""]/g, ', ')        // Smart quotes → pause
        .replace(/['']/g, '')           // Smart apostrophes
        .replace(/—/g, ', ')            // Em dash → pause
        .replace(/–/g, ', ')            // En dash → pause
        .replace(/\.\.\./g, '... ')     // Ellipsis → pause
        .replace(/\s+/g, ' ')           // Normalize spaces
        .replace(/\n+/g, ' ')           // Remove newlines
        .trim();
}

// Check if voice sounds female
function isFemaleVoice(voice) {
    if (!voice) return false;
    const name = voice.name.toLowerCase();
    return name.includes('female') || name.includes('samantha') ||
           name.includes('zira') || name.includes('hazel') ||
           name.includes('karen') || name.includes('moira') ||
           name.includes('tessa') || name.includes('susan') ||
           name.includes('fiona') || name.includes('alice');
}

// Generation counter — increments every time we restart TTS
// Old callbacks check this and bail out if stale
let ttsGeneration = 0;

function speakCurrentPage() {
    speechSynthesis.cancel();
    ttsGeneration++;
    const myGen = ttsGeneration; // snapshot for this run

    const text = rightContent.textContent || leftContent.textContent || '';
    if (!text.trim()) return;

    const cleanText = cleanForSpeech(text);
    const sentences = splitIntoSentences(cleanText);
    let idx = 0;

    function speakNext() {
        // Bail out if this generation is stale (user changed voice/speed/paused)
        if (myGen !== ttsGeneration) return;

        if (idx >= sentences.length || !ttsPlaying) {
            if (currentPagePair < totalPagePairs - 1) {
                nextPage();
                setTimeout(() => {
                    if (ttsPlaying && myGen === ttsGeneration) speakCurrentPage();
                }, 700);
            } else {
                stopTTS();
            }
            return;
        }

        const u = new SpeechSynthesisUtterance(sentences[idx]);
        u.volume = ttsVolume;

        const voice = getSelectedVoice();
        if (voice) u.voice = voice;

        if (isFemaleVoice(voice)) {
            u.rate = ttsSpeed * 0.9;
            u.pitch = 1.1;
        } else {
            u.rate = ttsSpeed * 0.95;
            u.pitch = 1.0;
        }

        u.onend = () => {
            if (myGen !== ttsGeneration) return;
            idx++;
            speakNextTimeout = setTimeout(speakNext, 350);
        };

        u.onerror = (e) => {
            if (myGen !== ttsGeneration) return;
            idx++;
            if (e.error !== 'canceled') speakNextTimeout = setTimeout(speakNext, 100);
        };

        speechSynthesis.speak(u);
    }

    ttsPlaying = true;
    document.getElementById('ttsPlayPause').textContent = '⏸';
    document.getElementById('ttsPlayPause').classList.add('playing');

    speakNext();
}

function stopTTS() {
    speechSynthesis.cancel();
    ttsGeneration++; // kill all old callbacks
    ttsPlaying = false;
    document.getElementById('ttsBar').classList.remove('visible');
    document.getElementById('ttsPlayPause').textContent = '▶';
    document.getElementById('ttsPlayPause').classList.remove('playing');
    clearTimeout(speakNextTimeout);
}

let speakNextTimeout = null;

// ==========================================
// FOCUS / IMMERSION MODE
// ==========================================
function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const btn = document.getElementById('focusModeBtn');
    btn.classList.toggle('active');
}

// ==========================================
// GO TO PAGE
// ==========================================
function openGoToPage() {
    const modal = document.getElementById('gotoModal');
    const input = document.getElementById('gotoInput');
    document.getElementById('gotoRange').textContent = `1 — ${totalPagePairs}`;
    input.value = currentPagePair + 1;
    input.max = totalPagePairs;
    modal.classList.add('visible');
    input.focus();
    input.select();
}

// ==========================================
// READING TIMER & STATS
// ==========================================
function updateReadingStats() {
    const elapsed = Math.floor((Date.now() - readingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const hours = Math.floor(minutes / 60);

    const badge = document.getElementById('timerBadge');
    if (hours > 0) {
        badge.textContent = `${hours}h ${minutes % 60}m`;
    } else {
        badge.textContent = `${minutes}m`;
    }

    document.getElementById('statPage').textContent = currentPagePair + 1;
    document.getElementById('statTotal').textContent = totalPagePairs;
    document.getElementById('statTime').textContent = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function setupReadingStats() {
    readingStartTime = Date.now();
    readingTimerInterval = setInterval(updateReadingStats, 5000);
    updateReadingStats();
    document.getElementById('timerBadge').classList.add('visible');
}
