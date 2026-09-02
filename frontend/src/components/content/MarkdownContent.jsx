// --- FILE: frontend/src/components/content/MarkdownContent.jsx ---

import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { CodeBlock } from '../code/CodeBlock';
import { MermaidDiagram } from '../diagrams/MermaidDiagram';
import { Callout } from '../ui/Callout';

/**
 * Splits raw content into blocks: Markdown, Mermaid diagrams, and Callouts
 */
export function MarkdownContent({ content = '', className = '' }) {
  const blocks = useMemo(() => {
    if (!content) return [];

    const result = [];
    const lines = content.split('\n');
    let currentMarkdown = [];
    let inMermaid = false;
    let mermaidBuffer = [];
    let inCode = false;
    let codeBuffer = [];
    let codeLanguage = '';
    let inCallout = false;
    let calloutType = 'note';
    let calloutBuffer = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check Mermaid fence
      if (line.trim().startsWith('```mermaid')) {
        if (currentMarkdown.length > 0) {
          result.push({ type: 'markdown', content: currentMarkdown.join('\n') });
          currentMarkdown = [];
        }
        inMermaid = true;
        mermaidBuffer = [];
        continue;
      }

      if (inMermaid) {
        if (line.trim() === '```') {
          inMermaid = false;
          result.push({ type: 'mermaid', content: mermaidBuffer.join('\n') });
          mermaidBuffer = [];
        } else {
          mermaidBuffer.push(line);
        }
        continue;
      }

      // Check custom Callout blocks (:::note, :::tip, :::warning, :::danger, :::success)
      const calloutMatch = line.trim().match(/^:::(note|tip|warning|danger|success)$/i);
      if (calloutMatch) {
        if (currentMarkdown.length > 0) {
          result.push({ type: 'markdown', content: currentMarkdown.join('\n') });
          currentMarkdown = [];
        }
        inCallout = true;
        calloutType = calloutMatch[1].toLowerCase();
        calloutBuffer = [];
        continue;
      }

      if (inCallout) {
        if (line.trim() === ':::') {
          inCallout = false;
          result.push({ type: 'callout', calloutType, content: calloutBuffer.join('\n') });
          calloutBuffer = [];
        } else {
          calloutBuffer.push(line);
        }
        continue;
      }

      // Check general code block
      if (line.trim().startsWith('```') && !inCode) {
        if (currentMarkdown.length > 0) {
          result.push({ type: 'markdown', content: currentMarkdown.join('\n') });
          currentMarkdown = [];
        }
        inCode = true;
        codeLanguage = line.trim().replace('```', '') || 'text';
        codeBuffer = [];
        continue;
      }

      if (inCode) {
        if (line.trim() === '```') {
          inCode = false;
          result.push({ type: 'code', language: codeLanguage, content: codeBuffer.join('\n') });
          codeBuffer = [];
        } else {
          codeBuffer.push(line);
        }
        continue;
      }

      currentMarkdown.push(line);
    }

    if (currentMarkdown.length > 0) {
      result.push({ type: 'markdown', content: currentMarkdown.join('\n') });
    }

    return result;
  }, [content]);

  return (
    <div className={`prose-content ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'mermaid') {
          return <MermaidDiagram key={idx} chart={block.content} />;
        }

        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.content} language={block.language} />;
        }

        if (block.type === 'callout') {
          const rawHtml = marked.parse(block.content);
          const cleanHtml = DOMPurify.sanitize(rawHtml);
          return (
            <Callout key={idx} type={block.calloutType}>
              <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
            </Callout>
          );
        }

        if (block.type === 'markdown') {
          const rawHtml = marked.parse(block.content);
          const cleanHtml = DOMPurify.sanitize(rawHtml);
          return (
            <div
              key={idx}
              className="text-slate-300 leading-relaxed space-y-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-title-color [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-title-color [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-title-color [&>h3]:mt-5 [&>h3]:mb-2 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>blockquote]:border-l-2 [&>blockquote]:border-cyan-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-400 [&>table]:w-full [&>table]:border-collapse [&>table]:my-4 [&>table_th]:border [&>table_th]:border-slate-700 [&>table_th]:bg-slate-900 [&>table_th]:p-2.5 [&>table_th]:text-xs [&>table_th]:font-semibold [&>table_td]:border [&>table_td]:border-slate-800 [&>table_td]:p-2.5 [&>table_td]:text-sm [&>a]:text-cyan-400 [&>a]:underline hover:[&>a]:text-cyan-300 [&>hr]:border-border-color [&>hr]:my-6"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
