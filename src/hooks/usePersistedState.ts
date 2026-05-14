import { useState, useEffect, useCallback } from 'react'

export function usePersistedState<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored) as T
    } catch {}
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])

  const syncFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored) as T
        setState(parsed)
      }
    } catch {}
  }, [key])

  useEffect(() => {
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('medvante-sync', syncFromStorage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('medvante-sync', syncFromStorage)
    }
  }, [syncFromStorage])

  return [state, setState]
}

export function notifyStorageSync() {
  window.dispatchEvent(new CustomEvent('medvante-sync'))
}
