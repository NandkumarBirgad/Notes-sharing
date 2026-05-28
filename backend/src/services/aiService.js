const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Helper: Get file buffer either from local filesystem (fast) or download from URL
 */
const getFileBuffer = async (fileUrl) => {
  // If it's a local file URL
  if (fileUrl.includes('/uploads/')) {
    const filename = path.basename(fileUrl);
    const localPath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  }

  // Fallback: download over network
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Extracts plain text from a PDF file
 */
const extractTextFromPdf = async (fileUrl) => {
  try {
    const buffer = await getFileBuffer(fileUrl);
    const data = await pdfParse(buffer);
    
    // Trim and limit context to ~25,000 words to fit Gemini context limit easily
    return data.text ? data.text.substring(0, 100000) : '';
  } catch (error) {
    console.error('❌ PDF Text Extraction Error:', error.message);
    throw new Error(`PDF Parsing failed: ${error.message}`);
  }
};

/**
 * Helper: Query Gemini 1.5 Flash API
 */
const queryGemini = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please add GEMINI_API_KEY in your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [
        { text: systemInstruction }
      ]
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Gemini API responded with status ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response received from Gemini AI');
  }

  return text;
};

/**
 * Generate a highly structured Markdown Study Guide Summary of the PDF text
 */
const generateSummary = async (pdfText) => {
  const systemInstruction = 'You are a brilliant university professor and expert academic summarizer. Your job is to create professional, comprehensive, and highly engaging Study Guides in clean Markdown.';
  
  const prompt = `Please summarize the following study material text. Build a comprehensive Study Guide in Markdown.
Include:
1. **📌 Key Takeaways / Overview**: High-level summary of the material.
2. **🧠 Core Concepts & Explanations**: Explain the main algorithms, theories, or ideas in depth.
3. **🔢 Formulas & Equations (if any)**: Clear mathematical formulas or syntax rules.
4. **💡 Practice Questions & Answers**: Provide 3-5 potential questions from this material and their detailed answers to help students prepare for exams.

Study Material Text:
"""
${pdfText}
"""`;

  return queryGemini(prompt, systemInstruction);
};

/**
 * Answer a student's question based on the PDF content
 */
const chatWithPdf = async (pdfText, userQuestion, chatHistory = []) => {
  const systemInstruction = 'You are an elite academic AI tutor. Answer the student\'s question precisely, using only the provided Study Material text as context. Be helpful, clear, and professional.';

  let conversationContext = 'Study Material Text:\n"""\n' + pdfText + '\n"""\n\n';
  
  if (chatHistory && chatHistory.length > 0) {
    conversationContext += 'Conversation History:\n';
    chatHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Student' : 'AI Tutor';
      conversationContext += `${role}: ${msg.content}\n`;
    });
    conversationContext += '\n';
  }

  conversationContext += `Student's New Question: ${userQuestion}\nAI Tutor:`;

  return queryGemini(conversationContext, systemInstruction);
};

module.exports = {
  extractTextFromPdf,
  generateSummary,
  chatWithPdf
};
