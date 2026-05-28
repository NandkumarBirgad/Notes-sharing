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
    
    if (prompt.includes('summarize') || prompt.includes('Summary')) {
      return `## 🧠 Professor Gemini Study Companion (Demo Mode)

> 💡 **टीप**: खऱ्याखुऱ्या AI उत्तरांसाठी, कृपया Render वर किंवा तुमच्या .env मध्ये तुमची स्वतःची **GEMINI_API_KEY** जोडा!

---

### 📌 Key Takeaways & Overview (महत्त्वाचे मुद्दे)
या अभ्यास साहित्यामध्ये विषयाची व्याख्या, त्याचे विविध भाग, आणि परीक्षेत विचारले जाणारे महत्त्वाचे प्रश्न सविस्तरपणे मांडले आहेत. 

### 🧠 Core Concepts & Explanations (मुख्य संकल्पना)
* **मूलभूत सिद्धांत (Core Principles)**: या विषयाचा पाया समजून घेणे, आकृत्यांचे रेखाटन करणे आणि त्यांच्या व्याख्या पाठ करणे अत्यंत गरजेचे आहे.
* **ऑप्टिमायझेशन (Optimization)**: कोणत्याही समस्येचे किंवा कोडचे विश्लेषण करताना कमीत कमी जागेत आणि वेळेत (Complexity) ते कसे सोडवता येईल, यावर भर दिला आहे.

### 🔢 Key Formulas & Syntax Rules (महत्त्वाचे सूत्र)
\`\`\`
कार्यक्षमता (Efficiency) = (निर्गत कार्य / प्रविष्ट ऊर्जा) * १००%
Time Complexity = O(N log N)
Space Complexity = O(1)
\`\`\`

### 💡 Practice Questions & Answers (सराव प्रश्नोत्तरे)

**Q1: या अभ्यास साहित्याचा मुख्य उद्देश काय आहे?**
* **A**: विद्यार्थ्यांना परीक्षेची तयारी सोप्या भाषेत करता यावी आणि महत्त्वाच्या संकल्पना एकाच जागी मिळाव्यात, हा या साहित्याचा मुख्य हेतू आहे.

**Q2: अभ्यास करताना कोणत्या गोष्टींवर जास्त भर दिला पाहिजे?**
* **A**: महत्त्वाच्या व्याख्या, आकृत्यांचे रेखाटन आणि डेटाबेसमध्ये उपलब्ध असणाऱ्या मागील वर्षांच्या प्रश्नपत्रिकांचा सराव यावर अधिक लक्ष केंद्रित करावे.`;
    }
    
    return `🎓 **Professor Gemini (Tutor AI):** खूप चांगला प्रश्न विचारलात! 

सध्या मी **Demo Mode** मध्ये चालत आहे कारण तुमची **GEMINI_API_KEY** सेट केलेली नाही.

तुमच्या खऱ्याखुऱ्या पीडीएफ मधून अचूक एआय उत्तरे मिळवण्यासाठी:
1. **Render.com** वर जा.
2. तुमच्या environment variables मध्ये **`GEMINI_API_KEY`** नाव आणि तुमची की (Key) व्हॅल्यू म्हणून जोडा.
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
