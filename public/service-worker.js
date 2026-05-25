// Service Worker для обработки Web Push уведомлений
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const options = {
      body: payload.body || '',
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'buddy-quest-notification',
      data: payload.data || {},
      requireInteraction: false
    }

    event.waitUntil(
      self.registration.showNotification(payload.title || 'QuestBook', options)
    )
  } catch (e) {
    console.error('Push notification error:', e)
  }
})

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const buddyId = event.notification.data?.buddyId

  if (buddyId) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Ищем уже открытое окно приложения
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Открыть окно и добавить параметр для навигации
            client.focus()
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              buddyId: buddyId
            })
            return client
          }
        }
        // Если окна нет, открыть новое
        if (clients.openWindow) {
          return clients.openWindow(`/${buddyId}`)
        }
      })
    )
  }
})
