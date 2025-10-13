// runtime probe to select a reachable backend (deployed first, then localhost)
import axios from 'axios';

const DEFAULT_DEPLOYED = import.meta.env.VITE_API_BASE || 'https://penta-bot-backend.vercel.app';
const LOCAL_FALLBACK = 'http://localhost:5000';

let resolvedBase = null;

export async function resolveApiBase(timeout = 3000) {
  if (resolvedBase) return resolvedBase;

  const tryUrl = async (base) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await axios.get(`${base}/health`, { signal: controller.signal, timeout });
      clearTimeout(id);
      if (res.status === 200) return true;
    } catch (err) {
      return false;
    }
    return false;
  };

  if (await tryUrl(DEFAULT_DEPLOYED)) {
    resolvedBase = DEFAULT_DEPLOYED;
  } else if (await tryUrl(LOCAL_FALLBACK)) {
    resolvedBase = LOCAL_FALLBACK;
  } else {
    // last-resort: prefer deployed even if down (so devs can inspect errors)
    resolvedBase = DEFAULT_DEPLOYED;
  }

  // cache for runtime
  window.__API_BASE__ = resolvedBase;
  return resolvedBase;
}

export function getApiBase() {
  return resolvedBase || window.__API_BASE__ || DEFAULT_DEPLOYED;
}

export function setApiBase(value) {
  resolvedBase = value;
  window.__API_BASE__ = value;
}
