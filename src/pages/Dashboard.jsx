import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useQuests } from '../hooks/useQuests'
import { useRewards } from '../hooks/useRewards'
import { useLogs } from '../hooks/useLogs'
import { supabase } from '../lib/supabase'
import Buddies from './Buddies'
import Modal from '../components/Modal'
import QuestRewardForm from '../components/QuestRewardForm'
import ViewModal from '../components/ViewModal'

export default function Dashboard({ userId }) {
  const { profile, loading: profileLoading, refetch, setProfile } = useProfile(userId)
  const { quests, addQuest, deleteQuest, updateQuest } = useQuests(userId)
  const { rewards, addReward, deleteReward, updateReward } = useRewards(userId)
  const { logs, addLog } = useLogs(userId)
  const [tab, setTab] = useState('quests')
  const [modal, setModal] = useState(null) // 'quest' | 'reward' | null
  const [viewing, setViewing] = useState(null) // { item, type }

  const handleCompleteQuest = async (quest) => {
    // Обновляем UI мгновенно
    const previousCoins = profile.coins || 0
    setProfile(prev => ({ ...prev, coins: previousCoins + quest.coins }))

    await addLog('quest', quest.title, quest.coins)
    const { error } = await supabase.rpc('add_coins', { p_user_id: userId, p_amount: quest.coins })

    if (error) {
      // Откатываем если ошибка
      setProfile(prev => ({ ...prev, coins: previousCoins }))
    }
  }

  const handleTakeReward = async (reward) => {
    if ((profile.coins || 0) < reward.coins) {
      alert('Недостаточно коинов!')
      return
    }

    const previousCoins = profile.coins || 0
    setProfile(prev => ({ ...prev, coins: previousCoins - reward.coins }))

    await addLog('reward', reward.title, -reward.coins)
    const { error } = await supabase.rpc('add_coins', { p_user_id: userId, p_amount: -reward.coins })

    if (error) {
      setProfile(prev => ({ ...prev, coins: previousCoins }))
    }
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
              <div key={quest.id} className="card card-quest" onClick={() => setViewing({ item: quest, type: 'quest' })}>
                <div className="card-title">{quest.title}</div>
                <div className="card-meta">
                  <span className="card-coins">◈ {quest.coins}</span>
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-complete" onClick={() => handleCompleteQuest(quest)}>Выполнил</button>
                    <button className="btn btn-delete" onClick={() => deleteQuest(quest.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={() => setModal('quest')}>
              + Добавить квест
            </button>
          </div>
        )}

        {tab === 'rewards' && (
          <div>
            <div className="section-header">
              <span className="section-title">Каталог наград</span>
            </div>
            {rewards.length === 0 && <div className="empty">Нет наград — добавь что хочешь получить</div>}
            {rewards.map(reward => (
              <div key={reward.id} className="card card-reward" onClick={() => setViewing({ item: reward, type: 'reward' })}>
                <div className="card-title">{reward.title}</div>
                <div className="card-meta">
                  <span className="card-coins">◈ {reward.coins}</span>
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-take" onClick={() => handleTakeReward(reward)}>Взять</button>
                    <button className="btn btn-delete" onClick={() => deleteReward(reward.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={() => setModal('reward')}>
              + Добавить награду
            </button>
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
      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'quest' ? 'Новый квест' : 'Новая награда'}
      >
        <QuestRewardForm
          type={modal}
          onSubmit={modal === 'quest' ? addQuest : addReward}
          onClose={() => setModal(null)}
        />
      </Modal>
      <ViewModal
        item={viewing?.item}
        type={viewing?.type}
        onClose={() => setViewing(null)}
        onUpdate={viewing?.type === 'quest' ? updateQuest : updateReward}
      />
    </div>
  )
}
