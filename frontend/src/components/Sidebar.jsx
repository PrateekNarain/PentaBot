// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBase } from '../utils/backendProbe';
import gptLogo from '../assets/chatgpt.svg';
import addBtn from '../assets/add-30.png';
import msgIcon from '../assets/message.svg';
import home from '../assets/home.svg';
import saved from '../assets/bookmark.svg';
import rocket from '../assets/rocket.svg';

function Sidebar({ currentChatId, setCurrentChatId, refreshTrigger }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [refreshTrigger]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${getApiBase()}/api/chat/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data.chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${getApiBase()}/api/chat/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-[2] flex flex-col border-r border-gray-800 p-6 bg-gray-900">
      <div className="flex-grow overflow-y-auto">
        <div className="mb-8 flex items-center">
          <img src={gptLogo} alt="Logo" className="mr-4 h-8 w-8" />
          <span className="text-2xl font-bold text-white">PentaBot</span>
        </div>
        
        <button 
          onClick={handleNewChat}
          className="mb-8 flex w-full cursor-pointer items-center justify-start rounded-md border border-gray-700 bg-transparent p-3 text-left text-base text-white transition-colors duration-200 hover:bg-gray-800"
        >
          <img src={addBtn} alt="New Chat" className="mr-4 h-5 w-5" />
          New Chat
        </button>

        <div className="mb-4 text-xs text-gray-500 uppercase font-semibold">
          Chat History
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm text-center py-4">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`group flex items-center justify-between gap-2 rounded-md p-3 text-left text-sm transition-colors duration-200 cursor-pointer ${
                  currentChatId === chat.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={msgIcon} alt="Chat" className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{chat.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(chat.lastMessageAt)}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                  title="Delete chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 pt-4 mt-4">
        <div className="flex flex-col gap-2">
          <div className="flex w-full cursor-pointer items-center gap-4 rounded-md p-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-gray-800">
            <img src={home} alt="Home" className="h-5 w-5" />
            <span>Home</span>
          </div>
          <div className="flex w-full cursor-pointer items-center gap-4 rounded-md p-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-gray-800">
            <img src={saved} alt="Saved" className="h-5 w-5" />
            <span>Saved</span>
          </div>
          <div className="flex w-full cursor-pointer items-center gap-4 rounded-md p-2 text-left text-sm text-gray-300 transition-colors duration-200 hover:bg-gray-800">
            <img src={rocket} alt="Upgrade to Pro" className="h-5 w-5" />
            <span>Upgrade to Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;