<template>
  <div class="glb-editor">
    <div class="sidebar">
      <h3>GLB Viewer</h3>

      <div class="field">
        <label>GLB path</label>
        <input v-model="form.src" placeholder="/Duck.glb" />
      </div>

      <div class="section-title">Model Position</div>
      <div class="grid3">
        <div class="field">
          <label>X</label>
          <input v-model.number="form.modelPosition.x" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Y</label>
          <input v-model.number="form.modelPosition.y" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Z</label>
          <input v-model.number="form.modelPosition.z" type="number" step="0.1" />
        </div>
      </div>

      <div class="section-title">Model Rotation</div>
      <div class="grid3">
        <div class="field">
          <label>X</label>
          <input v-model.number="form.modelRotation.x" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Y</label>
          <input v-model.number="form.modelRotation.y" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Z</label>
          <input v-model.number="form.modelRotation.z" type="number" step="0.1" />
        </div>
      </div>

      <div class="section-title">Model Scale</div>
      <div class="grid3">
        <div class="field">
          <label>X</label>
          <input v-model.number="form.modelScale.x" type="number" step="0.1" min="0.1" />
        </div>
        <div class="field">
          <label>Y</label>
          <input v-model.number="form.modelScale.y" type="number" step="0.1" min="0.1" />
        </div>
        <div class="field">
          <label>Z</label>
          <input v-model.number="form.modelScale.z" type="number" step="0.1" min="0.1" />
        </div>
      </div>

      <div class="section-title">Camera Position</div>
      <div class="grid3">
        <div class="field">
          <label>X</label>
          <input v-model.number="form.cameraPosition.x" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Y</label>
          <input v-model.number="form.cameraPosition.y" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Z</label>
          <input v-model.number="form.cameraPosition.z" type="number" step="0.1" />
        </div>
      </div>

      <div class="section-title">Camera Target</div>
      <div class="grid3">
        <div class="field">
          <label>X</label>
          <input v-model.number="form.target.x" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Y</label>
          <input v-model.number="form.target.y" type="number" step="0.1" />
        </div>
        <div class="field">
          <label>Z</label>
          <input v-model.number="form.target.z" type="number" step="0.1" />
        </div>
      </div>

      <div class="actions">
        <button @click="applyFromForm">Apply</button>
        <button @click="captureCurrentView">Lấy góc hiện tại</button>
        <button @click="saveCurrentPreset">OK</button>
        <button @click="resetPreset">Reset</button>
      </div>

      <div class="status">
        <div><strong>Trạng thái:</strong> {{ status }}</div>
      </div>

      <pre class="preview">{{ prettyCurrent }}</pre>
    </div>

    <div class="viewer-wrap">
      <div ref="containerRef" class="viewer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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
    src?: string
    height?: number
    background?: string
  }>(),
  {
    src: '/Duck.glb',
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
    target: { x: 0, y: 0.8, z: 0 },
  }
}

function clonePreset(v: ViewerPreset): ViewerPreset {
  return JSON.parse(JSON.stringify(v)) as ViewerPreset
}

const containerRef = ref<HTMLDivElement | null>(null)
const status = ref('đang khởi tạo')
const form = reactive<ViewerPreset>(defaultPreset())

const prettyCurrent = computed(() => JSON.stringify(form, null, 2))

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let loader: GLTFLoader | null = null
let modelRoot: THREE.Object3D | null = null
let frameId = 0

function loadSavedPreset(): ViewerPreset {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultPreset()

  try {
    const parsed = JSON.parse(raw) as ViewerPreset
    return {
      ...defaultPreset(),
      ...parsed,
    }
  } catch {
    return defaultPreset()
  }
}

function savePreset(preset: ViewerPreset) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preset))
}

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

function applyTransformToModel() {
  if (!modelRoot) return

  modelRoot.position.set(
    form.modelPosition.x,
    form.modelPosition.y,
    form.modelPosition.z,
  )

  modelRoot.rotation.set(
    form.modelRotation.x,
    form.modelRotation.y,
    form.modelRotation.z,
  )

  modelRoot.scale.set(
    form.modelScale.x,
    form.modelScale.y,
    form.modelScale.z,
  )
}

function applyCameraAndTarget() {
  if (!camera || !controls) return

  camera.position.set(
    form.cameraPosition.x,
    form.cameraPosition.y,
    form.cameraPosition.z,
  )

  controls.target.set(
    form.target.x,
    form.target.y,
    form.target.z,
  )

  controls.update()
}

