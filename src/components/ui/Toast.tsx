import { useEffect } from 'react'
import { useToast } from '../../hooks/useToast'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const icons = {
  success: <CheckCircle size={16} className="text-success" />,
  error: <XCircle size={16} className="text-danger" />,
  info: <Info size={16} className="text-blue-brand" />,
}

const bgMap = {
  success: 'bg-success-pale border-success/20',
  error: 'bg-danger-pale border-danger/20',
  info: 'bg-blue-pale border-blue-brand/20',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast: t, onClose }: { toast: { id: string; message: string; variant: 'success' | 'error' | 'info' }; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg text-sm text-text-primary ${bgMap[t.variant]} animate-in slide-in-from-right`}>
      {icons[t.variant]}
      <span className="flex-1">{t.message}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-black/5 rounded cursor-pointer"><X size={14} /></button>
    </div>
  )
}
