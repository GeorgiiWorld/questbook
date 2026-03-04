import { useState } from 'react'
import { useHapticButton } from '../hooks/useHapticButton'
import ConfirmModal from './ConfirmModal'

export default function QuestCard({ quest, onComplete, onDelete, onView }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const handleComplete = useHapticButton(() => onComplete(quest))

  return (
    <>
      <div className="card card-quest" onClick={() => onView(quest)}>
        <div className="card-title">{quest.title}</div>
        <div className="card-meta">
          <span className="card-coins">◈ {quest.coins}</span>
          <div className="card-actions" onClick={e => e.stopPropagation()}>
            <button className="btn btn-complete" onClick={handleComplete}>Выполнил</button>
            <button className="btn btn-delete" onClick={() => setConfirmOpen(true)}>✕</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDelete(quest.id)}
        title="Удалить квест"
        message={`Удалить квест «${quest.title}»?`}
      />
    </>
  )
}