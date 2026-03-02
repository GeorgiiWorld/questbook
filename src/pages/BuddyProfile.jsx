import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function BuddyProfile({ buddy, onBack }) {
  const [quests, setQuests] = useState([])
  const [rewards, setRewards] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [questsRes, rewardsRes, logsRes] = await Promise.all([
        supabase.from('quests').select('*').eq('user_id', buddy.id).order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').eq('user_id', buddy.id).order('created_at', { ascending: false }),
        supabase.from('logs').select('*').eq('user_id', buddy.id).order('created_at', { ascending: false }).limit(20)
      ])
      setQuests(questsRes.data || [])
      setRewards(rewardsRes.data || [])
      setLogs(logsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [buddy.id])

  if (loading) return <div className="empty">Загрузка...</div>

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Назад</button>

      <div style={{marginBottom: '24px'}}>
        <div style={{fontFamily: 'Cinzel, serif', fontSize: '20px', color: 'var(--text)', marginBottom: '4px'}}>
          {buddy.username}
        </div>
        <div style={{color: 'var(--gold)', fontFamily: 'Cinzel, serif'}}>◈ {buddy.coins} коинов</div>
      </div>

      <div className="section-header">
        <span className="section-title">Квесты</span>
      </div>
      {quests.length === 0 && <div className="empty">Нет квестов</div>}
      {quests.map(quest => (
        <div key={quest.id} className="card card-quest" style={{cursor: 'default'}}>
          <div className="card-title">{quest.title}</div>
          <div className="card-coins">◈ {quest.coins}</div>
        </div>
      ))}

      <div className="section-header" style={{marginTop: '20px'}}>
        <span className="section-title">Награды</span>
      </div>
      {rewards.length === 0 && <div className="empty">Нет наград</div>}
      {rewards.map(reward => (
        <div key={reward.id} className="card card-reward" style={{cursor: 'default'}}>
          <div className="card-title">{reward.title}</div>
          <div className="card-coins">◈ {reward.coins}</div>
        </div>
      ))}

      <div className="section-header" style={{marginTop: '20px'}}>
        <span className="section-title">Последние действия</span>
      </div>
      {logs.length === 0 && <div className="empty">Нет активности</div>}
      {logs.map(log => (
        <div key={log.id} className="log-item">
          <span className="log-icon">{log.type === 'quest' ? '⚔' : '◈'}</span>
          <div className="log-body">
            <div className="log-title">{log.title}</div>
            <div className="log-date">{new Date(log.created_at).toLocaleDateString('ru-RU')}</div>
          </div>
          <span className={`log-coins ${log.coins > 0 ? 'positive' : 'negative'}`}>
            {log.coins > 0 ? '+' : ''}{log.coins} ◈
          </span>
        </div>
      ))}
    </div>
  )
}
