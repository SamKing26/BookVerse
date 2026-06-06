// ==========================================
// BOOK RENDERER — Figma Design Layout
// ==========================================
// Renders books in the new single-page scroll view

let cardTitle, cardAuthor, cardChapter, cardBody;
let readerTitle, readerProgressFill, readerProgressText;
let readerCurrentPage, readerTotalPages, readerBookList;

function cacheDOMElements() {
    // New reader elements
    cardTitle = document.getElementById('cardTitle');
    cardAuthor = document.getElementById('cardAuthor');
    cardChapter = document.getElementById('cardChapter');
    cardBody = document.getElementById('cardBody');
    readerTitle = document.getElementById('readerTitle');
    readerProgressFill = document.getElementById('readerProgressFill');
    readerProgressText = document.getElementById('readerProgressText');
    readerCurrentPage = document.getElementById('readerCurrentPage');
    readerTotalPages = document.getElementById('readerTotalPages');
    readerBookList = document.getElementById('readerBookList');

    // Legacy elements (still needed for some features)
    toolbarTitle = document.getElementById('readerTitle');
    progressFill = document.getElementById('readerProgressFill');
    bookmarkIndicator = document.getElementById('bookmarkIndicator');
}

// ==========================================
// LOAD BOOK
// ==========================================
function loadBook(book) {
    currentBook = book;
    currentPagePair = 0;
    totalPagePairs = book.chapters.reduce((sum, ch) => sum + ch.pages.length, 0);

    // Update UI
    if (readerTitle) readerTitle.textContent = book.title;
    if (cardTitle) cardTitle.textContent = book.title;
    if (cardAuthor) cardAuthor.textContent = 'by ' + book.author;

    loadLastPosition();
    renderTOC();
    renderPages();
    updateProgress();
    checkBookmark();
    updateHighlightCount();
}

// ==========================================
// BOOK LIST (New reader sidebar)
// ==========================================
function renderBookList() {
    if (!readerBookList) return;

    const exampleBooks = library.filter(b => !b.isPdf);
    const importedBooks = library.filter(b => b.isPdf);

    function bookItemHtml(book) {
        return `
        <div class="reader-book-item ${book.id === currentBook.id ? 'active' : ''}" data-id="${book.id}">
            <div class="reader-book-icon">
                ${book.icon || book.title.charAt(0)}
            </div>
            <div class="reader-book-info">
                <div class="reader-book-title">${book.title}</div>
                <div class="reader-book-author">${book.author}</div>
                ${book.progress > 0 ? `
                    <div class="reader-book-progress">
                        <div class="reader-book-progress-fill" style="width: ${book.progress}%"></div>
                    </div>
                ` : ''}
            </div>
            ${book.isPdf ? `<button class="reader-book-delete" data-id="${book.id}" title="Remove from library">✕</button>` : ''}
        </div>`;
    }

    // Load collapsed state from localStorage
    const collapsedFolders = JSON.parse(localStorage.getItem('bookverse_collapsedFolders') || '{}');

    const html = `
        <div class="book-folder" data-folder="example">
            <div class="book-folder-header" data-folder="example">
                <span class="book-folder-chevron ${collapsedFolders.example ? '' : 'open'}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span class="book-folder-name">📚 Example Books</span>
                <span class="book-folder-count">${exampleBooks.length}</span>
            </div>
            <div class="book-folder-items ${collapsedFolders.example ? 'collapsed' : ''}">
                ${exampleBooks.map(bookItemHtml).join('')}
            </div>
        </div>
        <div class="book-folder" data-folder="imported">
            <div class="book-folder-header" data-folder="imported">
                <span class="book-folder-chevron ${collapsedFolders.imported ? '' : 'open'}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span class="book-folder-name">📥 Imported Books</span>
                <span class="book-folder-count">${importedBooks.length}</span>
            </div>
            <div class="book-folder-items ${collapsedFolders.imported ? 'collapsed' : ''}">
                ${importedBooks.length > 0
                    ? importedBooks.map(bookItemHtml).join('')
                    : '<div class="book-folder-empty">No imported books yet</div>'
                }
            </div>
        </div>
    `;

    // Keep the title, update the list
    const titleEl = readerBookList.querySelector('.reader-book-list-title');
    readerBookList.innerHTML = '';
    if (titleEl) readerBookList.appendChild(titleEl);

    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
        readerBookList.appendChild(temp.firstChild);
    }

    // Folder toggle handlers
    readerBookList.querySelectorAll('.book-folder-header').forEach(header => {
        header.addEventListener('click', () => {
            const folder = header.dataset.folder;
            const items = header.nextElementSibling;
            const chevron = header.querySelector('.book-folder-chevron');
            const isCollapsed = items.classList.toggle('collapsed');
            chevron.classList.toggle('open', !isCollapsed);

            // Save collapsed state
            const state = JSON.parse(localStorage.getItem('bookverse_collapsedFolders') || '{}');
            state[folder] = isCollapsed;
            localStorage.setItem('bookverse_collapsedFolders', JSON.stringify(state));
        });
    });

    // Click handlers for book items
    readerBookList.querySelectorAll('.reader-book-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('reader-book-delete')) return;

            const bookId = parseInt(item.dataset.id);
            const book = library.find(b => b.id === bookId);
            if (book) {
                loadBook(book);
                renderBookList();
            }
        });
    });

    // Delete button handlers
    readerBookList.querySelectorAll('.reader-book-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bookId = parseInt(btn.dataset.id);
            const book = library.find(b => b.id === bookId);
            if (!book) return;

            if (confirm(`Remove "${book.title}" from library?`)) {
                deleteBook(bookId);
            }
        });
    });
}

