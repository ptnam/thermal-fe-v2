<template>
  <div class="space-y-3">
    <input
      ref="fileInputRef"
      type="file"
      accept=".glb,model/gltf-binary"
      class="hidden"
      @change="handlePickFile"
    >

    <div class="flex flex-wrap items-center gap-2">
      <el-button type="primary" @click="openFilePicker">
        Chọn file GLB
      </el-button>

      <el-button
        v-if="canPreview"
        type="success"
        @click="previewVisible = true"
      >
        Show preview
      </el-button>

      <el-button
        v-if="localFile"
        type="danger"
        @click="clearLocalFile"
      >
        Xóa file
      </el-button>
    </div>

    <div class="text-sm text-gray-500 break-all">
      {{ displayPath }}
    </div>

    <el-dialog
      v-model="previewVisible"
      title="Preview GLB"
      width="90%"
      top="4vh"
      destroy-on-close
    >
      <div>
<!--        <div class="rounded-lg border border-gray-200 bg-white p-4">-->
<!--          <div class="mb-4">-->
<!--            <div class="mb-1 text-sm font-medium text-gray-700">GLB path</div>-->
<!--            <el-input v-model="form.src" readonly />-->
<!--          </div>-->

<!--          <div class="mb-2 text-sm font-semibold text-gray-800">Model Position</div>-->
<!--          <div class="grid grid-cols-3 gap-2 mb-4">-->
<!--            <el-input-number v-model="form.modelPosition.x" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.modelPosition.y" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.modelPosition.z" :step="0.1" class="!w-full" />-->
<!--          </div>-->

<!--          <div class="mb-2 text-sm font-semibold text-gray-800">Model Rotation</div>-->
<!--          <div class="grid grid-cols-3 gap-2 mb-4">-->
<!--            <el-input-number v-model="form.modelRotation.x" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.modelRotation.y" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.modelRotation.z" :step="0.1" class="!w-full" />-->
<!--          </div>-->

<!--          <div class="mb-2 text-sm font-semibold text-gray-800">Model Scale</div>-->
<!--          <div class="grid grid-cols-3 gap-2 mb-4">-->
<!--            <el-input-number v-model="form.modelScale.x" :step="0.1" :min="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.modelScale.y" :step="0.1" :min="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.modelScale.z" :step="0.1" :min="0.1" class="!w-full" />-->
<!--          </div>-->

<!--          <div class="mb-2 text-sm font-semibold text-gray-800">Camera Position</div>-->
<!--          <div class="grid grid-cols-3 gap-2 mb-4">-->
<!--            <el-input-number v-model="form.cameraPosition.x" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.cameraPosition.y" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.cameraPosition.z" :step="0.1" class="!w-full" />-->
<!--          </div>-->

<!--          <div class="mb-2 text-sm font-semibold text-gray-800">Camera Target</div>-->
<!--          <div class="grid grid-cols-3 gap-2 mb-4">-->
<!--            <el-input-number v-model="form.target.x" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.target.y" :step="0.1" class="!w-full" />-->
<!--            <el-input-number v-model="form.target.z" :step="0.1" class="!w-full" />-->
<!--          </div>-->

          <div class="flex flex-wrap gap-2 mb-4">
<!--            <el-button type="primary" @click="applyFromForm">Apply</el-button>-->
            <el-button type="success" @click="handleSavePreview">Lưu config</el-button>
            <el-button @click="resetForm">Reset</el-button>
            <el-button @click="reloadModel">Reload model</el-button>
          </div>

<!--          <div class="mt-4 text-sm text-gray-700">-->
<!--            <span class="font-semibold">Trạng thái:</span> {{ status }}-->
<!--          </div>-->

<!--          <pre class="mt-4 max-h-[260px] overflow-auto rounded-lg bg-gray-100 p-3 text-xs">{{ prettyCurrent }}</pre>-->
<!--        </div>-->

        <div class="min-w-0">
          <div
            ref="containerRef"
            class="h-[70vh] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type Vec3 = {
  x: number
  y: number
  z: number
}

type PreviewPayload = {
  filePath: string
  modelPosition: Vec3
  modelRotation: Vec3
  modelScale: Vec3
  cameraPosition: Vec3
  target: Vec3
}

const props = withDefaults(
  defineProps<{
    filePath?: string
    modelPosition?: Vec3
    modelRotation?: Vec3
    modelScale?: Vec3
    cameraPosition?: Vec3
    target?: Vec3
  }>(),
  {
    filePath: '',
    modelPosition: () => ({ x: 0, y: 0, z: 0 }),
    modelRotation: () => ({ x: 0, y: 0, z: 0 }),
    modelScale: () => ({ x: 1.5, y: 1.5, z: 1.5 }),
    cameraPosition: () => ({ x: 4, y: 3, z: 6 }),
    target: () => ({ x: 0, y: 0.8, z: 0 }),
  },
)

