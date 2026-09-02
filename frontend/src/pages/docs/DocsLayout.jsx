// --- FILE: frontend/src/pages/docs/DocsLayout.jsx ---

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/navigation/Sidebar';
import { docsApi } from '../../api/docs';
import { Menu, Layers } from 'lucide-react';

export function DocsLayout() {
  const [docsList, setDocsList] = useState([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await docsApi.getDocsList();
        if (res?.success && res?.docs) {
          setDocsList(res.docs);
        }
      } catch (err) {
        console.error('Failed to load docs index:', err);
      }
    }
    loadDocs();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative">
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden w-full flex items-center justify-between p-3 rounded-lg border border-border-color bg-card-bg/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-title-color font-mono">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Documentation Index</span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Docs Sidebar */}
      <Sidebar
        type="docs"
        docsList={docsList}
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Docs Content Body */}
      <div className="flex-1 min-w-0 w-full">
        <Outlet context={{ docsList }} />
      </div>
    </div>
  );
}
