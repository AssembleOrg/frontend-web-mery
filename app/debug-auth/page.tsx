"use client";

import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [cookies, setCookies] = useState<Record<string,string>>({});

  useEffect(() => {
    // Read visible cookies (httpOnly won't be visible)
    const cookieObj: Record<string,string> = {};
    document.cookie.split(';').forEach((c) => {
      const [k, v] = c.trim().split('=');
      if (k) cookieObj[k] = decodeURIComponent(v || '');
    });
    setCookies(cookieObj);

    const run = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const text = await res.text();
        let body: any = null;
        try { body = JSON.parse(text); } catch (e) { body = text; }
        setResult({ status: res.status, ok: res.ok, body });
      } catch (err) {
        setError(String(err));
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Auth</h1>

      <section className="mb-6">
        <h2 className="font-semibold">Visible Cookies (document.cookie)</h2>
        <pre className="mt-2 bg-gray-100 p-3 rounded">{JSON.stringify(cookies, null, 2)}</pre>
      </section>

      <section>
        <h2 className="font-semibold">/api/auth/me response</h2>
        {error && <pre className="mt-2 text-red-600">{String(error)}</pre>}
        {result ? (
          <pre className="mt-2 bg-gray-100 p-3 rounded">{JSON.stringify(result, null, 2)}</pre>
        ) : (
          <p className="mt-2">Fetching...</p>
        )}
      </section>
    </div>
  );
}
