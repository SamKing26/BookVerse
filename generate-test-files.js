// ==========================================
// Generate test PDF and EPUB files
// ==========================================
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const assetsDir = path.join(__dirname, 'assets');

// ==========================================
// 1. Create a small test image (red circle on white)
// ==========================================
function createTestImage() {
    // Create a simple 200x200 PNG using raw pixel data
    // This creates a red circle on white background
    const width = 200;
    const height = 200;

    // Build a minimal PNG manually
    // For simplicity, we'll use a base64 encoded tiny image
    // A 4x4 red square PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYV2P8z8BQz0BFwMgwasKoOgBnLwIHeJYfOQAAAABJRU5ErkJggg==';
    return Buffer.from(pngBase64, 'base64');
}

// ==========================================
// 2. Generate test PDF with image
// ==========================================
async function generateTestPDF() {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(assetsDir, 'test-book-with-images.pdf');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Page 1 - Text with a colored rectangle (simulating image)
        doc.fontSize(24).text('Chapter 1: The Beginning', { align: 'center' });
        doc.moveDown(2);

        // Draw a colored box as a "image placeholder"
        doc.save();
        doc.rect(100, 200, 400, 250)
           .fill('#e8d5b7');
        doc.restore();

        // Add a smaller image inside the box
        doc.save();
        doc.rect(150, 230, 300, 180)
           .fill('#c4956a');
        doc.restore();

        // Add some text "inside" the image
        doc.fontSize(14).fillColor('#4a3520')
           .text('📷 [Sample Image]', 220, 290, { width: 160, align: 'center' });

        doc.fillColor('#2c1810');
        doc.fontSize(14).moveDown(3);
        doc.text('This is a test PDF document with images to verify the BookVerse import feature. The colored rectangles above simulate images that would appear in a real book.');

        doc.moveDown(1);
        doc.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.');

        // Page 2 - More text with another "image"
        doc.addPage();
        doc.fontSize(24).text('Chapter 2: The Journey', { align: 'center' });
        doc.moveDown(2);

        doc.save();
        doc.rect(80, 180, 440, 200)
           .fill('#2d4a6b');
        doc.restore();

        doc.fontSize(14).fillColor('#ffffff')
           .text('📷 [Landscape Image]', 200, 260, { width: 200, align: 'center' });

        doc.fillColor('#2c1810');
        doc.fontSize(14).moveDown(4);
        doc.text('More content continues here. This second page also contains an image to test multi-page import with mixed content.');

        doc.moveDown(1);
        doc.text('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');

        doc.end();

        stream.on('finish', () => {
            console.log('✅ Test PDF created:', outputPath);
            resolve(outputPath);
        });

        stream.on('error', reject);
    });
}

// ==========================================
// 3. Generate test EPUB with image
// ==========================================
async function generateTestEPUB() {
    const zip = new JSZip();

    // mimetype (must be first, uncompressed)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // META-INF/container.xml
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // Create a small SVG image (green book icon)
    const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect width="300" height="200" fill="#f0f7ed" rx="8"/>
  <rect x="50" y="30" width="200" height="140" fill="#10b981" rx="4"/>
  <rect x="70" y="50" width="160" height="8" fill="#ffffff" opacity="0.5" rx="2"/>
  <rect x="70" y="70" width="120" height="8" fill="#ffffff" opacity="0.5" rx="2"/>
  <rect x="70" y="90" width="140" height="8" fill="#ffffff" opacity="0.5" rx="2"/>
  <circle cx="220" cy="130" r="20" fill="#fbbf24"/>
  <text x="150" y="170" text-anchor="middle" font-family="Georgia" font-size="14" fill="#1a1a1a">Test EPUB Image</text>
</svg>`;

    zip.file('OEBPS/images/test-image.svg', svgImage);

    // Chapter 1 (image-only)
    zip.file('OEBPS/chapter1.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter 1</title></head>
<body>
  <h1>Chapter 1: The Discovery</h1>
  <img src="images/test-image.svg" alt="Test Image"/>
</body>
</html>`);

    // Chapter 2 (text + image)
    zip.file('OEBPS/chapter2.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter 2</title></head>
<body>
  <h1>Chapter 2: The Adventure</h1>
  <p>In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.</p>
  <img src="images/test-image.svg" alt="Test Image"/>
  <p>"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."</p>
  <p>He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.</p>
</body>
</html>`);

    // Chapter 3 (text only)
    zip.file('OEBPS/chapter3.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter 3</title></head>
<body>
  <h1>Chapter 3: The Return</h1>
  <p>When I was finally able to leave Long Island, I realized how much I had changed. The experience had transformed me in ways I never expected.</p>
  <p>The world seemed both larger and smaller at the same time. Every sunset reminded me of those first evenings, and every sunrise promised something new.</p>
  <p>And so I continued on my journey, carrying with me the lessons of the past and the hope of the future.</p>
</body>
</html>`);

    // OPF content.opf
    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test EPUB with Images</dc:title>
    <dc:creator>BookVerse Test</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">test-epub-001</dc:identifier>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter3" href="chapter3.xhtml" media-type="application/xhtml+xml"/>
    <item id="test-image" href="images/test-image.svg" media-type="image/svg+xml"/>
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
    <itemref idref="chapter2"/>
    <itemref idref="chapter3"/>
  </spine>
</package>`);

    // Generate the EPUB file
    const content = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip' });
    const outputPath = path.join(assetsDir, 'test-book-with-images.epub');
    fs.writeFileSync(outputPath, content);
    console.log('✅ Test EPUB created:', outputPath);
    return outputPath;
}

// ==========================================
// Run both generators
// ==========================================
async function main() {
    try {
        await generateTestPDF();
        await generateTestEPUB();
        console.log('\n🎉 Both test files created in assets/ folder!');
        console.log('   - test-book-with-images.pdf');
        console.log('   - test-book-with-images.epub');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
