importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: "AIzaSyCpSKtb_-oJMhcF0z1M2AnSrRVnXGV5_1k",
    authDomain: "therma-92d11.firebaseapp.com",
    projectId: "therma-92d11",
    storageBucket: "therma-92d11.firebasestorage.app",
    messagingSenderId: "842499541723",
    appId: "1:842499541723:web:4be1fa87321676eb179afe"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title ?? 'New message'
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/favicon.ico',
        data: {
          url: payload.data?.url || '/'
        }
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
    })
  )
})