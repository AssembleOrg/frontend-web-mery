import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownTextProps {
  children?: string | null;
  className?: string;
}

export function MarkdownText({ children, className }: MarkdownTextProps) {
  if (!children) return null;
  return (
    <div className={`markdown-text ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p>
          ),
          strong: ({ children }) => (
            <strong className='font-semibold'>{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className='list-disc pl-6 mb-3 space-y-1'>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal pl-6 mb-3 space-y-1'>{children}</ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#660e1b] underline hover:opacity-80'
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className='text-2xl font-bold mb-3'>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-xl font-bold mb-2'>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-lg font-semibold mb-2'>{children}</h3>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
