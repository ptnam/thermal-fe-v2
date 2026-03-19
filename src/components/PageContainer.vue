<template>
  <slot></slot>
</template>
<script setup lang="ts">

defineProps({
  title: {
    type: String,
    required: false,
  },
})
</script>
