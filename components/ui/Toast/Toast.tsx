import Close from '@components/icons/Close'
import { useEffect } from 'react'
import { Button } from '../Button'
import { useToast } from '@lib/hooks/use-toast'
import { STRINGS } from '@lib/strings'

type Props = {
  children: React.ReactNode
  id: number
}

const Toast = ({ children, id }: Props) => {
  const { removeToast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id)
    }, 5000)
    return () => {
      clearTimeout(timer)
    }
  }, [id, removeToast])

  return (
    <div className="toast-item">
      <span className="toast-item-message">{children}</span>
      <Button
        className="toast-item-close"
        onClick={() => removeToast(id)}
        ariaLabel={STRINGS.close}
      >
        <Close />
      </Button>
    </div>
  )
}

export default Toast
