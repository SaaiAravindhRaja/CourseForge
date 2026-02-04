import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// Simple text extraction for PDFs using basic parsing
// For a production app, you'd use a proper PDF library
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Convert to string and try to extract readable text
  const uint8Array = new Uint8Array(buffer);
  let text = '';

  // Simple extraction: look for text streams in PDF
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = decoder.decode(uint8Array);

  // Extract text between BT (begin text) and ET (end text) markers
  // This is a simplified approach that works for many PDFs
  const textMatches = rawText.match(/\((.*?)\)/g);
  if (textMatches) {
    text = textMatches
      .map(match => match.slice(1, -1)) // Remove parentheses
      .filter(t => t.length > 1 && /[a-zA-Z]/.test(t)) // Filter out non-text
      .join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // If we got very little text, try another approach
  if (text.length < 100) {
    // Try to find readable ASCII sequences
    const asciiText: string[] = [];
    let currentWord = '';

    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      // Check if it's a printable ASCII character
      if (byte >= 32 && byte <= 126) {
        currentWord += String.fromCharCode(byte);
      } else if (currentWord.length > 3) {
        // Only keep words longer than 3 chars
        if (/[a-zA-Z]{2,}/.test(currentWord)) {
          asciiText.push(currentWord);
        }
        currentWord = '';
      } else {
        currentWord = '';
      }
    }

    if (asciiText.length > 0) {
      text = asciiText.join(' ').replace(/\s+/g, ' ').trim();
    }
  }

  return text || 'Unable to extract text from this PDF. Please try uploading a text file (.txt, .md) instead.';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileType = file.type;
    let content = '';

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Extract text from PDF
      const buffer = await file.arrayBuffer();
      content = await extractTextFromPDF(buffer);
    } else {
      // Read as text for other file types
      content = await file.text();
    }

    return NextResponse.json({
      success: true,
      document: {
        name: fileName,
        type: fileType.includes('pdf') ? 'pdf' : 'text',
        content,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
