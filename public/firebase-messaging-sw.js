importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDfi7YzNJC70UwnxGPqSsMmCu6KcTKmMHE",
  authDomain: "thermalmonitoring-eab3d.firebaseapp.com",
  projectId: "thermalmonitoring-eab3d",
  storageBucket: "thermalmonitoring-eab3d.firebasestorage.app",
  messagingSenderId: "823669812203",
  appId: "1:823669812203:web:057216cf04229ab23f87ae",
  measurementId: "G-JTLV00XQJ0"
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
