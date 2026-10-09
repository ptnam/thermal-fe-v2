import assert from 'node:assert/strict'
import { test } from 'node:test'

globalThis.HTMLElement = class extends EventTarget {
  isConnected = true
}
globalThis.CustomEvent = class extends Event {
  constructor(type, options) {
    super(type)
    this.detail = options.detail
  }
}
const sockets = []
globalThis.WebSocket = class extends EventTarget {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 3
  constructor(url) {
    super()
    this.url = url
    sockets.push(this)
  }
  close() {}
}

const { VideoRTC } = await import('../src/plugins/webRTC/video-rtc.js')
const tick = () => new Promise((resolve) => setImmediate(resolve))
const player = () => {
  const value = new VideoRTC()
  value.wsURL = 'wss://example.test/api/CameraStreams/ws'
  value.video = { src: '', srcObject: null }
  return value
}
const cleanup = (value) => {
  clearTimeout(value.reconnectTID)
  value.ondisconnect()
}

test('requests one fresh ticket per connection, including reconnects', async () => {
  const value = player()
  let requests = 0
  value.getWebSocketUrl = async () => `${value.wsURL.split('?')[0]}?ticket=${++requests}`
  try {
    assert.equal(value.onconnect(), true)
    assert.equal(value.onconnect(), false)
    await tick()
    assert.equal(requests, 1)
    assert.match(value.ws.url, /ticket=1$/)
    value.onclose()
    clearTimeout(value.reconnectTID)
    value.onconnect()
    await tick()
    assert.equal(requests, 2)
    assert.match(value.ws.url, /ticket=2$/)
  } finally {
    cleanup(value)
  }
})

test('a pending ticket cannot create a socket after disconnect', async () => {
  const value = player()
  let resolve
  value.getWebSocketUrl = () => new Promise((done) => { resolve = done })
  value.onconnect()
  await tick()
  const count = sockets.length
  value.isConnected = false
  value.ondisconnect()
  resolve('wss://example.test/?ticket=late')
  await tick()
  assert.equal(sockets.length, count)
  assert.equal(value.ws, null)
  assert.equal(value.connectionPending, false)
})

test('ticket failure emits an error and leaves the player able to retry', async () => {
  const value = player()
  let error
  value.addEventListener('stream-error', (event) => { error = event.detail })
  value.getWebSocketUrl = async () => { throw new Error('Forbidden') }
  try {
    value.onconnect()
    await tick()
    assert.equal(error, 'authorization')
    assert.equal(value.connectionPending, false)
    assert.equal(value.ws, null)
    clearTimeout(value.reconnectTID)
    value.getWebSocketUrl = async () => 'wss://example.test/?ticket=fresh'
    value.onconnect()
    await tick()
    assert.match(value.ws.url, /ticket=fresh$/)
  } finally {
    cleanup(value)
  }
})

test('development direct WebSocket mode still connects without a ticket', () => {
  const value = player()
  try {
    assert.equal(value.onconnect(), true)
    assert.equal(value.ws.url, value.wsURL)
  } finally {
    cleanup(value)
  }
})
