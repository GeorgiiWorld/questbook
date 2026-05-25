import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBuddies(userId) {
  const [buddies, setBuddies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBuddies = async () => {
    if (!userId) return

    const { data } = await supabase
      .from('buddies')
      .select(`
        id,
        user_id,
        buddy_id,
        user:profiles!buddies_user_id_fkey(id, username, coins),
        buddy:profiles!buddies_buddy_id_fkey(id, username, coins)
      `)
      .or(`user_id.eq.${userId},buddy_id.eq.${userId}`)

    if (data) {
      const list = data.map(b => 
        b.user_id === userId ? b.buddy : b.user
      )
      // Дедупликация по ID чтобы один buddy не появился дважды
      const uniqueBuddies = Array.from(
        new Map(list.map(buddy => [buddy.id, buddy])).values()
      )
      setBuddies(uniqueBuddies)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBuddies()
  }, [userId])

  const addBuddy = async (inviteCode) => {
    const { data: buddyProfile, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()

    if (findError || !buddyProfile) return { error: 'Пользователь не найден' }
    if (buddyProfile.id === userId) return { error: 'Нельзя добавить себя' }

    const { error } = await supabase
      .from('buddies')
      .insert({ user_id: userId, buddy_id: buddyProfile.id })

    if (error) return { error: 'Уже добавлен или ошибка' }

    await fetchBuddies()
    return { error: null }
  }

  return { buddies, loading, addBuddy }
}
