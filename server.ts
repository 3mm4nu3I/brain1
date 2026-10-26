import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize GoogleGenAI SDK (reads GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI({});

// 1. API: Chat endpoint with Multi-turn history, Search Grounding & Maps Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const {
      contents,
      systemInstruction = 'You are the Grand Neuro-Mathematical Oracle & Clinical Brain Happiness Consultant. You explain brain states, WHO well-being indices, allostatic strain, and provide evidence-based insights.',
      groundingMode = 'none', // 'none' | 'search' | 'maps'
      userLocation, // { latitude, longitude }
      model = 'gemini-3.5-flash',
    } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'contents array is required' });
    }

    const config: Record<string, any> = {
      systemInstruction,
    };

    if (groundingMode === 'search') {
      config.tools = [{ googleSearch: {} }];
    } else if (groundingMode === 'maps') {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        };
      }
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title || 'Web Source',
        uri: c.web.uri,
      }));
    const mapSources = groundingChunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        title: c.maps.title || 'Maps Location',
        uri: c.maps.uri,
      }));

    return res.json({
      text,
      webSources,
      mapSources,
      model,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during Gemini model generation.',
    });
  }
});

// 2. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 3. Vite development server integration or static production serve
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
