import {initializeApp} from 'firebase/app'
import {
    getMessaging,
    getToken,
    onMessage,
    Messaging,
} from 'firebase/messaging'
import {saveFirebaseTokenApi} from '@/api/user'

// Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

// Declare messaging with safe fallback
let messaging: Messaging | null = null

try {
    // Initialize Firebase and Messaging
    const app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
} catch (error) {
    console.error('❌ Firebase initialization failed:', error)
}

/**
 * Request notification permission, get FCM token, and send to server
 */
export async function requestAndSendFcmToken(): Promise<void> {
    if (!messaging) {
        console.log('Firebase messaging is not initialized.')
        return
    }

    try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            console.log('Notification permission denied.')
            return
        }

        const token = await getToken(messaging, {vapidKey: VAPID_KEY})
        if (!token) {
            console.log('FCM token is null or empty.')
            return
        }

        await saveFirebaseTokenApi({
            deviceType: 'web',
            token: token,
        })
    } catch (error) {
        console.log('❌ Failed to get/send FCM token: ', error)
    }
}

/**
 * Set up foreground FCM message listener
 */
export function setupFcmListener(): void {
    if (!messaging) {
        console.warn('⚠️ Messaging not initialized. Cannot listen for FCM messages.')
        return
    }

  onMessage(messaging, async (payload) => {
    console.log('📨 Foreground FCM Message:', payload)

    const title = payload.notification?.title ?? 'Notification'
    const body = payload.notification?.body ?? ''
    const icon = '/favicon.ico'
    const clickUrl = payload.data?.url || '/'
    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('📭 Notification permission denied.')
          return
        }
      }
      const notification = new Notification(title, {
        body,
        icon,
        data: { url: clickUrl }
      })

      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        if (clickUrl) {
          window.location.href = clickUrl
        }
      }

    } catch (error) {
      console.error('❌ Error showing notification:', error)
    }
  })
}

export {messaging}
