import { Shield } from 'lucide-react'

export function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 text-text-on-dark2 text-xs">
      <Shield size={12} className="text-gold" />
      <span>Proteção nível bancário</span>
      <span className="text-text-on-dark2/60">·</span>
      <span className="text-text-on-dark2/60">LGPD · AWS · SSL</span>
    </div>
  )
}
