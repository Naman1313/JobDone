import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    // If API key is missing, fallback to mock data so it doesn't crash the UI completely
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Falling back to mock response.");
      return NextResponse.json({ 
        success: true, 
        reply: "I am currently in offline mode (API Key missing). I'm JobDone AI, I can help you find professionals and navigate the app when online!" 
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // The system prompt that gives JobDone AI its personality and rules
    const systemInstruction = `You are JobDone AI, an incredibly helpful, friendly, and professional assistant integrated into the "JobDone" app.
JobDone is a premium social hiring platform where users can post jobs (e.g., plumbing, electrical, web development), share their portfolios, and broadcast SOS Emergencies for urgent help.
Your goal is to assist users with their questions, guide them on how to use the app, and provide general advice on hiring or gig work.
Keep your responses concise, well-formatted, and enthusiastic. Never break character.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ 
      success: true, 
      reply: response.text 
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate response' }, { status: 500 });
  }
}
