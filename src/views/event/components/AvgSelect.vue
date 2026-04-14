<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type AvgType = '1' | '2' | '3'

const props = defineProps<{
  modelValue: AvgType
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const root = ref<HTMLElement>()

const options = [
  {
    value: '1',
    label: 'MAX',
    title: 'Nhiệt độ Max',
    desc: 'Giá trị cao nhất trong khoảng thời gian',
    class: 'box-max'
  },
  {
    value: '2',
    label: 'MIN',
    title: 'Nhiệt độ Min',
    desc: 'Giá trị thấp nhất trong khoảng thời gian',
    class: 'box-min'
  },
  {
    value: '3',
    label: 'AVG',
    title: 'Trung bình',
    desc: 'Giá trị trung bình trong khoảng thời gian',
    class: 'box-avg'
  }
]

const selected = computed(() =>
    options.find(o => o.value === props.modelValue)
)

function toggle() {
  open.value = !open.value
}

function select(opt: typeof options[number]) {
  emit('update:modelValue', opt.value as AvgType)
  emit('change', opt.value as AvgType)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="root" class="relative inline-block">

    <!-- button -->
    <div class="filter-badge-simple cursor-pointer flex items-center"
         @click="toggle">

      <span class="avg-tag" :class="selected?.class">
        {{ selected?.label }}
      </span>

      <span class="avg-text text-[15px] font-bold">
        {{ selected?.title }}
      </span>

      <svg width="14" height="14" viewBox="0 0 24 24"
           fill="none" stroke="currentColor"
           stroke-width="2.5"
           class="ml-[15px]">

        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>

    <!-- dropdown -->
    <div v-show="open" class="avg-menu absolute">

      <div
          v-for="opt in options"
          :key="opt.value"
          class="avg-item"
          :class="{ active: opt.value === modelValue }"
          @click="select(opt)"
      >

        <div class="avg-icon-box" :class="opt.class">
          {{ opt.value }}
        </div>

        <div class="avg-info">
          <h4>{{ opt.title }}</h4>
          <p>{{ opt.desc }}</p>
        </div>

        <div class="avg-check" v-if="opt.value === modelValue">
          <svg width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="#3b82f6"
               stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

      </div>

    </div>
  </div>
</template>
<style scoped>

.avg-dropdown {
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  gap: 8px;
  height: 34px;
}

.avg-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: 4px;
}

.avg-select {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  padding-right: 4px;
}

.filter-badge-simple {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
  cursor: pointer;
  height: 34px;
  font-weight: 600;
}

.badge-count {
  background: #3B82F6;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

/* AVG Menu Styles */
.avg-dropdown {
  position: relative;
}

.avg-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--bg-body);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden;
}

.avg-menu.show {
  display: block;
}

.avg-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}

.avg-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.avg-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.avg-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.box-max {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.box-min {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.box-avg {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.avg-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
}

.avg-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.4;
}

.avg-check {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

.avg-item.active .avg-check {
  display: block;
}

</style>