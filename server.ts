import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialize Gemini client to avoid crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI OCR, Translation, and Summarization Endpoint
  app.post('/api/ai/process-document', async (req, res) => {
    try {
      const { text, imageBase64, mimeType, task, targetLanguage, prompt } = req.body;
      
      const ai = getGeminiAI();

      let systemInstruction = "You are a professional document intelligence assistant. Extract accurate information, clean formatting, and produce crisp structured outputs without hallucinating.";
      
      let userPrompt = prompt || "";
      if (task === 'ocr') {
        userPrompt = userPrompt || "Extract all visible text from this document image cleanly. Preserve headings, paragraphs, and list structures as clean markdown.";
      } else if (task === 'summarize') {
        userPrompt = userPrompt || "Provide an executive summary of this document followed by 5 bullet points of key takeaways and actionable items.";
      } else if (task === 'translate') {
        userPrompt = `Translate the following document content into ${targetLanguage || 'Spanish'}. Maintain formatting and professional nuance: \n\n${text || ''}`;
      } else if (task === 'extract-table') {
        userPrompt = userPrompt || "Extract all tables or structured financial/numerical data from this document into clean Markdown tables.";
      } else if (task === 'qa') {
        userPrompt = userPrompt || "Answer questions based strictly on the provided document.";
      }

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        // Strip data url prefix if present
        const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: cleanBase64,
          },
        });
      }

      if (text) {
        parts.push({
          text: `Document Content:\n${text}\n\nTask/Question:\n${userPrompt}`,
        });
      } else {
        parts.push({
          text: userPrompt,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts,
        },
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const resultText = response.text || '';
      res.json({ success: true, result: resultText });
    } catch (err: any) {
      console.error('AI Document Processing Error:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to process document with AI',
      });
    }
  });

  // Determine whether to serve built assets or run Vite middleware
  const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT !== undefined;
  const distPath = path.join(process.cwd(), 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PDF Converter suite server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
