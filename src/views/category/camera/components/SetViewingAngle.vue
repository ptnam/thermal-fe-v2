<template>
  <div>
    <ControlButtonCamera :form-model="formModel">
      <div v-if="isEditing" class="mt-4 flex w-full justify-center">
        <web-r-t-c-player class="m-w-[500px]" :streamKey="formModel.id"/>
      </div>
    </ControlButtonCamera>
  </div>
</template>
<script setup lang="ts">
import ControlButtonCamera from "@/components/Button/ControlButtonCamera.vue";
import WebRTCPlayer from "@/components/Video/WebRTCPlayer.vue";

defineProps({
  formModel: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
  }
})
</script>
