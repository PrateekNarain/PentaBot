// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ChatArea from './components/ChatArea';
import Sidebar from './components/Sidebar';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const API_BASE = import.meta.env.VITE_API_BASE || window.__API_BASE__ || 'http://localhost:5000';
      axios.get(`${API_BASE}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsAuthenticated(true);
        setUser({
          id: res.data.user.id,
          username: res.data.user.username,
          email: res.data.user.email,
          credits: res.data.user.credits,
          role: res.data.user.role,
        });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const refreshChats = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? (
              <Navigate to="/chat" />
            ) : (
              <SignUp setAuth={setIsAuthenticated} setUser={setUser} />
            )
          } 
        />
        <Route 
          path="/signin" 
          element={
            isAuthenticated ? (
              <Navigate to="/chat" />
            ) : (
              <SignIn setAuth={setIsAuthenticated} setUser={setUser} />
            )
          } 
        />
        <Route 
          path="/chat" 
          element={
            isAuthenticated ? (
              <div className="flex min-h-screen bg-gray-900">
                <Sidebar 
                  currentChatId={currentChatId}
                  setCurrentChatId={setCurrentChatId}
                  refreshTrigger={refreshTrigger}
                />
                <ChatArea 
                  user={user} 
                  setAuth={setIsAuthenticated} 
                  setUser={setUser}
                  currentChatId={currentChatId}
                  setCurrentChatId={setCurrentChatId}
                  refreshChats={refreshChats}
                />
              </div>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/chat" : "/signin"} />} />
      </Routes>
    </Router>
  );
}

export default App;