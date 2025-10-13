// backend/src/services/geminiService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function sendMessageToGemini(messageText, history = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Instruction for current input only, with strict formatting
    const formattingInstruction = `
Analyze only the current input and provide a single, focused response labeled with exactly one type:
- Use 'PARAGRAPHS' (and nothing else) for narrative, explanatory, or creative content. Example: 'write a poem' → 'PARAGRAPHS: The moon rises gently... Stars twinkle...'. Format each sentence or natural line on a new line.
- Use 'POINTS' (and nothing else) for counting, greetings, or lists. Example: 'write counting from 1 to 5' → 'POINTS: 1. One. 2. Two...'. Format each item on a new line, with sentences within items separated by new lines after full stops.
- Use 'UNCLEAR' (and nothing else) if the input is unclear or irrelevant. Example: 'random stuff' → 'UNCLEAR: Please provide a clear request...'.
- Include only the labeled content (e.g., 'PARAGRAPHS:', 'POINTS:', 'UNCLEAR:') followed by the response. Do not mix formats or add unrelated text. Keep responses concise and directly relevant to the input.`;

    // Use only the current messageText, ignoring history
    const fullPrompt = `${messageText}\n${formattingInstruction}`;

    // Generate content with the full prompt
    const result = await model.generateContent(fullPrompt);
    let responseText = result.response.text();

    // Debug logging to inspect raw output
    console.log('Raw response from Gemini:', responseText);

    // Post-process to enforce new lines
    let processedResponse = '';
    if (responseText.startsWith('PARAGRAPHS:')) {
      processedResponse = responseText
        .replace(/PARAGRAPHS:/i, '')
        .split(/\. |\n/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .join('.\n')
        .trim();
      if (!processedResponse.endsWith('.')) {
        processedResponse += '.';
      }
    } else if (responseText.startsWith('POINTS:')) {
      processedResponse = responseText
        .replace(/POINTS:/i, '')
        .split(/(\d+\.\s|-+\s)/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join('\n')
        .split('. ')
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .join('.\n')
        .trim();
      if (!processedResponse.endsWith('.')) {
        processedResponse += '.';
      }
    } else if (responseText.startsWith('UNCLEAR:')) {
      processedResponse = responseText.replace(/UNCLEAR:/i, '').trim();
    } else {
      processedResponse = 'UNCLEAR: Please provide a clear request (e.g., "write a poem" or "count from 1 to 5").';
    }

    return processedResponse;
  } catch (error) {
    console.error('Gemini API error:', {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

async function streamMessageToGemini(messageText, history = [], onChunk) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const formattingInstruction = `
Analyze only the current input and provide a single, focused response labeled with exactly one type:
- Use 'PARAGRAPHS' (and nothing else) for narrative, explanatory, or creative content. Example: 'write a poem' → 'PARAGRAPHS: The moon rises gently... Stars twinkle...'. Format each sentence or natural line on a new line.
- Use 'POINTS' (and nothing else) for counting, greetings, or lists. Example: 'write counting from 1 to 5' → 'POINTS: 1. One. 2. Two...'. Format each item on a new line, with sentences within items separated by new lines after full stops.
- Use 'UNCLEAR' (and nothing else) if the input is unclear or irrelevant. Example: 'random stuff' → 'UNCLEAR: Please provide a clear request...'.
- Include only the labeled content (e.g., 'PARAGRAPHS:', 'POINTS:', 'UNCLEAR:') followed by the response. Do not mix formats or add unrelated text. Keep responses concise and directly relevant to the input.`;

    // Use only the current messageText, ignoring history
    const fullPrompt = `${messageText}\n${formattingInstruction}`;

    const result = await model.generateContentStream(fullPrompt);
    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        onChunk(chunkText);
      }
    }

    // Debug logging to inspect raw output
    console.log('Raw response from Gemini:', fullResponse);

    // Post-process to enforce new lines
    let processedResponse = '';
    if (fullResponse.startsWith('PARAGRAPHS:')) {
      processedResponse = fullResponse
        .replace(/PARAGRAPHS:/i, '')
        .split(/\. |\n/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .join('.\n')
        .trim();
      if (!processedResponse.endsWith('.')) {
        processedResponse += '.';
      }
    } else if (fullResponse.startsWith('POINTS:')) {
      processedResponse = fullResponse
        .replace(/POINTS:/i, '')
        .split(/(\d+\.\s|-+\s)/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join('\n')
        .split('. ')
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .join('.\n')
        .trim();
      if (!processedResponse.endsWith('.')) {
        processedResponse += '.';
      }
    } else if (fullResponse.startsWith('UNCLEAR:')) {
      processedResponse = fullResponse.replace(/UNCLEAR:/i, '').trim();
    } else {
      processedResponse = 'UNCLEAR: Please provide a clear request (e.g., "write a poem" or "count from 1 to 5").';
    }

    return processedResponse;
  } catch (error) {
    console.error('Gemini streaming error:', error);
    throw new Error(`Failed to stream response: ${error.message}`);
  }
}

async function testGeminiAPI() {
  try {
    const response = await sendMessageToGemini('Hello, test message');
    return { success: true, message: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { sendMessageToGemini, streamMessageToGemini, testGeminiAPI };