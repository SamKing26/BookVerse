// ==========================================
// PDF & EPUB IMPORT (with image support)
// ==========================================

let importedFileType = 'pdf';

function setupPdfImport() {
    const modal = document.getElementById('pdfModal');
    const dropZone = document.getElementById('pdfDropZone');
    const fileInput = document.getElementById('pdfFileInput');

    const importBtn = document.getElementById('readerImportBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    const closeBtn = document.getElementById('pdfModalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            resetPdfModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                resetPdfModal();
            }
        });
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleImportFile(file);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) handleImportFile(e.target.files[0]);
        });
    }

    const pdfImportBtn = document.getElementById('pdfImportBtn');
    if (pdfImportBtn) {
        pdfImportBtn.addEventListener('click', importToLibrary);
    }
}

function handleImportFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'epub') {
        importedFileType = 'epub';
        handleEpubFile(file);
    } else if (ext === 'pdf' || file.type === 'application/pdf') {
        importedFileType = 'pdf';
        handlePdfFile(file);
    } else {
        alert('Unsupported file type. Please use PDF or EPUB files.');
    }
}

// ==========================================
// PDF HANDLER — text only extraction
// ==========================================
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

            pdfRawPages.push({ type: 'text', html: pageText });
        }

        processing.classList.remove('active');
        pagesPreview.classList.add('active');
        showPageChunks(totalPages);
        document.getElementById('pdfTitle').value = file.name.replace(/\.pdf$/i, '');
        infoForm.classList.add('active');

    } catch (error) {
        console.error('PDF parsing error:', error);
        progressText.textContent = 'Error reading PDF. Please try another file.';
        progressBar.style.width = '0%';
        setTimeout(() => resetPdfModal(), 2000);
    }
}

// ==========================================
// EPUB HANDLER — extracts text + images directly
// ==========================================
async function handleEpubFile(file) {
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
        // Load JSZip if needed
        if (typeof JSZip === 'undefined') {
            progressText.textContent = 'Loading EPUB parser...';
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        }

        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Find OPF file
        let opfPath = null;
        let opfDir = '';
        const containerFile = zip.file('META-INF/container.xml');
        if (containerFile) {
            const containerXml = await containerFile.async('text');
            const parser = new DOMParser();
            const containerDoc = parser.parseFromString(containerXml, 'application/xml');
            const rootfile = containerDoc.querySelector('rootfile');
            if (rootfile) {
                opfPath = rootfile.getAttribute('full-path');
                opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
            }
        }

        if (!opfPath) {
            zip.forEach((path) => {
                if (path.endsWith('.opf') && !opfPath) {
                    opfPath = path;
                    opfDir = path.substring(0, path.lastIndexOf('/') + 1);
                }
            });
        }

        if (!opfPath) throw new Error('Could not find OPF file in EPUB');

        const opfFile = zip.file(opfPath);
        const opfText = await opfFile.async('text');
        const parser = new DOMParser();
        const opfDoc = parser.parseFromString(opfText, 'application/xml');

        // Extract metadata
        const metadata = opfDoc.querySelector('metadata');
        if (metadata) {
            const dcTitle = metadata.querySelector('title');
            const dcCreator = metadata.querySelector('creator');
            if (dcTitle) document.getElementById('pdfTitle').value = dcTitle.textContent.trim();
            if (dcCreator) document.getElementById('pdfAuthor').value = dcCreator.textContent.trim();
        }

        // Build manifest lookup
        const manifest = opfDoc.querySelector('manifest');
        const manifestItems = {};
        if (manifest) {
            manifest.querySelectorAll('item').forEach(item => {
                const id = item.getAttribute('id');
                manifestItems[id] = {
                    href: item.getAttribute('href'),
                    mediaType: item.getAttribute('media-type') || ''
                };
            });
        }

        // Get spine order
        const spine = opfDoc.querySelector('spine');
        if (!spine) throw new Error('No spine found in EPUB');
        const spineItems = spine.querySelectorAll('itemref');
        const totalItems = spineItems.length;
        document.getElementById('pdfPageCount').textContent = totalItems;

        // Resolve relative href
        function resolveHref(baseDir, href) {
            href = decodeURIComponent(href);
            const parts = (baseDir + href).split('/');
            const resolved = [];
            for (const part of parts) {
                if (part === '..') resolved.pop();
                else if (part !== '.' && part !== '') resolved.push(part);
            }
            return resolved.join('/');
        }

        // Extract image from zip as base64 data URL
        async function extractImage(imgPath) {
            const entry = zip.file(imgPath);
            if (!entry) return null;
            const data = await entry.async('base64');
            const ext = imgPath.split('.').pop().toLowerCase();
            const mimeMap = { 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'svg': 'image/svg+xml', 'webp': 'image/webp' };
            const mime = mimeMap[ext] || 'image/jpeg';
            return `data:${mime};base64,${data}`;
        }

        // Process each spine item
        for (let i = 0; i < totalItems; i++) {
            const idref = spineItems[i].getAttribute('idref');
            const itemInfo = manifestItems[idref];
            if (!itemInfo) continue;

            const itemPath = resolveHref(opfDir, itemInfo.href);
            progressText.textContent = `Reading chapter ${i + 1} of ${totalItems}...`;
            progressBar.style.width = ((i + 1) / totalItems * 100) + '%';

            const entry = zip.file(itemPath);
            if (!entry) continue;

            const itemDir = itemPath.substring(0, itemPath.lastIndexOf('/') + 1);
            let html = await entry.async('text');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const body = tempDiv.querySelector('body') || tempDiv;

            // Extract all images from this chapter
            const imgs = body.querySelectorAll('img');
            const imageHtmlParts = [];

            for (const img of imgs) {
                const src = img.getAttribute('src');
                if (src) {
                    const imgPath = resolveHref(itemDir, src);
                    const dataUrl = await extractImage(imgPath);
                    if (dataUrl) {
                        imageHtmlParts.push(`<div class="imported-page-image"><img src="${dataUrl}" alt="Illustration"></div>`);
                    }
                }
            }

            // Get text content
            let textHtml = '';
            body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote').forEach(el => {
                const t = el.textContent.trim();
                if (t) {
                    const tag = el.tagName.toLowerCase();
                    if (tag.startsWith('h')) {
                        textHtml += '<p><strong>' + t + '</strong></p>';
                    } else if (tag === 'blockquote') {
                        textHtml += '<p><em>' + t + '</em></p>';
                    } else {
                        textHtml += '<p>' + t + '</p>';
                    }
                }
            });

            const hasImages = imageHtmlParts.length > 0;
            const hasText = textHtml.trim().length > 20;

            if (hasImages && !hasText) {
                // Image-only chapter: each image = one page
                for (const imgHtml of imageHtmlParts) {
                    pdfRawPages.push({ type: 'image', html: imgHtml });
                }
            } else if (hasImages && hasText) {
                // Mixed: combine text + images into one page
                const combined = textHtml + imageHtmlParts.join('');
                pdfRawPages.push({ type: 'text', html: combined });
            } else {
                // Text only
                pdfRawPages.push({ type: 'text', html: textHtml || '<p><em>[Empty chapter]</em></p>' });
            }
        }

        processing.classList.remove('active');
        pagesPreview.classList.add('active');
        showPageChunks(totalItems);
        infoForm.classList.add('active');

    } catch (error) {
        console.error('EPUB parsing error:', error);
        progressText.textContent = 'Error reading EPUB. Please try another file.';
        progressBar.style.width = '0%';
        setTimeout(() => resetPdfModal(), 2000);
    }
}

