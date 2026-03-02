import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRewards(userId) {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRewards(data || [])
        setLoading(false)
      })
  }, [userId])

  const addReward = async (title, coins) => {
    const { data, error } = await supabase
      .from('rewards')
      .insert({ user_id: userId, title, coins })
      .select()
      .single()

    if (!error) setRewards(prev => [data, ...prev])
    return { error }
  }

  const deleteReward = async (id) => {
    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id)

    if (!error) setRewards(prev => prev.filter(r => r.id !== id))
    return { error }
  }

  return { rewards, loading, addReward, deleteReward }
}
