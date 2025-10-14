importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDQ468DVxk3199-gAbdxQUCJtisJoFuoCs',
  authDomain: 'thermal-b13b9.firebaseapp.com',
  projectId: 'thermal-b13b9',
  storageBucket: 'thermal-b13b9.firebasestorage.app',
  messagingSenderId: '524070383945',
  appId: '1:524070383945:web:ea9e08fefdc1c1228eea98',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title ?? 'New message'
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: payload.data?.url || '/',
    },
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // If app is already open at that URL, focus it
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    }),
  )
})
