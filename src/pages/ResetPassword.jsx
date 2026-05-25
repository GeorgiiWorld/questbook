import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (password.length < 6) { setError('Минимум 6 символов'); return }
    if (password !== confirm) { setError('Пароли не совпадают'); return }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) setError(error.message)
    else onDone()

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">QuestBook</div>
        <div className="auth-subtitle">Новый пароль</div>

        <div className="auth-form">
          <input
            className="input"
            type="password"
            placeholder="Новый пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            type="password"
            placeholder="Повтори пароль"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : 'Сохранить пароль'}
          </button>
        </div>
      </div>
    </div>
  )
}
