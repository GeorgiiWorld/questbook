import { useState } from 'react'
import { useHapticButton } from '../hooks/useHapticButton'
import ConfirmModal from './ConfirmModal'

export default function RewardCard({ reward, onTake, onDelete, onView }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const handleTake = useHapticButton(() => onTake(reward))

  return (
    <>
      <div className="card card-reward" onClick={() => onView(reward)}>
        <div className="card-title">{reward.title}</div>
        <div className="card-meta">
          <span className="card-coins">◈ {reward.coins}</span>
          <div className="card-actions" onClick={e => e.stopPropagation()}>
            <button className="btn btn-take" onClick={handleTake}>Взять</button>
            <button className="btn btn-delete" onClick={() => setConfirmOpen(true)}>✕</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDelete(reward.id)}
        title="Удалить награду"
        message={`Удалить награду «${reward.title}»?`}
      />
    </>
  )
}
