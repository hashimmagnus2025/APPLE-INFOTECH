export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
      <path d="M0 6h16.2M11.2 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  )
}

export function ArrowDown({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">
      <path d="M6 0v16.2M1 11.2l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  )
}

export function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 13L13 1M4.5 1H13v8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  )
}
