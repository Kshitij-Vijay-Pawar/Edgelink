'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.recentAudits && data.recentAudits.length > 0) {
          router.replace(`/client/${data.recentAudits[0].id}`);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">
        Locating latest client audit report...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Audits Available</h2>
        <p className="text-sm text-slate-600 mb-6">
          No audit reports have been generated yet. Please launch an audit from the Admin Portal.
        </p>
        <Link
          href="/admin"
          className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
        >
          Go to Admin Portal
        </Link>
      </div>
    </div>
  );
}
