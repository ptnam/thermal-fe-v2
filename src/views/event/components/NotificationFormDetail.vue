<template>
  <div class="drawer drawer-xl">
    <div class="drawer-header">
      <h3>CHI TIẾT BẢN TIN CẢNH BÁO</h3>
    </div>
    <div class="drawer-body">
      <div class="detail-grid">
        <!-- Left Column: Images -->
        <div class="alert-image-container">
          <div class="info-label" style="margin-bottom: 15px; font-size: 14px; color: var(--primary);">
            HÌNH ẢNH NHIỆT THỰC TẾ</div>
          <img :src="formModelValue.imagePath" alt="Thermal Image">
          <div style="margin-top: 20px;">
            <div class="info-label" style="margin-bottom: 10px;">Ghi chú cảnh báo</div>
            <div class="info-value" style="height: 100px; align-items: flex-start; padding-top: 12px;">
              <el-input type="textarea" v-model="formModelValue.note"></el-input>
            </div>
          </div>
        </div>

        <!-- Right Column: Fields -->
        <div class="alert-info-container">
          <div class="info-label" style="margin-bottom: 5px; font-size: 14px; color: var(--primary);">
            THÔNG TIN CHI TIẾT</div>

          <div class="info-row">
            <div class="info-field">
              <div class="info-label">Thời gian</div>
              <div class="info-value">{{formModelValue?.formattedDate}}</div>
            </div>
            <div class="info-field">
              <div class="info-label">Khu vực</div>
              <div class="info-value">{{formModelValue?.areaName}}</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <div class="info-label">Thiết bị</div>
              <div class="info-value">{{formModelValue?.machineName}}</div>
            </div>
            <div class="info-field">
              <div class="info-label">Bộ phận</div>
              <div class="info-value">{{formModelValue?.machineComponentName}}</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <div class="info-label">Điểm giám sát</div>
              <div class="info-value">{{formModelValue?.monitorPointCode}}</div>
            </div>
            <div class="info-field">
              <div class="info-label">Nhiệt độ</div>
              <div class="info-value" style="color:var(--danger); font-weight:700; font-size: 18px;">
                {{ formModelValue?.componentValue}} °C</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <div class="info-label">Cảnh báo</div>
              <div class="info-value" style="color:var(--danger); font-weight: 600;">{{formModelValue?.warningEventName}}</div>
            </div>
            <div class="info-field">
              <div class="info-label">Đánh giá</div>
              <div class="info-value" style="color:var(--danger); font-weight: 600;">{{formModelValue?.compareResultObject?.name}}</div>
            </div>
          </div>

          <div class="info-row" style="grid-template-columns: 1fr;">
            <div class="info-field">
              <div class="info-label">Loại cấu hình</div>
              <div class="info-value">{{formModelValue?.compareTypeObject?.name}}</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <div class="info-label">Đối tượng so sánh</div>
              <div class="info-value">{{formModelValue?.compareComponent}}</div>
            </div>
            <div class="info-field">
              <div class="info-label">Giá trị so sánh</div>
              <div class="info-value">{{formModelValue?.compareValue}} °C</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <div class="info-label">Lệch nhiệt độ</div>
              <div class="info-value" style="color: var(--warning); font-weight: 700;">{{formModelValue?.deltaValue}} °C</div>
            </div>
            <div class="info-field">
              <div class="info-label">Trạng thái</div>
              <div class="info-value">
                <span class="status-badge status-warning" style="min-width: unset; width: 100%;">{{formModelValue?.statusObject?.name}}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 10px;">
            <div class="info-label">Nhân viên xử lý</div>
            <div class="info-value">---------------</div>
          </div>
        </div>
      </div>
    </div>
    <div class="drawer-footer">
      <button class="btn-save" style="width: 100%; height: 50px; font-size: 16px;" @click="changeStatus">
        Xác nhận &amp; Cập nhật trạng thái
      </button>
    </div>
  </div>
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
<style scoped>

.detail-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
  align-items: start;
}

.alert-image-container {
  position: sticky;
  top: 0;
}

.alert-image-container img {
  width: 100%;
  border-radius: 12px;
  border: 2px solid var(--border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.alert-info-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>