import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  header?: ReactNode
}

export function Card({ children, className = '', header }: CardProps) {
  return (
    <div className={`bg-bg-card border border-border rounded-xl shadow-card ${className}`}>
      {header && (
        <div className="px-5 py-4 border-b border-border">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
