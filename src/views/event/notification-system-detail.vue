<template>
  <div class="p-6">
    <notification-form-detail
        :form-model="formModel"
        standalone
        v-loading="isLoading"
        @update-status="loadNotice"
    />
  </div>
</template>
<script setup lang="ts">
import useRequest from "@/hooks/web/useRequest";
import {onMounted, ref, watch} from "vue";
import {notificationDetailApi} from "@/api/notification";
import {useRoute} from "vue-router";
import NotificationFormDetail from "@/views/event/components/NotificationFormDetail.vue";


const formModel = ref<any>({})
const {onRequest, isLoading} = useRequest();

const route = useRoute()
const loadNotice = () => {
  onRequest(notificationDetailApi, route.query).then(res => {
    formModel.value = res.data
  }).catch(() => {
    formModel.value = null
  })
}
onMounted(() => {
  loadNotice()
})
watch(() => route.fullPath, () => {
  loadNotice()
}, {deep: true});

</script>