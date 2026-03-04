import Modal from './Modal'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Подтверждение'}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <p style={{color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.6'}}>
          {message || 'Ты уверен?'}
        </p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button
            className="btn"
            style={{background: 'var(--danger)', border: '1px solid #a03030', color: '#ffaaaa'}}
            onClick={() => { onConfirm(); onClose() }}
          >
            Удалить
          </button>
        </div>
      </div>
    </Modal>
  )
}
