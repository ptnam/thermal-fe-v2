<template>
  <page-container title="Chi tiết nội dung cảnh báo" class="flex justify-center p-6">
    <notification-form-detail
        :form-model="formModel"
        v-loading="isLoading"
        @update-status="loadNotice"
        class="p-6"
    />
  </page-container>
</template>
<script setup lang="ts">
import PageContainer from "@/components/PageContainer.vue";
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
  })
}
onMounted(() => {
  loadNotice()
})
watch(() => route.fullPath, () => {
  loadNotice()
}, {deep: true});

</script>