// src/components/MessageList.jsx
import { useState, useEffect } from 'react';

function MessageList({ messages, onSendMessage, isLoading }) {
  const [localMessages, setLocalMessages] = useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-6 bg-gray-900">
      {localMessages.map((msg) => (
        <div key={msg.id} className={`mb-4 ${msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="flex items-start gap-4 max-w-[70%]">
            {msg.sender === 'ai' && (
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-500 text-white">
                P
              </div>
            )}
            <div
              className={`p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-green-600 text-white self-end'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <div
                className="text-sm"
                style={{ whiteSpace: 'pre-wrap' }} // Preserve new lines and wrap text
              >
                {msg.isLoading ? 'Typing...' : msg.text}
              </div>
              <div className="text-xs text-gray-400 mt-1">{msg.time}</div>
            </div>
            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-full bg-gray-500"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MessageList;