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
    console.warn('⚠️ GEMINI_API_KEY is missing. Using high-quality mock AI study companion fallback.');
    
    return `🎓 **Professor Gemini (Tutor AI):** खूप चांगला प्रश्न विचारलात! 

सध्या मी **Demo Mode** मध्ये चालत आहे कारण तुमची **GEMINI_API_KEY** सेट केलेली नाही.

तुमच्या खऱ्याखुऱ्या पीडीएफ मधून अचूक एआय उत्तरे मिळवण्यासाठी:
1. **Render.com** वर जा.
2. तुमच्या environment variables मध्ये **\`GEMINI_API_KEY\`** नाव आणि तुमची की (Key) व्हॅल्यू म्हणून जोडा.
3. सेव केल्यावर, मी तुमच्या पीडीएफमधील कोणत्याही ओळीचे अचूक उत्तर देईन!`;
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
  chatWithPdf
};
