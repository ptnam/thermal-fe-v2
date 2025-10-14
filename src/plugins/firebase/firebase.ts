import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging'
import { saveFirebaseTokenApi } from '@/api/user'

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

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
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

export async function getFirebaseToken() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.log('Notification permission denied.')
    return
  }
  return await getToken(<Messaging>messaging, { vapidKey: VAPID_KEY })
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
    await playNotificationChime()
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
        data: { url: clickUrl },
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
// ======================
// 🔔 Sound helpers (Web)
// ======================
const AUDIO_URL = '/sounds/notify.mp3'
const SOUND_FLAG_KEY = 'soundEnabled'

let audioEl: HTMLAudioElement | null = null

export function isNotificationGranted(): boolean {
  return Notification.permission === 'granted'
}
function prepareAudioElement() {
  if (!audioEl) {
    audioEl = document.createElement('audio')
    audioEl.src = AUDIO_URL
    audioEl.preload = 'auto'
    audioEl.setAttribute('playsinline', 'true')
    document.body.appendChild(audioEl)
  }
}

/** Gọi hàm này trong 1 sự kiện user gesture (click) để bật âm báo */
export async function enableNotificationSound(): Promise<boolean> {
  try {
    // xin quyền thông báo (nếu chưa)
    if (Notification.permission !== 'granted') {
      const res = await Notification.requestPermission()
      if (res !== 'granted') {
        console.warn('User denied notifications permission.')
        return false
      }
    }

    prepareAudioElement()

    // “unlock” autoplay: play -> pause ngay
    await audioEl!.play()
    audioEl!.pause()
    audioEl!.currentTime = 0

    localStorage.setItem(SOUND_FLAG_KEY, '1')
    return true
  } catch (e) {
    console.warn('Enable sound failed (autoplay blocked?):', e)
    return false
  }
}

export function disableNotificationSound() {
  localStorage.removeItem(SOUND_FLAG_KEY)
}

export function isNotificationSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_FLAG_KEY) === '1'
}

/** Phát âm mp3; nếu thất bại thì fallback bằng WebAudio “ding” ngắn */
export async function playNotificationChime() {
  if (!isNotificationSoundEnabled()) return
  prepareAudioElement()
  try {
    audioEl!.currentTime = 0
    await audioEl!.play()
  } catch (e) {
    console.warn('Play mp3 failed, using WebAudio fallback...', e)
    await playToneFallback()
  }
}

async function playToneFallback() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880 // A5
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    osc.stop(ctx.currentTime + 0.27)
  } catch (e) {
    console.warn('WebAudio fallback failed:', e)
  }
}

export { messaging }
