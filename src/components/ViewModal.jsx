import Modal from './Modal'

export default function ViewModal({ item, type, onClose }) {
  if (!item) return null

  const isQuest = type === 'quest'

  return (
    <Modal isOpen={true} onClose={onClose} title={isQuest ? 'Квест' : 'Награда'}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

        <div>
          <div className="form-label" style={{marginBottom: '6px'}}>Название</div>
          <div style={{fontSize: '18px', color: 'var(--text)'}}>{item.title}</div>
        </div>

        <div>
          <div className="form-label" style={{marginBottom: '6px'}}>
            {isQuest ? 'Коины за выполнение' : 'Стоимость'}
          </div>
          <div style={{fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: '16px'}}>
            ◈ {item.coins}
          </div>
        </div>

        {item.description && (
          <div>
            <div className="form-label" style={{marginBottom: '6px'}}>Описание</div>
            <div style={{
              fontSize: '15px',
              color: 'var(--text-dim)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {item.description}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </Modal>
  )
}