// ==========================================
// DELETE BOOK
// ==========================================
function deleteBook(bookId) {
    const index = library.findIndex(b => b.id === bookId);
    if (index === -1) return;

    const wasActive = currentBook && currentBook.id === bookId;

    // Remove from library
    library.splice(index, 1);

    // Save updated library
    saveImportedBooks();

    // If we deleted the active book, switch to the first available
    if (wasActive && library.length > 0) {
        loadBook(library[0]);
    }

    // Re-render the book list
    renderBookList();
}

// ==========================================
// TABLE OF CONTENTS
// ==========================================
function renderTOC() {
    // TOC is now in the settings panel
    if (typeof tocList !== 'undefined' && tocList) {
        let pageNum = 1;
        tocList.innerHTML = currentBook.chapters.map((ch, i) => {
            const pageStart = pageNum;
            pageNum += ch.pages.length;
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
}

// ==========================================
// RENDER PAGES (Single-page scroll view)
// ==========================================
function renderPages() {
    const pageData = getCurrentPageContent();

    // Update page number
    if (cardChapter) cardChapter.textContent = 'Page ' + (currentPagePair + 1);

    // Update body content
    if (cardBody) {
        cardBody.innerHTML = pageData.content || '';
        // Add imported-text class for PDF books
        if (currentBook.isPdf) {
            cardBody.classList.add('imported-text');
        } else {
            cardBody.classList.remove('imported-text');
        }
    }

    applyFontSettings();

    // Animate card entrance
    const card = document.getElementById('readerCard');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }

    // Update navigation state
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const navLeft = document.getElementById('navLeft');
    const navRight = document.getElementById('navRight');

    if (prevBtn) prevBtn.style.opacity = currentPagePair <= 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = currentPagePair >= totalPagePairs - 1 ? '0.3' : '1';

    if (navLeft) navLeft.style.pointerEvents = currentPagePair <= 0 ? 'none' : 'auto';
    if (navRight) navRight.style.pointerEvents = currentPagePair >= totalPagePairs - 1 ? 'none' : 'auto';

    saveLastPosition();
    updateReadingStats();

    // Scroll to top of reading area
    const scroll = document.getElementById('readerScroll');
    if (scroll) scroll.scrollTop = 0;
}

function getCurrentPageContent() {
    let globalIndex = 0;
    for (const chapter of currentBook.chapters) {
        for (let p = 0; p < chapter.pages.length; p++) {
            if (globalIndex === currentPagePair) {
                return {
                    chapter: chapter.title,
                    content: chapter.pages[p]
                };
            }
            globalIndex++;
        }
    }
    // Fallback: return last page
    const lastChapter = currentBook.chapters[currentBook.chapters.length - 1];
    return {
        chapter: lastChapter.title,
        content: lastChapter.pages[lastChapter.pages.length - 1]
    };
}

// ==========================================
// PAGE TURN
// ==========================================
function nextPage() {
    if (currentPagePair < totalPagePairs - 1) {
        currentPagePair++;
        renderPages();
        updateProgress();
        checkBookmark();
    }
}

function prevPage() {
    if (currentPagePair > 0) {
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

    if (readerProgressFill) {
        readerProgressFill.style.width = progress + '%';
    }
    if (readerProgressText) {
        readerProgressText.textContent = Math.round(progress) + '%';
    }
    if (readerCurrentPage) {
        readerCurrentPage.textContent = currentPagePair + 1;
    }
    if (readerTotalPages) {
        readerTotalPages.textContent = totalPagePairs;
    }

    currentBook.progress = Math.round(progress);
}

// ==========================================
// BOOKMARKS
// ==========================================
function checkBookmark() {
    const key = `${currentBook.id}-${currentPagePair}`;
    if (bookmarkIndicator) {
        bookmarkIndicator.classList.toggle('active', bookmarks.has(key));
    }
    updateBookmarkBtn();
}

function renderBookmarksList() {
    const container = document.getElementById('bookmarksList');
    if (!container) return;

    if (bookmarks.size === 0) {
        container.innerHTML = '<div class="bookmarks-empty">No bookmarks yet</div>';
        return;
    }

    // Sort by timestamp (newest first)
    const sorted = [...bookmarks.entries()].sort((a, b) => b[1].timestamp - a[1].timestamp);

    container.innerHTML = sorted.map(([key, data]) => `
        <div class="bookmark-item" data-key="${key}" data-book-id="${data.bookId}" data-page="${data.page}">
            <div class="bookmark-item-icon">🔖</div>
            <div class="bookmark-item-info">
                <div class="bookmark-item-title">${data.bookTitle || 'Unknown'}</div>
                <div class="bookmark-item-page">Page ${data.page + 1}</div>
            </div>
            <button class="bookmark-item-remove" data-key="${key}">✕</button>
        </div>
    `).join('');

    // Click to navigate
    container.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-item-remove')) return;
            const bookId = parseInt(item.dataset.bookId);
            const page = parseInt(item.dataset.page);
            const book = library.find(b => b.id === bookId);
            if (book) {
                loadBook(book);
                currentPagePair = page;
                renderPages();
                updateProgress();
                checkBookmark();
                renderBookList();
            }
        });
    });

    // Remove button
    container.querySelectorAll('.bookmark-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.dataset.key;
            bookmarks.delete(key);
            saveBookmarks();
            checkBookmark();
            renderBookmarksList();
        });
    });
}

