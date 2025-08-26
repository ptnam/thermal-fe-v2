# thermal

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
https://github.com/codivoire/node-media-server?tab=readme-ov-file
https://www.npmjs.com/package/node-media-server?activeTab=readme


Protocol | Player | URL
RTMP (Input) | FFmpeg, OBS | rtmp://localhost/live/cam01
HLS | hls.js | http://localhost:8000/live/cam01/index.m3u8
DASH | dash.js | http://localhost:8000/live/cam01/index.mpd
FLV | flv.js | http://localhost:8000/live/cam01.flv
WebRTC | WebRTC API | POST http://localhost:8000/webrtc/stream/live/cam01