// src/components/ChatArea.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import ErrorBoundary from './ErrorBoundary';
import TopBar from './TopBar';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

function ChatArea({ user, setAuth, setUser, currentChatId, setCurrentChatId, refreshChats }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(user?.credits || 0);
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      content: 'Welcome! Your AI assistant is ready.',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  ]);

  // Load chat messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Fetch user credits on mount
  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/chat/credits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCredits(res.data.credits);
      setUser(prev => ({ ...prev, credits: res.data.credits }));
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/chat/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const formattedMessages = res.data.chat.messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    // Check credits before sending
    if (credits <= 0) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        content: '⚠️ Insufficient credits! Please upgrade to continue chatting.',
        read: false,
        createdAt: new Date(),
      }]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/chat/message',
        { 
          message: messageText,
          chatId: currentChatId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update AI message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: res.data.reply, isLoading: false }
            : msg
        )
      );

      // Update credits
      setCredits(res.data.credits);
      setUser(prev => ({ ...prev, credits: res.data.credits }));

      // Update current chat ID if it's a new chat
      if (!currentChatId && res.data.chatId) {
        setCurrentChatId(res.data.chatId);
      }

      // Refresh chat list in sidebar
      refreshChats();

      // Show notification if credits are low
      if (res.data.credits <= 10 && res.data.credits > 0) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          content: `⚠️ Low credits! You have ${res.data.credits} credits remaining.`,
          read: false,
          createdAt: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.msg || 'Failed to send message';
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { 
                ...msg, 
                text: `Sorry, ${errorMsg}`,
                isLoading: false,
                isError: true 
              }
            : msg
        )
      );

      // If insufficient credits, refresh credits
      if (error.response?.status === 403) {
        fetchUserCredits();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-[9] flex flex-col h-screen bg-gray-900 text-white">
      <ErrorBoundary>
        <TopBar
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
          user={user}
          credits={credits}
          setAuth={setAuth}
          setUser={setUser}
        />
      </ErrorBoundary>

      <div className="flex-grow overflow-y-auto p-6">
        <ErrorBoundary>
          <MessageList messages={messages} isLoading={isLoading} />
        </ErrorBoundary>
      </div>

      <div className="border-t border-gray-800">
        <ErrorBoundary>
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            disabled={credits <= 0}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default ChatArea;