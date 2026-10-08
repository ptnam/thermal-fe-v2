<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '180px', rules: formRules, labelPosition: isMobile? 'top': 'left' }"
      :request-fn="isEditing ? editNotificationGroupApi : addNotificationGroupApi"
      :isEditing="isEditing"
      @success="handleSuccess"
  >
    <template v-slot="{ formErrors }">
      <el-form-item :label="t('alertSetting.group.name')" prop="name" :error="formErrors.Name">
        <el-input v-model="formModel.name" clearable/>
      </el-form-item>
      <el-form-item :label="t('alertSetting.channel.code')" prop="code" :error="formErrors.Code">
        <el-input v-model="formModel.code" clearable/>
      </el-form-item>
      <el-form-item
          :label="t('alertSetting.group.channel')"
          prop="notificationChannels"
          :error="formErrors.NotificationChannels"
      >
        <object-select-from-url
            :request-fn="getAllNotificationChannelApi"
            v-model="formModel.notificationChannels"
            :multiple="true"
            value-key="id"
        />
      </el-form-item>
      <el-form-item :label="t('alertSetting.group.events')" prop="events" :error="formErrors.Events">
        <object-select-from-url
            :request-fn="getAllWarningEventApi"
            v-model="formModel.events"
            :multiple="true"
            value-key="id"
        />
      </el-form-item>
      <el-form-item
          :label="t('alertSetting.group.alertTime')"
          prop="fromTime"
          :error="formErrors.FromTime ?? formErrors.ToTime"
      >
        <el-time-picker
            v-model="warningTimeValue"
            is-range
            range-separator="-"
            :start-placeholder="t('alert.startTime')"
            :end-placeholder="t('alert.endTime')"
            format="HH:mm"
            value-format="HH:mm:ss"
        />
      </el-form-item>
      <el-form-item :label="t('fields.area')" prop="areaId" :error="formErrors.AreaId">
        <tree-select-remote
            v-model="formModel.areaId"
            :request-fn="getAllTreeAreaApi"
            filterable
            clearable
            @change="handleChangeArea"
        />
      </el-form-item>
      <el-form-item :label="t('fields.status')" prop="status" :error="formErrors.Status">
        <select-from-config
            key-config="userStatusList"
            v-model="formModel.status"
            col-value="code"
        />
      </el-form-item>
    </template>
  </FormWrapper>
</template>

<script setup lang="ts">
import { useLang } from '@/hooks/web/useI18n'
import FormWrapper from '@/components/Form/FormWrapper.vue'
import {computed, nextTick, ref} from 'vue'
import {rule} from '@/utils/validate'
import {isFormEditing} from '@/utils/is'
import {FormRules} from 'element-plus'
import {addNotificationGroupApi, editNotificationGroupApi} from '@/api/notification-group'
import ObjectSelectFromUrl from '@/components/Selection/ObjectSelectFromUrl.vue'
import {getAllNotificationChannelApi} from '@/api/notification-channel'
import {getAllTreeAreaApi} from '@/api/area'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {getAllWarningEventApi} from '@/api/warning-event'
import TreeSelectRemote from "@/components/Tree/TreeSelectRemote.vue";
import { useAppStore } from '@/store/modules/app'

const { t } = useLang()

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})

const appStore = useAppStore();
const isMobile = computed(() => appStore.isMobile)
const emits = defineEmits(['update:formModel', 'success'])

const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [rule('required', true, 'name')],
    code: [rule('required', true, 'code')],
    events: [rule('required', true, 'code')],
    notificationChannels: [rule('required', true, 'code')],
    fromTime: [rule('required', true, 'code')],
    area: [rule('required', true, 'code')],
  }
  return rules
})

const warningTimeValue = computed<any>({
  get() {
    return [props.formModel.fromTime, props.formModel.toTime]
  },
  set(value) {
    const formModel = props.formModel
    formModel.fromTime = value[0] ?? null
    formModel.toTime = value[1] ?? null
    emits('update:formModel', formModel)
  },
})
const cameraRef = ref<InstanceType<typeof ObjectSelectFromUrl>>()
const handleChangeArea = () => {
  nextTick(() => {
    cameraRef?.value?.fetch()
  })
}
const handleSuccess = (data: any) => {
  emits('success', data)
}
</script>
