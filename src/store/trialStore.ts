import { create } from 'zustand'
import type { PlanStatus, PlanType } from '../types'

interface TrialState {
  trialStartDate: string | null
  trialDays: 7 | 14
  planStatus: PlanStatus
  planType?: PlanType
  startTrial: (days: 7 | 14) => void
  activatePlan: (plan: PlanType) => void
  getDaysRemaining: () => number
  isExpired: () => boolean
  isInGrace: () => boolean
}

export const useTrialStore = create<TrialState>((set, get) => ({
  trialStartDate: new Date().toISOString(),
  trialDays: 7,
  planStatus: 'trial',

  startTrial: (days: 7 | 14 = 7) => {
    set({
      trialStartDate: new Date().toISOString(),
      trialDays: days,
      planStatus: 'trial',
    })
  },

  activatePlan: (plan: PlanType) => {
    set({ planStatus: 'active', planType: plan })
  },

  getDaysRemaining: () => {
    const { trialStartDate, trialDays } = get()
    if (!trialStartDate) return 0
    const start = new Date(trialStartDate)
    const now = new Date()
    const elapsed = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.max(0, trialDays - elapsed)
  },

  isExpired: () => {
    return get().getDaysRemaining() <= 0
  },

  isInGrace: () => {
    const { planStatus } = get()
    return planStatus === 'grace'
  },
}))
