import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { resolveApiBase } from './utils/backendProbe'

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await resolveApiBase();
      if (mounted) setReady(true);
    })();
    return () => { mounted = false };
  }, []);

  if (!ready) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Connecting...</div>;

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
