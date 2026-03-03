import { useState } from 'react'

export default function QuestRewardForm({ type, onSubmit, onClose }) {
  const [title, setTitle] = useState('')
  const [coins, setCoins] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isQuest = type === 'quest'
  const label = isQuest ? 'Квест' : 'Награда'

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Введи название'); return }
    if (!coins || isNaN(coins) || Number(coins) <= 0) { setError('Введи количество коинов'); return }

    setLoading(true)
    setError(null)

    const { error } = await onSubmit(title.trim(), Number(coins), description.trim() || null)

    if (error) {
      setError('Ошибка при сохранении')
      setLoading(false)
    } else {
      onClose()
    }
  }

  return (
    <div className="form">
      <div className="form-field">
        <label className="form-label">Название</label>
        <input
          className="input"
          placeholder={isQuest ? 'Выйти на пробежку' : 'Кофе из кофейни'}
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-field">
        <label className="form-label">Коины {isQuest ? 'за выполнение' : 'стоимость'}</label>
        <input
          className="input"
          type="number"
          placeholder="10"
          min="1"
          value={coins}
          onChange={e => setCoins(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <div className="form-field">
        <label className="form-label">
          Описание <span style={{color: 'var(--text-muted)', fontFamily: 'Crimson Pro, serif', textTransform: 'none', letterSpacing: 0}}>— опционально</span>
        </label>
        <textarea
          className="input textarea"
          placeholder={isQuest ? 'Условия выполнения, детали...' : 'Когда и как получить...'}
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Отмена
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : `Добавить ${label}`}
        </button>
      </div>
    </div>
  )
}
