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

  if (profileLoading) return <p>Загрузка...</p>

  return (
    <div>
      <div>
        <h1>QuestBook</h1>
        <p>👤 {profile?.username}</p>
        <p>💰 {profile?.coins || 0} коинов</p>
        <button onClick={() => supabase.auth.signOut()}>Выйти</button>
      </div>

      <div>
        <button onClick={() => setTab('quests')}>Квесты</button>
        <button onClick={() => setTab('rewards')}>Награды</button>
        <button onClick={() => setTab('log')}>Лог</button>
        <button onClick={() => setTab('buddies')}>Бадди</button>
      </div>

      {tab === 'quests' && (
        <div>
          <h2>Квесты</h2>
          <button onClick={() => {
            const title = prompt('Название квеста:')
            const coins = parseInt(prompt('Коинов за выполнение:'))
            if (title && coins) addQuest(title, coins)
          }}>+ Добавить квест</button>
          {quests.map(quest => (
            <div key={quest.id}>
              <span>{quest.title} — {quest.coins} коинов</span>
              <button onClick={() => handleCompleteQuest(quest)}>✅ Выполнил</button>
              <button onClick={() => deleteQuest(quest.id)}>🗑</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'rewards' && (
        <div>
          <h2>Награды</h2>
          <button onClick={() => {
            const title = prompt('Название награды:')
            const coins = parseInt(prompt('Стоимость в коинах:'))
            if (title && coins) addReward(title, coins)
          }}>+ Добавить награду</button>
          {rewards.map(reward => (
            <div key={reward.id}>
              <span>{reward.title} — {reward.coins} коинов</span>
              <button onClick={() => handleTakeReward(reward)}>🎁 Взять</button>
              <button onClick={() => deleteReward(reward.id)}>🗑</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'log' && (
        <div>
          <h2>Лог</h2>
          {logs.map(log => (
            <div key={log.id}>
              <span>{log.type === 'quest' ? '✅' : '🎁'} {log.title}</span>
              <span>{log.coins > 0 ? '+' : ''}{log.coins} коинов</span>
              <span>{new Date(log.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'buddies' && (
        <Buddies userId={userId} inviteCode={profile?.invite_code} />
      )}
    </div>
  )
}
