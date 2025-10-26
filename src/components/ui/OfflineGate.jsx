// src/components/ui/OfflineGate.jsx - Offline detection gate for Trading MVP
import { checkOnline } from '@/lib/online';
import { useEffect, useState } from 'react';
import { resolveApiBase } from '@/lib/apiBase';

export function OfflineGate({ children }) {
  const [online, setOnline] = useState(null);
  
  useEffect(() => {
    (async () => {
      const ok = await checkOnline();
      setOnline(ok);
    })();
  }, []);
  
  if (online === false) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200">
        <h3 className="font-semibold text-rose-800 mb-2">You're Offline</h3>
        <p className="text-sm text-rose-700">
          API: {resolveApiBase()} — vérifiez le déploiement backend / DNS.
        </p>
        <div className="mt-4 flex gap-2">
          <button 
            onClick={async () => setOnline(await checkOnline())}
            className="px-3 py-2 rounded bg-rose-600 text-white"
          >
            Retry Connection
          </button>
          <button 
            onClick={() => location.reload()}
            className="px-3 py-2 rounded bg-slate-600 text-white"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}