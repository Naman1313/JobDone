import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    // Mock AI logic (In production, connect to OpenAI/Gemini)
    let reply = "I'm JobDone AI. I can help you find professionals, answer questions about home repairs, and guide you through the platform.";
    
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('plumber') || lowerMsg.includes('pipe') || lowerMsg.includes('leak')) {
      reply = "It sounds like you need a plumber. You can search for 'Plumber' in the top search bar, or I can help you post a new Job to attract nearby professionals!";
    } else if (lowerMsg.includes('electrician') || lowerMsg.includes('light') || lowerMsg.includes('power')) {
      reply = "Electrical issues require a licensed professional. I recommend searching for 'Master Electrician' to find qualified workers in your area.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('budget')) {
      reply = "Prices vary by trade and location. Plumbers generally charge $50-$150/hr, while electricians might be $75-$200/hr. Would you like me to show you how to post a job with your specific budget?";
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      reply 
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
