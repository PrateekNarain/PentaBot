// src/services/chatApi.js
import axios from 'axios';
import { getApiBase } from '../utils/backendProbe';

// Resolve API base at runtime via getApiBase()
const API_BASE = () => getApiBase();

export async function sendChatMessage(message, history = []) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  try {
    const res = await axios.post(
      `${API_BASE()}/api/chat/message`,
      { message, history },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; // { reply, remainingCredits }
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const msg = data?.msg || data?.error || err.message;
      const error = new Error(msg);
      error.status = status;
      throw error;
    }
    throw err;
  }
}

export async function getCredits() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const res = await axios.get(`${API_BASE()}/api/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.credits;
}
