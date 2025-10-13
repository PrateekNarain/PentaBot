// backend/test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testApiKey() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Updated to current stable model
    const result = await model.generateContent('Hello, can you respond?');
    console.log('API Key is working! Response:', result.response.text());
  } catch (error) {
    console.error('API Key test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status, 'Data:', error.response.data);
    }
  }
}

testApiKey();