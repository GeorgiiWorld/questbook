import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useQuests(userId) {
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setQuests(data || [])
        setLoading(false)
      })
  }, [userId])

  const addQuest = async (title, coins, description) => {
    const { data, error } = await supabase
      .from('quests')
      .insert({ user_id: userId, title, coins, description })
      .select()
      .single()

    if (!error) setQuests(prev => [data, ...prev])
    return { error }
  }

  const deleteQuest = async (id) => {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', id)

    if (!error) setQuests(prev => prev.filter(q => q.id !== id))
    return { error }
  }

  const updateQuest = async (id, updates) => {
    const { error } = await supabase
      .from('quests')
      .update(updates)
      .eq('id', id)

    if (!error) setQuests(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q))
    return { error }
  }

  return { quests, loading, addQuest, deleteQuest, updateQuest }
}
