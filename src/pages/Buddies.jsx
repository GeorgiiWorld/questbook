import { useState } from 'react'
import { useBuddies } from '../hooks/useBuddies'
import BuddyProfile from './BuddyProfile'

export default function Buddies({ userId, inviteCode }) {
  const { buddies, loading, addBuddy } = useBuddies(userId)
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedBuddy, setSelectedBuddy] = useState(null)

  const handleAdd = async () => {
    setError(null)
    setSuccess(false)
    const { error } = await addBuddy(code.trim())
    if (error) setError(error)
    else { setSuccess(true); setCode('') }
  }

  if (loading) return <div className="empty">Загрузка...</div>

  if (selectedBuddy) return (
    <BuddyProfile buddy={selectedBuddy} onBack={() => setSelectedBuddy(null)} />
  )

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Бадди</span>
      </div>

      <div className="invite-box">
        <div className="invite-label">Твой код приглашения</div>
        <div className="invite-code">{inviteCode}</div>
        <div className="invite-hint">Поделись с другом чтобы играть вместе</div>
      </div>

      <div className="input-row">
        <input
          className="input"
          placeholder="Код бадди"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" onClick={handleAdd}>Добавить</button>
      </div>

      {error && <p className="error-text" style={{marginBottom: '12px'}}>{error}</p>}
      {success && <p style={{color: 'var(--quest-light)', fontSize: '13px', marginBottom: '12px', textAlign: 'center'}}>Бадди добавлен!</p>}

      {buddies.length === 0 && <div className="empty">Пока нет бадди</div>}

      {buddies.map(buddy => (
        <div key={buddy.id} className="buddy-card" onClick={() => setSelectedBuddy(buddy)}>
          <div className="buddy-name">{buddy.username}</div>
          <div className="buddy-coins">◈ {buddy.coins} коинов</div>
          <div className="buddy-hint">Нажми чтобы посмотреть профиль →</div>
        </div>
      ))}
    </div>
  )
}
