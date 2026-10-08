import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';

const files = [
  {
    pdf: 'C:/Users/rover/Downloads/2022 SASS Math Prelims P1 w Ans.pdf',
    outDir: 'C:/Users/rover/Projects/emath-marker/content/sass-2022-pages/p1',
    label: 'p1',
  },
  {
    pdf: 'C:/Users/rover/Downloads/2022 SASS Math Prelims P2 w Ans.pdf',
    outDir: 'C:/Users/rover/Projects/emath-marker/content/sass-2022-pages/p2',
    label: 'p2',
  },
];

async function ocrPdf({ pdf, outDir, label }) {
  await fs.mkdir(outDir, { recursive: true });
  const data = await fs.readFile(pdf);
  const parser = new PDFParse({ data });
  const screenshot = await parser.getScreenshot({ scale: 2, imageFormat: 'png' });
  const pages = screenshot.pages || screenshot.result?.pages || [];
  const texts = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const imgPath = path.join(outDir, `page-${String(i + 1).padStart(2, '0')}.png`);
    const raw = page.data || page.buffer || page.image;
    if (!raw) {
      console.warn(`${label} page ${i + 1}: no image buffer`);
      continue;
    }
    const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    await fs.writeFile(imgPath, buffer);
    const { data: ocr } = await Tesseract.recognize(imgPath, 'eng');
    const textPath = path.join(outDir, `page-${String(i + 1).padStart(2, '0')}.txt`);
    await fs.writeFile(textPath, ocr.text);
    texts.push(`\n\n===== ${label.toUpperCase()} PAGE ${i + 1} =====\n\n${ocr.text}`);
    console.log(`${label} page ${i + 1}/${pages.length} OCR done (${ocr.text.length} chars)`);
  }

  await parser.destroy();
  return texts.join('');
}

for (const file of files) {
  const combined = await ocrPdf(file);
  const combinedPath = `C:/Users/rover/Projects/emath-marker/content/sass-2022-${file.label}-ocr.txt`;
  await fs.writeFile(combinedPath, combined);
  console.log('Wrote', combinedPath);
}
