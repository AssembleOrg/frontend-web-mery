'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  id?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = 240,
  id,
}: Readonly<MarkdownEditorProps>) {
  return (
    <div data-color-mode='light' id={id}>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview='edit'
        textareaProps={{ placeholder }}
      />
    </div>
  );
}
