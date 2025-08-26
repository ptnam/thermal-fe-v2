<script setup lang="ts">
defineProps<{
  modelValue: string | number | null | undefined
}>()
</script>

<template>
  <div
      class="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 min-h-[38px]"
  >
    {{ modelValue }}
  </div>
</template>