// ==========================================
// HELPER: load external script
// ==========================================
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ==========================================
// HELPER: show page chunks
// ==========================================
function showPageChunks(totalPages) {
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
}

// ==========================================
// IMPORT TO LIBRARY (unified)
// ==========================================
function importToLibrary() {
    const title = document.getElementById('pdfTitle').value.trim() || 'Untitled';
    const author = document.getElementById('pdfAuthor').value.trim() || 'Unknown Author';
    const pagesPerSpread = parseInt(document.getElementById('pdfPagesPerSpread').value);

    if (pdfRawPages.length === 0) {
        alert('No content found. Please try another file.');
        return;
    }

    // Build book pages from raw data
    const bookPages = [];

    for (const page of pdfRawPages) {
        if (page.type === 'image') {
            // EPUB image page — already has HTML with <img>
            bookPages.push(page.html);
        } else {
            // Text page (PDF or EPUB text)
            bookPages.push(page.html || '');
        }
    }

    // Group into spreads
    const spreads = [];
    if (pagesPerSpread === 2) {
        for (let i = 0; i < bookPages.length; i += 2) {
            spreads.push(bookPages[i] || '');
            if (bookPages[i + 1]) spreads.push(bookPages[i + 1]);
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

function importPdfToLibrary() { importToLibrary(); }

// ==========================================
// UTILITIES
// ==========================================
function resetPdfModal() {
    const dropZone = document.getElementById('pdfDropZone');
    if (dropZone) dropZone.style.display = '';
    const processing = document.getElementById('pdfProcessing');
    if (processing) processing.classList.remove('active');
    const infoForm = document.getElementById('pdfInfoForm');
    if (infoForm) infoForm.classList.remove('active');
    const pagesPreview = document.getElementById('pdfPagesPreview');
    if (pagesPreview) pagesPreview.classList.remove('active');
    const progressBar = document.getElementById('pdfProgressBar');
    if (progressBar) progressBar.style.width = '0%';
    const fileInput = document.getElementById('pdfFileInput');
    if (fileInput) fileInput.value = '';
    const titleInput = document.getElementById('pdfTitle');
    if (titleInput) titleInput.value = '';
    const authorInput = document.getElementById('pdfAuthor');
    if (authorInput) authorInput.value = '';
    pdfRawPages = [];
    importedFileType = 'pdf';
}
