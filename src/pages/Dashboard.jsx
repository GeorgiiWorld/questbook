import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useQuests } from '../hooks/useQuests'
import { useRewards } from '../hooks/useRewards'
import { useLogs } from '../hooks/useLogs'
import { supabase } from '../lib/supabase'
import Buddies from './Buddies'

export default function Dashboard({ userId }) {
  const { profile, loading: profileLoading, refetch } = useProfile(userId)
  const { quests, addQuest, deleteQuest } = useQuests(userId)
  const { rewards, addReward, deleteReward } = useRewards(userId)
  const { logs, addLog } = useLogs(userId)
  const [tab, setTab] = useState('quests')

  const handleCompleteQuest = async (quest) => {
    await addLog('quest', quest.title, quest.coins)
    await supabase.rpc('add_coins', { p_user_id: userId, p_amount: quest.coins })
    await refetch()
  }

  const handleTakeReward = async (reward) => {
    if ((profile.coins || 0) < reward.coins) {
      alert('Недостаточно коинов!')
      return
    }
    await addLog('reward', reward.title, -reward.coins)
    await supabase.rpc('add_coins', { p_user_id: userId, p_amount: -reward.coins })
    await refetch()
  }

  if (profileLoading) return <div className="empty">Загрузка...</div>

  return (
    <div className="app">
      <div className="header">
        <div className="header-top">
          <div className="logo">QuestBook</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div className="balance">
              <span className="balance-icon">◈</span>
              {profile?.coins || 0}
            </div>
            <button className="btn-logout" onClick={() => supabase.auth.signOut()} title="Выйти">⏻</button>
          </div>
        </div>
        <div className="nav">
          {['quests', 'rewards', 'log', 'buddies'].map(t => (
            <button
              key={t}
              className={`nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'quests' ? 'Квесты' : t === 'rewards' ? 'Награды' : t === 'log' ? 'Лог' : 'Бадди'}
            </button>
          ))}
        </div>
      </div>

      <div className="content">
        {tab === 'quests' && (
          <div>
            <div className="section-header">
              <span className="section-title">Активные квесты</span>
            </div>
            {quests.length === 0 && <div className="empty">Нет квестов — добавь первый</div>}
            {quests.map(quest => (
              <div key={quest.id} className="card card-quest">
                <div className="card-title">{quest.title}</div>
                <div className="card-meta">
                  <span className="card-coins">◈ {quest.coins}</span>
                  <div className="card-actions">
                    <button className="btn btn-complete" onClick={() => handleCompleteQuest(quest)}>Выполнил</button>
                    <button className="btn btn-delete" onClick={() => deleteQuest(quest.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={() => {
              const title = prompt('Название квеста:')
              const coins = parseInt(prompt('Коинов за выполнение:'))
              if (title && coins) addQuest(title, coins)
            }}>+ Добавить квест</button>
          </div>
        )}

        {tab === 'rewards' && (
          <div>
            <div className="section-header">
              <span className="section-title">Каталог наград</span>
            </div>
            {rewards.length === 0 && <div className="empty">Нет наград — добавь что хочешь получить</div>}
            {rewards.map(reward => (
              <div key={reward.id} className="card card-reward">
                <div className="card-title">{reward.title}</div>
                <div className="card-meta">
                  <span className="card-coins">◈ {reward.coins}</span>
                  <div className="card-actions">
                    <button className="btn btn-take" onClick={() => handleTakeReward(reward)}>Взять</button>
                    <button className="btn btn-delete" onClick={() => deleteReward(reward.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={() => {
              const title = prompt('Название награды:')
              const coins = parseInt(prompt('Стоимость в коинах:'))
              if (title && coins) addReward(title, coins)
            }}>+ Добавить награду</button>
          </div>
        )}

        {tab === 'log' && (
          <div>
            <div className="section-header">
              <span className="section-title">История</span>
            </div>
            {logs.length === 0 && <div className="empty">Выполни первый квест</div>}
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
        )}

        {tab === 'buddies' && (
          <Buddies userId={userId} inviteCode={profile?.invite_code} />
        )}
      </div>
    </div>
  )
}
