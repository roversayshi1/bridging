import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';

const files = [
  {
    pdf: 'C:/Users/rover/Downloads/2022 STC Math Prelims P1.pdf',
    outDir: 'C:/Users/rover/Projects/emath-marker/content/stc-2022-pages/p1',
    label: 'p1',
  },
  {
    pdf: 'C:/Users/rover/Downloads/2022 STC Math Prelims P1 Ans.pdf',
    outDir: 'C:/Users/rover/Projects/emath-marker/content/stc-2022-pages/p1-ans',
    label: 'p1-ans',
  },
  {
    pdf: 'C:/Users/rover/Downloads/2022 STC Math Prelims P2.pdf',
    outDir: 'C:/Users/rover/Projects/emath-marker/content/stc-2022-pages/p2',
    label: 'p2',
  },
  {
    pdf: 'C:/Users/rover/Downloads/2022 STC Math Prelims P2 Ans.pdf',
    outDir: 'C:/Users/rover/Projects/emath-marker/content/stc-2022-pages/p2-ans',
    label: 'p2-ans',
  },
];

async function ocrPdf({ pdf, outDir, label }) {
  await fs.mkdir(outDir, { recursive: true });
  const data = await fs.readFile(pdf);
  const parser = new PDFParse({ data });
  const screenshot = await parser.getScreenshot({ scale: 2, imageFormat: 'png' });
  const pages = screenshot.pages || [];
  const texts = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const imgPath = path.join(outDir, `page-${String(i + 1).padStart(2, '0')}.png`);
    const raw = page.data;
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
  const combinedPath = `C:/Users/rover/Projects/emath-marker/content/stc-2022-${file.label}-ocr.txt`;
  await fs.writeFile(combinedPath, combined);
  console.log('Wrote', combinedPath);
}
