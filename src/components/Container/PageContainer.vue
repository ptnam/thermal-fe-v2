<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: false,
  },
});
</script>
<template>
  <div class="m-2 h-full">
    <slot></slot>
  </div>
</template>
