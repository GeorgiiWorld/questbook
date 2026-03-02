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

  if (loading) return <p>Загрузка...</p>

  return (
    <div>
      <button onClick={onBack}>← Назад</button>

      <h2>👤 {buddy.username}</h2>
      <p>💰 {buddy.coins} коинов</p>

      <h3>Квесты</h3>
      {quests.length === 0 && <p>Нет квестов</p>}
      {quests.map(quest => (
        <div key={quest.id} style={{padding: '8px', margin: '4px 0', background: '#f5f5f5'}}>
          <span>{quest.title}</span>
          <span style={{float: 'right'}}>+{quest.coins} коинов</span>
        </div>
      ))}

      <h3>Награды</h3>
      {rewards.length === 0 && <p>Нет наград</p>}
      {rewards.map(reward => (
        <div key={reward.id} style={{padding: '8px', margin: '4px 0', background: '#fff9e6'}}>
          <span>{reward.title}</span>
          <span style={{float: 'right'}}>{reward.coins} коинов</span>
        </div>
      ))}

      <h3>Последние действия</h3>
      {logs.length === 0 && <p>Нет активности</p>}
      {logs.map(log => (
        <div key={log.id} style={{padding: '8px', margin: '4px 0'}}>
          <span>{log.type === 'quest' ? '✅' : '🎁'} {log.title}</span>
          <span style={{float: 'right'}}>{log.coins > 0 ? '+' : ''}{log.coins} коинов</span>
          <div style={{fontSize: '12px', color: '#888'}}>
            {new Date(log.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}
