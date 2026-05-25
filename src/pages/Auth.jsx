import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleReset = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">QuestBook</div>
        <div className="auth-subtitle">Преврати жизнь в игру</div>

        <div className="auth-form">
          {resetSent ? (
            <div style={{textAlign: 'center', color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.8'}}>
              <p>Письмо отправлено на {email}</p>
              <p style={{fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px'}}>
                Проверь почту и перейди по ссылке
              </p>
              <span
                style={{color: 'var(--gold)', cursor: 'pointer', fontSize: '13px'}}
                onClick={() => { setResetSent(false); setResetMode(false) }}
              >
                Вернуться
              </span>
            </div>
          ) : resetMode ? (
            <>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="off"
              />
              {error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary" onClick={handleReset} disabled={loading}>
                {loading ? '...' : 'Отправить письмо'}
              </button>
              <div className="auth-switch">
                <span onClick={() => setResetMode(false)}>← Назад</span>
              </div>
            </>
          ) : (
            <>
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="off"
              />
              <input
                className="input"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              {error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '...' : isLogin ? 'Войти' : 'Начать игру'}
              </button>
              {isLogin && (
                <div style={{textAlign: 'center', marginTop: '4px'}}>
                  <span
                    style={{color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer'}}
                    onClick={() => setResetMode(true)}
                  >
                    Забыл пароль
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {!resetMode && !resetSent && (
          <div className="auth-switch">
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Регистрация' : 'Войти'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
