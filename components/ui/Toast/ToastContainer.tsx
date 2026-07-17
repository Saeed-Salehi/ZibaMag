import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Toast from './Toast'

const ToastContainer = ({ toasts }: { toasts: TToast[] }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || toasts.length === 0) return null

  return createPortal(
    <div
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((item: TToast) => (
        <Toast key={item.id} id={item.id}>
          {item.content}
        </Toast>
      ))}
    </div>,
    document.body
  )
}

export default ToastContainer
