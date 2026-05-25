import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useNotifications(userId, buddies = []) {
  const subscriptionRef = useRef(null)
  const pollingRef = useRef(null)
  const seenLogIds = useRef(new Set())
  const swRegistrationRef = useRef(null)

  useEffect(() => {
    if (!userId || buddies.length === 0) {
      console.log('[Notifications] Waiting for userId or buddies:', { userId, buddiesCount: buddies.length })
      return
    }

    const handleBuddyQuestCompletion = (log) => {
      if (!log) {
        console.warn('[Notifications] Received empty log')
        return
      }

      console.log('[Notifications] Processing log:', log)

      const buddy = buddies.find(b => b.id === log.user_id)
      if (!buddy) {
        console.warn('[Notifications] Buddy not found for user_id:', log.user_id)
        return
      }

      if (seenLogIds.current.has(log.id)) return
      seenLogIds.current.add(log.id)

      const title = `🎯 ${buddy.username} завершил квест!`
      const options = {
        body: `"${log.title}" — заработал ${log.coins} монет`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `buddy-quest-${log.id}`,
        data: {
          buddyId: log.user_id,
          buddyName: buddy.username
        },
        requireInteraction: false
      }

      if (Notification.permission === 'granted') {
        console.log('[Notifications] Showing notification:', title)
        
        // Переход 1: Попробуем через Service Worker (самый надежный способ)
        if (swRegistrationRef.current) {
          swRegistrationRef.current.showNotification(title, options)
            .then(() => {
              console.log('[Notifications] ✅ Notification shown via Service Worker')
            })
            .catch(err => {
              console.warn('[Notifications] Service Worker showNotification failed:', err)
              // Откат на прямое создание уведомления
              try {
                new Notification(title, options)
                console.log('[Notifications] ✅ Notification shown via Notification constructor')
              } catch (e) {
                console.error('[Notifications] Failed to show notification:', e)
              }
            })
        } else {
          // Если Service Worker еще не зарегистрирован, используем конструктор
          try {
            new Notification(title, options)
            console.log('[Notifications] ✅ Notification shown via Notification constructor (no SW yet)')
          } catch (e) {
            console.error('[Notifications] Failed to show notification:', e)
          }
        }
      } else {
        console.warn('[Notifications] Permission denied, cannot show notification')
      }
    }

    const fetchLatestBuddyLogs = async () => {
      const buddyIds = buddies.map(b => b.id)
      if (buddyIds.length === 0) return

      const { data, error } = await supabase
        .from('logs')
        .select('id,user_id,title,coins,type')
        .in('user_id', buddyIds)
        .eq('type', 'quest')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.warn('[Notifications] Polling read error:', error.message)
        return
      }

      const newLogs = (data || []).reverse()
      newLogs.forEach(log => {
        if (!seenLogIds.current.has(log.id)) {
          handleBuddyQuestCompletion(log)
        }
      })
    }

    const startPolling = () => {
      if (pollingRef.current) return
      console.log('[Notifications] Starting polling fallback')
      pollingRef.current = setInterval(fetchLatestBuddyLogs, 10000)
      fetchLatestBuddyLogs()
    }

    const initNotifications = async () => {
      console.log('[Notifications] Initializing with userId:', userId, 'buddies:', buddies)

      if (!('Notification' in window)) {
        console.log('[Notifications] Browser does not support notifications')
        return
      }

      if (Notification.permission === 'default') {
        console.log('[Notifications] Requesting permission')
        const permission = await Notification.requestPermission()
        console.log('[Notifications] Permission result:', permission)
        if (permission !== 'granted') return
      }

      if (Notification.permission !== 'granted') {
        console.log('[Notifications] Permission not granted:', Notification.permission)
        return
      }

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
          })
          swRegistrationRef.current = registration
          console.log('[Notifications] Service Worker registered:', registration)
        } catch (error) {
          console.error('[Notifications] Service Worker registration failed:', error)
        }
      }

      const buddyIds = buddies.map(b => b.id)
      console.log('[Notifications] BuddyIds for filter:', buddyIds)
      if (buddyIds.length === 0) {
        console.log('[Notifications] No buddy IDs, skipping subscription')
        return
      }

      const buddyIdsList = buddyIds.join(',')
      console.log('[Notifications] Buddy IDs list:', buddyIdsList)

      subscriptionRef.current = supabase
        .channel(`buddy-logs-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'logs',
          },
          (payload) => {
            console.log('[Notifications] Received payload:', payload)
            if (payload.new.type === 'quest' && buddyIds.includes(payload.new.user_id)) {
              handleBuddyQuestCompletion(payload.new)
            }
          }
        )
        .subscribe((status, err) => {
          console.log('[Notifications] Channel status:', status, 'error:', err)
          if (status === 'CHANNEL_ERROR') {
            console.error('[Notifications] Channel error - check Realtime is enabled on logs table in Supabase console')
            startPolling()
          } else if (status === 'SUBSCRIBED') {
            console.log('[Notifications] ✅ Successfully subscribed to logs table')
          } else if (status === 'TIMED_OUT') {
            console.error('[Notifications] ❌ TIMED_OUT - Make sure Realtime is enabled on logs table (Database → Replication)')
            startPolling()
          }
        })
    }

    initNotifications()

    // Cleanup при размонтировании
    return () => {
      if (subscriptionRef.current) {
        console.log('[Notifications] Unsubscribing')
        supabase.removeChannel(subscriptionRef.current)
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [userId, buddies])
}

