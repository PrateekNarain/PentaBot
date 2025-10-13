// src/components/SignUp.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignUp({ setAuth, setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup`, {
        username,
        password,
        email,
      });

      // Store token from your backend
      localStorage.setItem('token', res.data.token);
      setAuth(true);
      setUser({ username: res.data.user.username });
      navigate('/chat');
    } catch (err) {
      console.error('Sign up error:', err);
      // Network error (no response) vs API error
      if (!err.response) {
        setError('Network error: could not reach the backend. Is the server running?');
      } else {
        setError(err.response?.data?.message || err.response?.data?.msg || 'Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Join PentaBot today</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Choose a username" 
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password (min 6 characters)" 
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              required
              minLength="6"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold p-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <a href="/signin" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignUp;