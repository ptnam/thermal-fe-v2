<template>
  <div class="glb-editor">
    <div class="viewer-wrap">
      <div ref="containerRef" class="viewer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type Vec3 = {
  x: number
  y: number
  z: number
}

type ViewerPreset = {
  src: string
  modelPosition: Vec3
  modelRotation: Vec3
  modelScale: Vec3
  cameraPosition: Vec3
  target: Vec3
}

const STORAGE_KEY = 'three-glb-best-view-preset'

const props = withDefaults(
    defineProps<{
      src: string
      height?: number
      background?: string
      emapPosition?: any
    }>(),
    {
      height: 680,
      background: '#f5f7fa',
    },
)

function defaultPreset(): ViewerPreset {
  return {
    src: props.src,
    modelPosition: { x: 0, y: 0, z: 0 },
    modelRotation: { x: 0, y: 0, z: 0 },
    modelScale: { x: 1.5, y: 1.5, z: 1.5 },
    cameraPosition: { x: 4, y: 3, z: 6 },
    target: { x: 0, y: 0, z: 0 },
    ...props.emapPosition
  }
}

function clonePreset(v: ViewerPreset): ViewerPreset {
  return JSON.parse(JSON.stringify(v))
}

const containerRef = ref<HTMLDivElement | null>(null)
const form = reactive<ViewerPreset>(defaultPreset())

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let loader: GLTFLoader | null = null
let modelRoot: THREE.Object3D | null = null
let frameId = 0

/* ===============================
   FIX 1 — CENTER MODEL
=============================== */

function centerModel(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())

  object.position.x -= center.x
  object.position.y -= center.y
  object.position.z -= center.z
}

/* ===============================
   FIX 2 — FIT CAMERA
=============================== */

function fitCameraToObject(object: THREE.Object3D) {
  if (!camera || !controls) return

  const box = new THREE.Box3().setFromObject(object)

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z)

  const fov = camera.fov * (Math.PI / 180)

  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))

  cameraZ *= 1.5

  camera.position.set(
      center.x,
      center.y,
      center.z + cameraZ
  )

  controls.target.copy(center)
  controls.update()
}

/* ===============================
   MODEL LOAD
=============================== */

function disposeModel() {
  if (!scene || !modelRoot) return

  scene.remove(modelRoot)

  modelRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh

    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const material = mesh.material

    if (Array.isArray(material)) {
      material.forEach((m) => m.dispose?.())
    } else {
      material?.dispose?.()
    }
  })

  modelRoot = null
}

async function loadModel(src: string) {
  if (!scene || !loader) return

  disposeModel()

  await new Promise<void>((resolve, reject) => {

    loader!.load(
        src,

        (gltf) => {

          modelRoot = gltf.scene

          /* =========================
             CENTER MODEL
          ========================= */

          centerModel(modelRoot)

          scene!.add(modelRoot)

          /* =========================
             FIT CAMERA
          ========================= */

          fitCameraToObject(modelRoot)

          resolve()
        },

        undefined,

        reject
    )

  })
}

/* ===============================
   RENDER LOOP
=============================== */

function startRenderLoop() {

  const tick = () => {

    frameId = requestAnimationFrame(tick)

    controls?.update()

    if (renderer && scene && camera) {

      renderer.render(scene, camera)

    }

  }

  tick()
}

/* ===============================
   RESIZE
=============================== */

function handleResize() {

  if (!containerRef.value || !camera || !renderer) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height

  camera.updateProjectionMatrix()

  renderer.setSize(width, height)

}

/* ===============================
   INIT
=============================== */

onMounted(async () => {

  const mountEl = containerRef.value
  if (!mountEl) return

  scene = new THREE.Scene()

  scene.background = new THREE.Color(props.background)

  camera = new THREE.PerspectiveCamera(
      45,
      mountEl.clientWidth / mountEl.clientHeight,
      0.1,
      1000,
  )

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })

  renderer.setSize(
      mountEl.clientWidth,
      mountEl.clientHeight
  )

  mountEl.appendChild(renderer.domElement)

  controls = new OrbitControls(
      camera,
      renderer.domElement
  )

  controls.enableDamping = true

  loader = new GLTFLoader()

  /* ===============================
     LIGHT
  =============================== */

  const ambient = new THREE.AmbientLight(0xffffff, 1.6)
  scene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 2.2)

  directional.position.set(8, 12, 10)

  scene.add(directional)

  /* ===============================
     LOAD MODEL
  =============================== */

  await loadModel(props.src)

  startRenderLoop()

  window.addEventListener('resize', handleResize)

})

/* ===============================
   CLEANUP
=============================== */

onBeforeUnmount(() => {

  window.removeEventListener('resize', handleResize)

  controls?.dispose()

  disposeModel()

  if (renderer) {

    renderer.dispose()

    const canvas = renderer.domElement

    canvas.parentNode?.removeChild(canvas)

  }

  if (frameId) {

    cancelAnimationFrame(frameId)

  }

})
</script>

<style scoped>
.viewer {
  width: 100%;
  height: 680px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f7fa;
}
</style>