const emit = defineEmits<{
  (e: 'change-file', payload: { file: File | null; localUrl: string; fileName: string }): void
  (e: 'save-preview', payload: PreviewPayload): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewVisible = ref(false)
const localFile = ref<File | null>(null)
const localObjectUrl = ref('')

const form = reactive({
  src: '',
  modelPosition: { x: 0, y: 0, z: 0 },
  modelRotation: { x: 0, y: 0, z: 0 },
  modelScale: { x: 1.5, y: 1.5, z: 1.5 },
  cameraPosition: { x: 4, y: 3, z: 6 },
  target: { x: 0, y: 0.8, z: 0 },
})

const status = ref('đang khởi tạo')
const prettyCurrent = computed(() => JSON.stringify(form, null, 2))

const previewSrc = computed(() => {
  return localObjectUrl.value || props.filePath || ''
})

const canPreview = computed(() => Boolean(previewSrc.value))

const displayPath = computed(() => {
  if (localFile.value && localObjectUrl.value) {
    return `${localFile.value.name} (local)`
  }
  return props.filePath || 'Chưa có file GLB'
})

function syncFormFromProps() {
  form.src = previewSrc.value
  form.modelPosition = { ...props.modelPosition }
  form.modelRotation = { ...props.modelRotation }
  form.modelScale = { ...props.modelScale }
  form.cameraPosition = { ...props.cameraPosition }
  form.target = { ...props.target }
}

watch(
  () => [
    props.filePath,
    props.modelPosition,
    props.modelRotation,
    props.modelScale,
    props.cameraPosition,
    props.target,
  ],
  () => {
    if (!previewVisible.value) {
      syncFormFromProps()
    }
  },
  { deep: true, immediate: true },
)

function openFilePicker() {
  fileInputRef.value?.click()
}

function revokeLocalObjectUrl() {
  if (localObjectUrl.value) {
    URL.revokeObjectURL(localObjectUrl.value)
    localObjectUrl.value = ''
  }
}

function handlePickFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const isGlb = file.name.toLowerCase().endsWith('.glb')
  if (!isGlb) {
    ElMessage.error('Chỉ cho phép chọn file .glb')
    input.value = ''
    return
  }

  revokeLocalObjectUrl()

  localFile.value = file
  localObjectUrl.value = URL.createObjectURL(file)
  form.src = localObjectUrl.value

  emit('change-file', {
    file,
    localUrl: localObjectUrl.value,
    fileName: file.name,
  })

  ElMessage.success('Đã chọn file GLB')

  input.value = ''
}

function clearLocalFile() {
  localFile.value = null
  revokeLocalObjectUrl()
  form.src = props.filePath || ''

  emit('change-file', {
    file: null,
    localUrl: '',
    fileName: '',
  })
}

function handleSavePreview() {
  syncFormFromCurrentView()

  emit('save-preview', {
    filePath: previewSrc.value,
    modelPosition: { ...form.modelPosition },
    modelRotation: { ...form.modelRotation },
    modelScale: { ...form.modelScale },
    cameraPosition: { ...form.cameraPosition },
    target: { ...form.target },
  })

  previewVisible.value = false
}

function resetForm() {
  syncFormFromProps()
  applyTransformToModel()
  applyCameraAndTarget()
  status.value = 'đã reset form'
}

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let loader: GLTFLoader | null = null
let modelRoot: THREE.Object3D | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
const containerRef = ref<HTMLDivElement | null>(null)

function disposeModel() {
  if (!scene || !modelRoot) return

  scene.remove(modelRoot)
  modelRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()

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
  if (!scene || !loader || !src) return

  status.value = `đang tải ${src}`
  disposeModel()

  await new Promise<void>((resolve, reject) => {
    loader!.load(
      src,
      (gltf) => {
        modelRoot = gltf.scene
        scene!.add(modelRoot)
        applyTransformToModel()

        const isDefaultCamera =
          form.cameraPosition.x === 4 &&
          form.cameraPosition.y === 3 &&
          form.cameraPosition.z === 6

        if (isDefaultCamera) {
          fitCameraToObject(modelRoot)
        } else {
          applyCameraAndTarget()
        }

        status.value = 'đã tải model'
        resolve()
      },
      undefined,
      (error) => {
        console.error(error)
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

async function reloadModel() {
  if (!form.src) return
  await loadModel(form.src)
}

function handleResize() {
  if (!containerRef.value || !camera || !renderer) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight || 400

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

function stopRenderLoop() {
  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = 0
  }
}

async function initViewer() {
  if (!containerRef.value || scene) return

  const mountEl = containerRef.value

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f5f7fa')

  camera = new THREE.PerspectiveCamera(
    45,
    mountEl.clientWidth / (mountEl.clientHeight || 1),
    0.1,
    1000,
  )

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
  renderer.setSize(mountEl.clientWidth, mountEl.clientHeight || 400)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  mountEl.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.addEventListener('change', syncFormFromCurrentView)

  loader = new GLTFLoader()

  const ambient = new THREE.AmbientLight(0xffffff, 1.6)
  scene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 2.2)
  directional.position.set(8, 12, 10)
  scene.add(directional)

  applyCameraAndTarget()
  handleResize()
  startRenderLoop()

  resizeObserver = new ResizeObserver(() => handleResize())
  resizeObserver.observe(mountEl)

  if (form.src) {
    await loadModel(form.src)
  }
}

function destroyViewer() {
  resizeObserver?.disconnect()
  resizeObserver = null

  stopRenderLoop()

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

  camera = null
  scene = null
  loader = null
}

watch(previewVisible, async (open) => {
  if (open) {
    syncFormFromProps()
    await nextTick()
    await initViewer()
    await nextTick()

    if (form.src) {
      await loadModel(form.src)
    }
  } else {
    destroyViewer()
  }
})

onBeforeUnmount(() => {
  destroyViewer()
  revokeLocalObjectUrl()
})
</script>