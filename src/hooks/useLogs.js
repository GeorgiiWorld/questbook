import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLogs(userId) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLogs(data || [])
        setLoading(false)
      })
  }, [userId])

  const addLog = async (type, title, coins) => {
    const { data, error } = await supabase
      .from('logs')
      .insert({ user_id: userId, type, title, coins })
      .select()
      .single()

    if (!error) setLogs(prev => [data, ...prev])
    return { error }
  }

  return { logs, loading, addLog }
}
