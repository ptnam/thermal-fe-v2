<template>
  <vision-detail-form
      :form-model="formModel"
      title="Chi tiết nội dung cảnh báo"
      v-loading="isLoading"
  ></vision-detail-form>
</template>
<script setup lang="ts">
import useRequest from '@/hooks/web/useRequest'
import {onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import VisionDetailForm from '@/views/event/vision-event-history/VisionDetailForm.vue'
import {getVisionNotificationDetailApi} from '@/api/notification/visionNotification'

const formModel = ref<any>({})
const {onRequest, isLoading} = useRequest()

const route = useRoute()
const loadNotice = () => {
  onRequest(getVisionNotificationDetailApi, route.query).then((res) => {
    formModel.value = res.data
  })
}
onMounted(() => {
  loadNotice()
})
watch(
    () => route.fullPath,
    () => {
      loadNotice()
    },
    {deep: true},
)
</script>