function updateBookmarkBtn() {
    const indicator = document.getElementById('cardBookmarkIndicator');
    if (!indicator) return;
    const key = `${currentBook.id}-${currentPagePair}`;
    const isBookmarked = bookmarks.has(key);
    indicator.classList.toggle('visible', isBookmarked);
}

function toggleBookmark() {
    const key = `${currentBook.id}-${currentPagePair}`;
    if (bookmarks.has(key)) {
        bookmarks.delete(key);
    } else {
        bookmarks.set(key, {
            bookId: currentBook.id,
            bookTitle: currentBook.title,
            page: currentPagePair,
            timestamp: Date.now()
        });
    }
    saveBookmarks();
    checkBookmark();
    renderBookmarksList();
}

function saveBookmarks() {
    const obj = {};
    bookmarks.forEach((val, key) => { obj[key] = val; });
    localStorage.setItem('bookverse_bookmarks', JSON.stringify(obj));
}

function loadBookmarks() {
    try {
        const saved = JSON.parse(localStorage.getItem('bookverse_bookmarks') || '{}');
        bookmarks = new Map();
        Object.entries(saved).forEach(([key, val]) => {
            bookmarks.set(key, val);
        });
    } catch (e) {
        bookmarks = new Map();
    }
}

// ==========================================
// THEME (Legacy compatibility)
// ==========================================
function setTheme(theme) {
    if (typeof applyReaderTheme === 'function') {
        applyReaderTheme(theme);
    } else {
        // Fallback for old code
        currentTheme = theme;
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }
}

