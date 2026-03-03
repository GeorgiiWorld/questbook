import { useState } from 'react'
import Modal from './Modal'

export default function ViewModal({ item, type, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item?.title || '')
  const [coins, setCoins] = useState(item?.coins || '')
  const [description, setDescription] = useState(item?.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!item) return null

  const isQuest = type === 'quest'

  const handleSave = async () => {
    if (!title.trim()) { setError('Введи название'); return }
    if (!coins || isNaN(coins) || Number(coins) <= 0) { setError('Введи коины'); return }

    setLoading(true)
    const { error } = await onUpdate(item.id, {
      title: title.trim(),
      coins: Number(coins),
      description: description.trim() || null
    })

    if (error) {
      setError('Ошибка при сохранении')
      setLoading(false)
    } else {
      setEditing(false)
      setLoading(false)
      onClose()
    }
  }

  const handleStartEdit = () => {
    setTitle(item.title)
    setCoins(item.coins)
    setDescription(item.description || '')
    setError(null)
    setEditing(true)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={isQuest ? 'Квест' : 'Награда'}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

        {!editing ? (
          <>
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
                <div style={{fontSize: '15px', color: 'var(--text-dim)', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
                  {item.description}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-ghost" onClick={onClose}>Закрыть</button>
              <button className="btn btn-primary" onClick={handleStartEdit}>Редактировать</button>
            </div>
          </>
        ) : (
          <>
            <div className="form-field">
              <label className="form-label">Название</label>
              <input
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Коины {isQuest ? 'за выполнение' : 'стоимость'}
              </label>
              <input
                className="input"
                type="number"
                min="1"
                value={coins}
                onChange={e => setCoins(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Описание <span style={{color: 'var(--text-muted)', fontFamily: 'Crimson Pro, serif', textTransform: 'none', letterSpacing: 0}}>— опционально</span>
              </label>
              <textarea
                className="input textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setEditing(false)} disabled={loading}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? '...' : 'Сохранить'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
