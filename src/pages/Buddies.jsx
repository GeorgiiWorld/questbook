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
    else {
      setSuccess(true)
      setCode('')
    }
  }

  if (loading) return <p>Загрузка...</p>

  if (selectedBuddy) return (
    <BuddyProfile buddy={selectedBuddy} onBack={() => setSelectedBuddy(null)} />
  )

  return (
    <div>
      <h2>Мои бадди</h2>

      <div>
        <p>Твой код приглашения: <strong>{inviteCode}</strong></p>
        <p>Поделись этим кодом с другом чтобы он добавил тебя</p>
      </div>

      <div>
        <input
          placeholder="Введи код бадди"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button onClick={handleAdd}>Добавить бадди</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
        {success && <p style={{color: 'green'}}>Бадди добавлен!</p>}
      </div>

      {buddies.length === 0 && <p>Пока нет бадди</p>}

      {buddies.map(buddy => (
        <div
          key={buddy.id}
          onClick={() => setSelectedBuddy(buddy)}
          style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0', cursor: 'pointer'}}
        >
          <h3>👤 {buddy.username}</h3>
          <p>💰 {buddy.coins} коинов</p>
          <p style={{color: '#888', fontSize: '14px'}}>Нажми чтобы посмотреть →</p>
        </div>
      ))}
    </div>
  )
}