// ==========================================
// FONT SETTINGS
// ==========================================
function applyFontSettings() {
    // Set on #app so theme class specificity doesn't override
    const app = document.getElementById('app');
    if (app) {
        app.style.setProperty('--page-font', currentFont);
        app.style.setProperty('--font-size', fontSize + 'px');
        app.style.setProperty('--line-height', lineHeight);
    }
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

    // Update all size displays
    const sizeDisplays = document.querySelectorAll('#settingsSizeValue, #sizeValue');
    sizeDisplays.forEach(el => {
        if (el) el.textContent = fontSize + 'px';
    });

    applyFontSettings();
}

function setLineSpacing(spacing) {
    lineHeight = parseFloat(spacing);
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
        if (data) {
            // Find the book in library
            const book = library.find(b => b.id === data.bookId);
            if (book) {
                currentBook = book;
                currentPagePair = data.page || 0;
            }
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
    if (!body) return;

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
function getVoices() {
    return speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
}

function getSelectedVoice() {
    const voices = getVoices();
    if (voices.length === 0) return null;
    return voices[ttsVoiceIndex % voices.length];
}

function autoSelectBestVoice() {
    const voices = getVoices();
    if (voices.length === 0) return;

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

function splitIntoSentences(text) {
    const raw = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
    return raw.map(s => s.trim()).filter(s => s.length > 0);
}

function cleanForSpeech(text) {
    return text
        .replace(/[""]/g, ', ')
        .replace(/['']/g, '')
        .replace(/—/g, ', ')
        .replace(/–/g, ', ')
        .replace(/\.\.\./g, '... ')
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();
}

function isFemaleVoice(voice) {
    if (!voice) return false;
    const name = voice.name.toLowerCase();
    return name.includes('female') || name.includes('samantha') ||
           name.includes('zira') || name.includes('hazel') ||
           name.includes('karen') || name.includes('moira') ||
           name.includes('tessa') || name.includes('susan') ||
           name.includes('fiona') || name.includes('alice');
}

let ttsGeneration = 0;

function speakCurrentPage() {
    speechSynthesis.cancel();
    ttsGeneration++;
    const myGen = ttsGeneration;

    const text = cardBody ? cardBody.textContent : '';
    if (!text.trim()) return;

    const cleanText = cleanForSpeech(text);
    const sentences = splitIntoSentences(cleanText);
    let idx = 0;

    function speakNext() {
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
    ttsGeneration++;
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
    if (btn) btn.classList.toggle('active');
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
    if (badge) {
        if (hours > 0) {
            badge.textContent = `${hours}h ${minutes % 60}m`;
        } else {
            badge.textContent = `${minutes}m`;
        }
    }

    // Update page display
    if (readerCurrentPage) readerCurrentPage.textContent = currentPagePair + 1;
    if (readerTotalPages) readerTotalPages.textContent = totalPagePairs;
}

function setupReadingStats() {
    readingStartTime = Date.now();
    readingTimerInterval = setInterval(updateReadingStats, 5000);
    updateReadingStats();
    const badge = document.getElementById('timerBadge');
    if (badge) badge.classList.add('visible');
}