function syncFormFromCurrentView() {
  if (!camera || !controls) return

  form.cameraPosition.x = Number(camera.position.x.toFixed(4))
  form.cameraPosition.y = Number(camera.position.y.toFixed(4))
  form.cameraPosition.z = Number(camera.position.z.toFixed(4))

  form.target.x = Number(controls.target.x.toFixed(4))
  form.target.y = Number(controls.target.y.toFixed(4))
  form.target.z = Number(controls.target.z.toFixed(4))

  if (modelRoot) {
    form.modelPosition.x = Number(modelRoot.position.x.toFixed(4))
    form.modelPosition.y = Number(modelRoot.position.y.toFixed(4))
    form.modelPosition.z = Number(modelRoot.position.z.toFixed(4))

    form.modelRotation.x = Number(modelRoot.rotation.x.toFixed(4))
    form.modelRotation.y = Number(modelRoot.rotation.y.toFixed(4))
    form.modelRotation.z = Number(modelRoot.rotation.z.toFixed(4))

    form.modelScale.x = Number(modelRoot.scale.x.toFixed(4))
    form.modelScale.y = Number(modelRoot.scale.y.toFixed(4))
    form.modelScale.z = Number(modelRoot.scale.z.toFixed(4))
  }
}

function fitCameraToObject(object: THREE.Object3D) {
  if (!camera || !controls) return

  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const fov = camera.fov * (Math.PI / 180)
  const distance = maxDim / (2 * Math.tan(fov / 2))

  camera.position.set(
    center.x + distance * 1.2,
    center.y + distance * 0.8,
    center.z + distance * 1.2,
  )

  controls.target.copy(center)
  controls.update()

  syncFormFromCurrentView()
}

async function loadModel(src: string) {
  if (!scene || !loader) return

  status.value = `đang tải ${src}`

  disposeModel()

  await new Promise<void>((resolve, reject) => {
    loader!.load(
      src,
      (gltf) => {
        modelRoot = gltf.scene
        scene!.add(modelRoot!)
        applyTransformToModel()

        if (
          form.cameraPosition.x === 4 &&
          form.cameraPosition.y === 3 &&
          form.cameraPosition.z === 6
        ) {
          fitCameraToObject(modelRoot!)
        } else {
          applyCameraAndTarget()
        }

        status.value = 'đã tải model'
        resolve()
      },
      undefined,
      (error) => {
        status.value = 'lỗi tải model'
        reject(error)
      },
    )
  })
}

function applyFromForm() {
  applyTransformToModel()
  applyCameraAndTarget()
  status.value = 'đã áp dụng cấu hình từ form'
}

function captureCurrentView() {
  syncFormFromCurrentView()
  status.value = 'đã lấy góc nhìn hiện tại vào form'
}

function saveCurrentPreset() {
  syncFormFromCurrentView()
  savePreset(clonePreset(form))
  status.value = 'đã lưu preset'
}

async function resetPreset() {
  const preset = defaultPreset()
  Object.assign(form, preset)
  savePreset(clonePreset(preset))

  if (props.src !== preset.src) {
    form.src = props.src
  }

  if (modelRoot) {
    applyTransformToModel()
  }
  applyCameraAndTarget()

  if (form.src) {
    await loadModel(form.src)
  }

  status.value = 'đã reset preset'
}

function handleResize() {
  if (!containerRef.value || !camera || !renderer) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

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

onMounted(async () => {
  const mountEl = containerRef.value
  if (!mountEl) return

  const saved = loadSavedPreset()
  Object.assign(form, saved)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.background)

  camera = new THREE.PerspectiveCamera(
    45,
    mountEl.clientWidth / mountEl.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(
    form.cameraPosition.x,
    form.cameraPosition.y,
    form.cameraPosition.z,
  )

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(mountEl.clientWidth, mountEl.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  mountEl.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(form.target.x, form.target.y, form.target.z)
  controls.update()

  controls.addEventListener('change', () => {
    syncFormFromCurrentView()
  })

  loader = new GLTFLoader()

  const ambient = new THREE.AmbientLight(0xffffff, 1.6)
  scene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 2.2)
  directional.position.set(8, 12, 10)
  scene.add(directional)

  const grid = new THREE.GridHelper(20, 20)
  scene.add(grid)

  const axes = new THREE.AxesHelper(3)
  scene.add(axes)

  await loadModel(form.src)
  startRenderLoop()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  if (controls) {
    controls.dispose()
    controls = null
  }

  disposeModel()

  if (renderer) {
    renderer.dispose()
    const canvas = renderer.domElement
    canvas.parentNode?.removeChild(canvas)
    renderer = null
  }

  if (frameId) {
    cancelAnimationFrame(frameId)
  }

  camera = null
  scene = null
  loader = null
})
</script>

<style scoped>
.glb-editor {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  align-items: start;
}

.sidebar {
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background: #fff;
  box-sizing: border-box;
}

.viewer-wrap {
  min-width: 0;
}

.viewer {
  width: 100%;
  height: 680px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f7fa;
}

.section-title {
  margin-top: 14px;
  margin-bottom: 8px;
  font-weight: 600;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.field input {
  padding: 8px 10px;
  border: 1px solid #cfd3dc;
  border-radius: 6px;
  box-sizing: border-box;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.actions button {
  padding: 8px 12px;
  border: 1px solid #cfd3dc;
  border-radius: 6px;
  background: #f7f8fa;
  cursor: pointer;
}

.status {
  margin-top: 12px;
}

.preview {
  margin-top: 12px;
  max-height: 260px;
  overflow: auto;
  padding: 10px;
  border-radius: 8px;
  background: #f7f8fa;
  font-size: 12px;
}
</style>