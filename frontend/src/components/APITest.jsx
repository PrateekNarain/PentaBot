// src/components/APITest.jsx
import { useState } from 'react';
import { testGeminiAPI } from '../services/geminiService';

function APITest() {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    const result = await testGeminiAPI();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-4">Gemini API Test</h1>
        <p className="text-gray-400 mb-6">
          Click the button below to test if your Gemini API key is working correctly.
        </p>

        <button
          onClick={handleTest}
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-6"
        >
          {testing ? 'Testing...' : 'Test Gemini API'}
        </button>

        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
            <h3 className={`font-semibold mb-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.success ? '✅ Success!' : '❌ Failed'}
            </h3>
            <p className="text-white text-sm font-mono">
              {testResult.success ? testResult.message : testResult.error}
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Troubleshooting:</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Check browser console (F12) for detailed logs</li>
            <li>• Verify your .env file has VITE_GEMINI_API_KEY</li>
            <li>• Make sure you restarted the dev server after adding .env</li>
            <li>• API key should start with "AIzaSy..."</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/chat" 
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Chat
          </a>
        </div>
      </div>
    </div>
  );
}

export default APITest;