<template>
  <ElIcon :size="props.size">
    <svg aria-hidden="true">
      <use :xlink:href="symbolId" :fill="color" />
    </svg>
  </ElIcon>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: "small"
  },
  prefix: {
    type: String,
    default: 'icon',
  },
  name: {
    type: [String],
    required: false,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>
