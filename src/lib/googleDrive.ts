import { NotebookDossierItem } from './notebookStorage';

export const DRIVE_TOKEN_KEY = 'repurpose_drive_access_token';

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  filename?: string;
  error?: string;
}

export function getStoredDriveToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(DRIVE_TOKEN_KEY) || localStorage.getItem(DRIVE_TOKEN_KEY) || null;
}

export function storeDriveToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DRIVE_TOKEN_KEY, token);
  localStorage.setItem(DRIVE_TOKEN_KEY, token);
}

export function clearStoredDriveToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DRIVE_TOKEN_KEY);
  localStorage.removeItem(DRIVE_TOKEN_KEY);
}

/**
 * Escapes characters for PDF string literals.
 */
function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' '); // Strip non-ASCII/control chars for standard Helvetica
}

/**
 * Generates a clean, valid standard PDF (PDF 1.4) Blob from notebook dossier items.
 * Completely zero-dependency, ultra-fast, and natively readable by Google Drive and Adobe Acrobat.
 */
export function generateNotebookPdfBlob(
  items: NotebookDossierItem[],
  investigatorName: string = 'Researcher'
): Blob {
  const currentDate = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Stream text operators for PDF page content
  const lines: string[] = [];

  // Coordinate system: Letter size is 612 x 792 points (72 DPI)
  // Origin (0,0) is bottom-left. Margin: 50pt left, 740pt top.
  let y = 740;

  function addText(text: string, font: string = '/F1', size: number = 10, dy: number = 14) {
    if (y < 60) return; // Basic page boundary
    const clean = escapePdfText(text);
    lines.push(`BT ${font} ${size} Tf 50 ${y} Td (${clean}) Tj ET`);
    y -= dy;
  }

  function addRule() {
    if (y < 60) return;
    lines.push(`0.75 w 0.8 0.85 0.9 RG 50 ${y} m 562 ${y} l S`);
    y -= 12;
  }

  // Header
  addText('REPURPOSE RESEARCH NOTEBOOK', '/F2', 18, 22);
  addText('Scientific Dossier & Hypothesis Archive', '/F2', 12, 16);
  addText(`Investigator: ${investigatorName}  |  Archived: ${currentDate} ${currentTime}`, '/F1', 9, 14);
  addText('Storage: Preserved permanently in Google Drive (Independent of 30-day website workspace cleanup)', '/F1', 9, 16);
  addRule();

  if (!items || items.length === 0) {
    addText('No active research dossiers or hypothesis records recorded at time of export.', '/F1', 11, 20);
  } else {
    items.forEach((item, idx) => {
      if (y < 100) return;

      const drugName = item.drug || 'Unknown Drug';
      const targetCond = item.condition || 'General Research';
      const title = `${idx + 1}. ${drugName.toUpperCase()}  ->  ${targetCond.toUpperCase()}`;
      addText(title, '/F2', 12, 16);

      const savedDate = (item.savedAt ? item.savedAt.slice(0, 10) : currentDate);
      const meta = `Saved Date: ${savedDate}  |  State: ${item.state || 'Hypothesis'}  |  Score: ${Math.round(item.score || 0)}%`;
      addText(meta, '/F1', 9, 13);

      if (item.tags && item.tags.length > 0) {
        addText(`Tags: ${item.tags.map(t => '#' + t).join(' ')}`, '/F1', 9, 13);
      }

      if (item.notes && item.notes.trim()) {
        const cleanNotes = item.notes.trim().replace(/\r?\n/g, ' ');
        // Wrap notes roughly into 85-char lines
        const words = cleanNotes.split(' ');
        let curLine = 'Notes: ';
        for (const w of words) {
          if ((curLine + w).length > 85) {
            addText(curLine, '/F1', 9, 12);
            curLine = '       ';
          }
          curLine += w + ' ';
        }
        if (curLine.trim()) {
          addText(curLine, '/F1', 9, 13);
        }
      } else {
        addText('Notes: [No investigator notes recorded for this item]', '/F1', 9, 13);
      }

      if (item.checklist) {
        const checkKeys = Object.keys(item.checklist);
        if (checkKeys.length > 0) {
          const completed = checkKeys.filter(k => item.checklist && item.checklist[k]).length;
          addText(`Verification Checklist: ${completed} of ${checkKeys.length} items verified`, '/F1', 9, 14);
        }
      }

      y -= 8;
      addRule();
    });
  }

  // Footer Disclaimer
  y = 45;
  addText('For education and research only. This document does not provide medical advice or treatment recommendations.', '/F1', 8, 10);
  addText('Repurpose Open-Source Biomedical Platform  |  https://drugrepurpose.vercel.app', '/F1', 8, 10);

  const streamContent = lines.join('\n');
  const streamLength = new TextEncoder().encode(streamContent).length;

  // Construct PDF Objects
  const pdfBody = [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    'endobj',
    '4 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    '5 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    'endobj',
    '6 0 obj',
    `<< /Length ${streamLength} >>`,
    'stream',
    streamContent,
    'endstream',
    'endobj',
  ];

  // Calculate offsets for xref table
  let currentOffset = 0;
  const offsets: number[] = [0];

  const assembledString = pdfBody.join('\n') + '\n';
  const objectMatches = [
    '1 0 obj',
    '2 0 obj',
    '3 0 obj',
    '4 0 obj',
    '5 0 obj',
    '6 0 obj'
  ];

  for (const objHeader of objectMatches) {
    const pos = assembledString.indexOf(objHeader);
    offsets.push(pos);
  }

  const xrefStart = assembledString.length;
  const xrefLines = [
    'xref',
    '0 7',
    '0000000000 65535 f ',
    ...offsets.slice(1).map(off => off.toString().padStart(10, '0') + ' 00000 n ')
  ];

  const trailer = [
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    xrefStart.toString(),
    '%%EOF'
  ];

  const fullPdfString = assembledString + xrefLines.join('\n') + '\n' + trailer.join('\n');

  return new Blob([fullPdfString], { type: 'application/pdf' });
}

/**
 * Uploads a generated PDF file directly into the user's Google Drive using the Drive v3 REST API.
 */
export async function uploadPdfToGoogleDrive(
  accessToken: string,
  pdfBlob: Blob,
  filename: string
): Promise<DriveUploadResult> {
  const metadata = {
    name: filename,
    description: 'Repurpose Research Notebook Dossier Snapshot - Saved permanently in personal Google Drive.',
    mimeType: 'application/pdf',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  try {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/pdf\r\n' +
      'Content-Transfer-Encoding: binary\r\n\r\n';

    const enc = new TextEncoder();
    const metadataBytes = enc.encode(metadataPart);
    const closeBytes = enc.encode(closeDelimiter);

    // Combine binary buffers into multipart body
    const totalLength = metadataBytes.length + bytes.length + closeBytes.length;
    const bodyBytes = new Uint8Array(totalLength);
    bodyBytes.set(metadataBytes, 0);
    bodyBytes.set(bytes, metadataBytes.length);
    bodyBytes.set(closeBytes, metadataBytes.length + bytes.length);

    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyBytes,
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearStoredDriveToken();
        return {
          success: false,
          error: 'Google Drive authorization token expired. Please re-authenticate.',
        };
      }
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData?.error?.message || `Google Drive upload failed with HTTP ${res.status}.`,
      };
    }

    const data = await res.json();

    return {
      success: true,
      fileId: data.id,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      filename,
    };
  } catch (err: unknown) {
    console.error('Google Drive upload error:', err);
    return {
      success: false,
      error: (err as Error).message || 'Failed to connect to Google Drive service.',
    };
  }
}
