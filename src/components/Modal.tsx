import './Modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'error' | 'success' | 'warning'
}

function Modal({ isOpen, onClose, title, message, type = 'error' }: ModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <span className="modal-icon">{getIcon()}</span>
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
