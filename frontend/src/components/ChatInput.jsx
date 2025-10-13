// src/components/ChatInput.jsx
import { useState } from 'react';
import sendIcon from '../assets/send.svg';

function ChatInput({ onSendMessage, isLoading, disabled }) {
  const [input, setInput] = useState('');
  const charLimit = 2000;

  const handleSend = async () => {
    if (!input.trim() || isLoading || disabled) return;
    
    const messageText = input.trim();
    setInput('');
    
    await onSendMessage(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-800 p-4 bg-gray-900">
      {disabled && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ Insufficient credits! Please upgrade to continue.</span>
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-medium">
            Upgrade
          </button>
        </div>
      )}
      
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            disabled ? "Insufficient credits to send messages" :
            isLoading ? "AI is thinking..." : 
            "Type your message..."
          }
          className="w-full min-h-[44px] max-h-32 rounded-full bg-gray-800 text-white p-3 pr-12 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={charLimit}
          disabled={isLoading || disabled}
          rows={1}
        />
        <button 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading || disabled}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-all ${
            input.trim() && !isLoading && !disabled
              ? 'opacity-100 hover:scale-110' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <img 
            src={sendIcon} 
            alt="Send" 
            className={`h-6 w-6 ${isLoading ? 'animate-pulse' : ''}`} 
          />
        </button>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
        <div>
          {isLoading ? (
            <span className="text-blue-400 animate-pulse">AI is typing...</span>
          ) : disabled ? (
            <span className="text-red-400">No credits remaining</span>
          ) : (
            <span>Shift+Enter for new line</span>
          )}
        </div>
        <div>{input.length}/{charLimit}</div>
      </div>
    </div>
  );
}

export default ChatInput;