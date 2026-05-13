import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'gold'
  children: ReactNode
  className?: string
}

const colors = {
  blue: 'bg-blue-pale text-blue-mid border border-blue-muted',
  green: 'bg-success-pale text-success',
  red: 'bg-danger-pale text-danger',
  amber: 'bg-warning-pale text-warning',
  gold: 'bg-gold-pale text-gold border border-gold-border',
}

export function Badge({ variant = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]} ${className}`}>
      {children}
    </span>
  )
}
