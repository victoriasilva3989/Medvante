import { useState, useEffect, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

type Listener = (t: Toast) => void
const listeners = new Set<Listener>()

export function toast(message: string, variant: Toast['variant'] = 'info') {
  const t: Toast = { id: Date.now().toString(), message, variant }
  listeners.forEach(fn => fn(t))
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const fn: Listener = (t) => setToasts(prev => [...prev, t])
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, removeToast }
}
