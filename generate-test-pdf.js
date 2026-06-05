const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream('assets/test-book.pdf');
doc.pipe(stream);

// Page 1 - Title Page
doc.fontSize(28).font('Helvetica-Bold').text('The Art of Beautiful Code', { align: 'center' });
doc.moveDown(2);
doc.fontSize(16).font('Helvetica').text('A Journey Through Programming Excellence', { align: 'center' });
doc.moveDown(1);
doc.fontSize(12).text('By Claude AI', { align: 'center' });
doc.moveDown(3);
doc.fontSize(10).text('Published by BookVerse Press, 2026', { align: 'center' });
doc.addPage();

// Page 2 - Chapter 1
doc.fontSize(22).font('Helvetica-Bold').text('Chapter 1: The Foundation');
doc.moveDown(1);
doc.fontSize(12).font('Helvetica').text(
    'Every great piece of software begins with a single line of code. ' +
    'But before that line is written, there must be vision — a clear understanding ' +
    'of what we aim to create and why it matters.\n\n' +
    'The best programmers are not those who write the most code, but those who ' +
    'write the least amount of code that solves the most complex problems. ' +
    'Elegance in programming is not about showing off; it is about clarity.\n\n' +
    'Consider the humble function. A well-crafted function does one thing and ' +
    'does it exceptionally well. It has a clear name, takes predictable inputs, ' +
    'and produces consistent outputs. This is the Unix philosophy applied to code.'
);
doc.addPage();

// Page 3 - Chapter 2
doc.fontSize(22).font('Helvetica-Bold').text('Chapter 2: Patterns and Principles');
doc.moveDown(1);
doc.fontSize(12).font('Helvetica').text(
    'Design patterns are not rules to follow blindly. They are conversations between ' +
    'experienced developers, distilled into reusable solutions for recurring problems.\n\n' +
    'The Singleton pattern ensures a class has only one instance. The Observer pattern ' +
    'defines a one-to-many dependency between objects. The Factory pattern provides ' +
    'an interface for creating objects without specifying their concrete classes.\n\n' +
    'But patterns alone do not make good software. Understanding the principles behind ' +
    'them — SOLID, DRY, KISS — is what separates a coder from an engineer.\n\n' +
    '"Any fool can write code that a computer can understand. Good programmers write ' +
    'code that humans can understand." — Martin Fowler'
);
doc.addPage();

// Page 4 - Chapter 3
doc.fontSize(22).font('Helvetica-Bold').text('Chapter 3: The Art of Debugging');
doc.moveDown(1);
doc.fontSize(12).font('Helvetica').text(
    'Debugging is twice as hard as writing the code in the first place. ' +
    'Therefore, if you write the code as cleverly as possible, you are, by definition, ' +
    'not smart enough to debug it. — Brian Kernighan\n\n' +
    'The debugger is a programmer\'s best friend. It allows us to step through code ' +
    'line by line, inspect variables, and understand exactly what our programs are doing.\n\n' +
    'But the best debugging technique is prevention. Writing clean, readable code with ' +
    'proper error handling means fewer bugs to find. Unit tests act as safety nets, ' +
    'catching problems before they reach production.\n\n' +
    'When you do find a bug, resist the urge to fix it immediately. First, understand it. ' +
    'What is the root cause? Are there similar bugs elsewhere in the code?'
);
doc.addPage();

// Page 5 - Chapter 4
doc.fontSize(22).font('Helvetica-Bold').text('Chapter 4: Building for the Future');
doc.moveDown(1);
doc.fontSize(12).font('Helvetica').text(
    'Software is never finished, only abandoned. Every application we build today ' +
    'will need to be maintained, extended, and eventually replaced.\n\n' +
    'This is why we write tests. Not because someone told us to, but because ' +
    'future-us will thank present-us when we can refactor with confidence.\n\n' +
    'This is why we document our code. Not every line needs a comment, but every ' +
    'complex decision deserves an explanation of why it was made.\n\n' +
    'This is why we choose boring technology. New frameworks are exciting, but ' +
    'proven tools are reliable. The best technology is the one your team knows well.\n\n' +
    'Remember: code is read far more often than it is written. Write for your readers, ' +
    'not for the compiler.\n\n' +
    '— End of Preview —'
);

doc.end();
stream.on('finish', () => {
    console.log('✅ Test PDF created: assets/test-book.pdf');
    console.log('   5 pages, ~2000 words');
});
