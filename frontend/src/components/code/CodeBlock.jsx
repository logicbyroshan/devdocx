// --- FILE: frontend/src/components/code/CodeBlock.jsx ---

import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';

export function CodeBlock({
  code = '',
  language = 'javascript',
  filename,
  showLineNumbers = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const cleanLang = (language || 'text').toLowerCase();
  const grammar = Prism.languages[cleanLang] || Prism.languages.javascript || Prism.languages.text;
  const highlightedCode = Prism.highlight(code.trim(), grammar, cleanLang);

  return (
    <div className={`my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80 inline-block" />
          {filename ? (
            <span className="text-slate-200 font-medium">{filename}</span>
          ) : (
            <span className="uppercase tracking-wider font-semibold text-[11px] text-cyan-400">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-teal-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container with dedicated horizontal scroll */}
      <div className="p-4 overflow-x-auto">
        <pre className="!bg-transparent !p-0 !m-0 !border-0 font-mono text-sm leading-relaxed text-slate-200">
          <code
            className={`language-${cleanLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
