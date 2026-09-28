import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading mt-6 text-2xl font-bold tracking-tight text-mist uppercase first:mt-0 sm:text-3xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading mt-6 flex items-center gap-2 text-xl font-bold tracking-tight text-mist uppercase first:mt-0 sm:text-2xl">
      <span className="inline-block h-2 w-2 shrink-0 bg-medium-red" aria-hidden="true" />
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading mt-5 text-lg font-bold tracking-wide text-mist uppercase first:mt-0 sm:text-xl">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-mono mt-4 text-sm font-bold tracking-wider text-medium-red uppercase first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="font-content mt-3 text-sm leading-relaxed text-mist/85 first:mt-0 sm:text-base">
      {children}
    </p>
  ),
  a: ({ children, href }) => {
    const external = href?.startsWith('http') ?? false
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="font-semibold text-medium-red underline decoration-medium-red/50 underline-offset-2 transition-colors hover:text-[#f4938f]"
      >
        {children}
      </a>
    )
  },
  ul: ({ children }) => (
    <ul className="font-content mt-3 list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-mist/85 marker:text-medium-red first:mt-0 sm:text-base">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="font-content mt-3 list-decimal space-y-1.5 pl-6 text-sm leading-relaxed text-mist/85 marker:font-mono marker:font-bold marker:text-medium-red first:mt-0 sm:text-base">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 border-medium-red bg-black/30 py-1 pl-4 font-content text-sm text-mist/75 italic first:mt-0 sm:text-base">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '')
    return (
      <code
        className={
          isBlock
            ? 'font-mono text-mist/90'
            : 'rounded border border-dark-red/40 bg-black/60 px-1.5 py-0.5 font-mono text-[0.9em] text-[#f4938f]'
        }
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-dark-red/40 bg-black/60 first:mt-0">
      <pre className="p-4 font-mono text-xs leading-relaxed text-mist/90 sm:text-sm">
        {children}
      </pre>
    </div>
  ),
  hr: () => (
    <div
      aria-hidden="true"
      className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-dark-red/35 to-transparent"
    />
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-dark-red/40 first:mt-0">
      <table className="w-full border-collapse font-content text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-dark-red/40 bg-black/50 px-3 py-2 text-left font-mono text-[11px] font-bold tracking-wider text-medium-red uppercase">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-dark-red/20 px-3 py-2 text-mist/85 last:border-none">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      className="mt-4 max-w-full rounded-xl border border-dark-red/40 first:mt-0"
    />
  ),
  input: (props) => <input {...props} disabled className="accent-medium-red" />,
  strong: ({ children }) => (
    <strong className="font-bold text-mist">{children}</strong>
  ),
}

export default function EventMarkdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  )
}
