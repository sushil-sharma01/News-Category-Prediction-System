import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const DOCUMENT_ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export async function extractDocumentText(file: File): Promise<string> {
  const extension = file.name.toLowerCase().split('.').pop();
  let text = '';

  if (extension === 'pdf' || file.type === 'application/pdf') {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (pageText) pages.push(pageText);
    }

    text = pages.join('\n\n');
  } else if (extension === 'docx') {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = result.value;
  } else if (extension === 'doc') {
    throw new Error('Legacy .doc files are not supported. Save the document as .docx and try again.');
  } else {
    throw new Error('Choose a PDF or Word .docx file.');
  }

  const extractedText = text.trim();
  if (!extractedText) {
    throw new Error('No selectable text was found in this document.');
  }

  return extractedText;
}