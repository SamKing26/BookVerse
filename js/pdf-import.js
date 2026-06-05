// ==========================================
// PDF IMPORT
// ==========================================
function setupPdfImport() {
    const modal = document.getElementById('pdfModal');
    const dropZone = document.getElementById('pdfDropZone');
    const fileInput = document.getElementById('pdfFileInput');
    const importInput = document.getElementById('importPdfInput');

    document.getElementById('importPdfBtn').addEventListener('click', () => {
        modal.classList.add('active');
    });

    importInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handlePdfFile(e.target.files[0]);
    });

    document.getElementById('pdfModalClose').addEventListener('click', () => {
        modal.classList.remove('active');
        resetPdfModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            resetPdfModal();
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') handlePdfFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handlePdfFile(e.target.files[0]);
    });

    document.getElementById('pdfImportBtn').addEventListener('click', importPdfToLibrary);
}

async function handlePdfFile(file) {
    const dropZone = document.getElementById('pdfDropZone');
    const processing = document.getElementById('pdfProcessing');
    const infoForm = document.getElementById('pdfInfoForm');
    const pagesPreview = document.getElementById('pdfPagesPreview');
    const progressBar = document.getElementById('pdfProgressBar');
    const progressText = document.getElementById('pdfProgressText');

    dropZone.style.display = 'none';
    processing.classList.add('active');
    pdfRawPages = [];

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        document.getElementById('pdfPageCount').textContent = totalPages;

        for (let i = 1; i <= totalPages; i++) {
            progressText.textContent = `Reading page ${i} of ${totalPages}...`;
            progressBar.style.width = ((i / totalPages) * 100) + '%';

            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            let pageText = '';
            let lastY = null;
            let paragraph = '';

            textContent.items.forEach(item => {
                const currentY = Math.round(item.transform[5]);

                if (lastY !== null && Math.abs(currentY - lastY) > 5) {
                    if (paragraph.trim()) {
                        pageText += '<p>' + paragraph.trim().replace(/\s+/g, ' ') + '</p>';
                    }
                    paragraph = '';
                }

                paragraph += item.str + ' ';
                lastY = currentY;
            });

            if (paragraph.trim()) {
                pageText += '<p>' + paragraph.trim().replace(/\s+/g, ' ') + '</p>';
            }

            if (!pageText.trim()) {
                pageText = '<p><em>[Page contains images or non-text content]</em></p>';
            }

            pdfRawPages.push(pageText);
        }

        processing.classList.remove('active');
        pagesPreview.classList.add('active');

        const chunksContainer = document.getElementById('pdfPageChunks');
        const maxShow = Math.min(totalPages, 20);
        chunksContainer.innerHTML = '';
        for (let i = 0; i < maxShow; i++) {
            const chunk = document.createElement('div');
            chunk.className = 'pdf-page-chunk';
            chunk.textContent = i + 1;
            chunksContainer.appendChild(chunk);
        }
        if (totalPages > maxShow) {
            const more = document.createElement('div');
            more.className = 'pdf-page-chunk';
            more.textContent = '+';
            more.style.background = 'transparent';
            more.style.color = 'var(--ui-muted)';
            chunksContainer.appendChild(more);
        }

        document.getElementById('pdfTitle').value = file.name.replace(/\.pdf$/i, '');
        infoForm.classList.add('active');

        console.log('PDF parsed successfully. Pages:', pdfRawPages.length);
        console.log('First page preview:', pdfRawPages[0].substring(0, 100));

    } catch (error) {
        console.error('PDF parsing error:', error);
        progressText.textContent = 'Error reading PDF. Please try another file.';
        progressBar.style.width = '0%';

        setTimeout(() => resetPdfModal(), 2000);
    }
}

function importPdfToLibrary() {
    const title = document.getElementById('pdfTitle').value.trim() || 'Untitled PDF';
    const author = document.getElementById('pdfAuthor').value.trim() || 'Unknown Author';
    const pagesPerSpread = parseInt(document.getElementById('pdfPagesPerSpread').value);

    console.log('Importing PDF:', title, 'Pages:', pdfRawPages.length);
    if (pdfRawPages.length === 0) {
        console.error('No pages to import!');
        alert('PDF has no text content. Please try another file.');
        return;
    }

    // Split raw text into book-sized pages (each page = ~800 chars of content)
    const bookPages = splitIntoBookPages(pdfRawPages, 800);

    // Group into spreads (left + right page)
    const spreads = [];
    if (pagesPerSpread === 2) {
        for (let i = 0; i < bookPages.length; i += 2) {
            const leftContent = bookPages[i] || '';
            const rightContent = bookPages[i + 1] || '';
            if (rightContent) {
                spreads.push(leftContent);
                spreads.push(rightContent);
            } else {
                spreads.push(leftContent);
            }
        }
    } else {
        spreads.push(...bookPages);
    }

    const gradients = [
        'linear-gradient(145deg, #2d4a6b, #1a2d42)',
        'linear-gradient(145deg, #6b2d4a, #421a2d)',
        'linear-gradient(145deg, #4a6b2d, #2d421a)',
        'linear-gradient(145deg, #6b4a2d, #422d1a)',
        'linear-gradient(145deg, #2d6b4a, #1a422d)',
        'linear-gradient(145deg, #4a2d6b, #2d1a42)',
    ];

    const icons = ['📖', '📕', '📗', '📘', '📙', '📓', '📔', '📒'];

    const newBook = {
        id: Date.now(),
        title: title,
        author: author,
        color: gradients[Math.floor(Math.random() * gradients.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
        progress: 0,
        isPdf: true,
        chapters: [
            {
                title: title,
                subtitle: `${spreads.length} pages`,
                pages: spreads
            }
        ]
    };

    library.push(newBook);
    saveImportedBooks();
    currentBook = newBook;
    loadBook(newBook);
    renderBookList();

    document.getElementById('pdfModal').classList.remove('active');
    resetPdfModal();
}

// Split extracted text into properly-sized book pages
function splitIntoBookPages(rawPages, maxChars) {
    const bookPages = [];

    for (const pageText of rawPages) {
        // Extract paragraphs from the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pageText;
        const paragraphs = Array.from(tempDiv.querySelectorAll('p'));

        let currentPage = '';
        let currentLen = 0;

        for (const p of paragraphs) {
            const pText = p.outerHTML;
            const pLen = p.textContent.length;

            if (currentLen + pLen > maxChars && currentPage) {
                // Finish current page, start new one
                bookPages.push(currentPage);
                currentPage = '';
                currentLen = 0;
            }

            currentPage += pText;
            currentLen += pLen;
        }

        // Don't forget the last chunk
        if (currentPage.trim()) {
            bookPages.push(currentPage);
        }
    }

    // If we got no pages, fallback
    if (bookPages.length === 0) {
        bookPages.push(...rawPages);
    }

    return bookPages;
}

function resetPdfModal() {
    document.getElementById('pdfDropZone').style.display = '';
    document.getElementById('pdfProcessing').classList.remove('active');
    document.getElementById('pdfInfoForm').classList.remove('active');
    document.getElementById('pdfPagesPreview').classList.remove('active');
    document.getElementById('pdfProgressBar').style.width = '0%';
    document.getElementById('pdfFileInput').value = '';
    document.getElementById('pdfTitle').value = '';
    document.getElementById('pdfAuthor').value = '';
    pdfRawPages = [];
}
