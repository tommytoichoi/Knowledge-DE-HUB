import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

/** Renders a note's Markdown with the book-like reading typography. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-stone max-w-none dark:prose-invert',
        // headings: serif display face, like a printed book
        'prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight',
        'prose-h2:mt-12 prose-h2:text-3xl prose-h3:text-2xl',
        'prose-p:leading-7 prose-li:leading-7',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground',
        // inline code
        'prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none',
        // code blocks
        'prose-pre:rounded-2xl prose-pre:border prose-pre:bg-stone-950 prose-pre:text-stone-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
        // tables
        'prose-table:text-sm prose-th:text-foreground',
        'prose-blockquote:border-l-primary prose-blockquote:font-normal prose-blockquote:not-italic',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
