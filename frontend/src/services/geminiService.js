// src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debug logs
console.log('🔑 API Key present:', !!API_KEY);
console.log('🔑 API Key length:', API_KEY?.length || 0);

if (!API_KEY) {
  console.error('❌ GEMINI API KEY MISSING!');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Use the correct model name - gemini-pro (not gemini-1.5-flash)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'  // This is the stable model name
});

/**
 * Test if Gemini API is working
 */
export async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Gemini API...');
    const result = await model.generateContent('Say "Hello, I am working!" if you can read this.');
    const response = await result.response;
    const text = response.text();
    console.log('✅ API Test Success:', text);
    return { success: true, message: text };
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a message to Gemini and get a response
 */
export async function sendMessageToGemini(message, conversationHistory = []) {
  try {
    console.log('📤 Sending to Gemini:', message);
    
    // Build context from conversation history
    const context = conversationHistory
      .slice(-5) // Last 5 messages for context
      .filter(msg => msg.sender && msg.text)
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const prompt = context 
      ? `${context}\nUser: ${message}\nAssistant:` 
      : `User: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Response received');
    return text;
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status
    });
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

/**
 * Stream responses from Gemini (for real-time typing effect)
 */
export async function streamMessageToGemini(message, onChunk, conversationHistory = []) {
  try {
    console.log('📤 Streaming to Gemini:', message);
    
    const context = conversationHistory
      .slice(-5)
      .filter(msg => msg.sender && msg.text)
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const prompt = context 
      ? `${context}\nUser: ${message}\nAssistant:` 
      : `User: ${message}\nAssistant:`;

    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(fullText);
    }

    console.log('✅ Streaming completed');
    return fullText;
  } catch (error) {
    console.error('❌ Streaming Error:', error);
    throw new Error(`Failed to stream AI response: ${error.message}`);
  }
}