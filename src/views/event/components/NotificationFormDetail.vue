<template>
  <el-form
    ref="refForm"
    label-position="left"
    :model="formModelValue"
    :validate-on-rule-change="false"
    label-width="auto"
    style="min-width: 600px"
  >
    <el-form-item label="Thời gian">
      <view-input :contain="formModelValue?.formattedDate" :disabled="true" />
    </el-form-item>
    <el-form-item label="Khu vực">
      <view-input :contain="formModelValue?.areaName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Thiết bị">
      <view-input :contain="formModelValue?.machineName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Bộ phận">
      <view-input :contain="formModelValue?.machineComponentName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Điểm giám sát">
      <view-input :contain="formModelValue?.monitorPointCode" :disabled="true" />
    </el-form-item>
    <el-form-item label="Nhiệt độ">
      <view-input :contain="formModelValue?.componentValue" :disabled="true" />
    </el-form-item>
    <el-form-item label="Loại">
      <view-input :contain="formModelValue?.compareTypeObject?.name" :disabled="true" />
    </el-form-item>
    <el-form-item label="Giá trị so sánh">
      <view-input :contain="formModelValue?.compareValue" :disabled="true" />
    </el-form-item>
    <el-form-item label="Lệch">
      <view-input :contain="formModelValue?.deltaValue" :disabled="true" />
    </el-form-item>
    <el-form-item label="Đánh giá">
      <view-input :contain="formModelValue?.compareResultObject?.name" :disabled="true" />
    </el-form-item>
    <el-form-item label="Trạng thái">
      <view-input :contain="formModelValue?.statusObject?.name" :disabled="true" />
    </el-form-item>
    <el-form-item label="Cảnh báo">
      <view-input :contain="formModelValue?.warningEventName" :disabled="true" />
    </el-form-item>
    <el-form-item label="Hình ảnh">
      <el-image
        :src="formModelValue.imagePath"
        :lazy="true"
        fit="cover"
        :preview-src-list="[formModelValue.imagePath]"
        :show-progress="true"
        :preview-teleported="true"
      />
    </el-form-item>
    <el-form-item label=" " v-show="formModelValue && formModelValue.id">
      <ElButton :type="typeStatus[formModelValue?.statusObject?.code]" @click="changeStatus">
        Cập nhật trạng thái
      </ElButton>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { ElButton, ElImage } from 'element-plus'
import { useConfirmModal } from '@/hooks/web/useModal'
import { notificationDetailApi, updateNotificationStatusApi } from '@/api/notification'
import ViewInput from '@/components/Input/ViewInput.vue'
import { ref, watch } from 'vue'

const typeStatus = {
  Resolved: 'success',
  Pending: 'danger',
}
const formModelValue = ref<any>({
  id: null,
  compareResultObject: {},
  compareTypeObject: {},
  statusObject: {},
})

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})
watch(
  () => props.formModel,
  (newVal) => {
    formModelValue.value = newVal
  },
  { immediate: true },
)

const { confirmModal } = useConfirmModal()
const emits = defineEmits(['updateStatus'])
const changeStatus = () => {
  confirmModal('Cập nhật trạng thái', 'Bạn có chắc muốn cập nhật trạng thái đã xử lý?', () => {
    updateNotificationStatusApi(formModelValue.value.id, {
      status: formModelValue.value.statusObject.code === 'Pending' ? 2 : 1,
      dataTime: formModelValue.value.dataTime,
    }).then(() => {
      notificationDetailApi({
        id: formModelValue.value.id,
        dataTime: formModelValue.value.dataTime,
      }).then((res) => {
        formModelValue.value = res.data
      })
      emits('updateStatus')
    })
  })
}
</script>