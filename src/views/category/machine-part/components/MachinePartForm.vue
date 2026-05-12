<template>
  <div>
    <FormWrapper
        ref="formRef"
        :form-model="formModel"
        :form-props="{ labelWidth: '140px', labelPosition: appStore.isMobile ? 'top': 'left' }"
        :request-fn="isEditing ? editMachinePartApi : addMachinePartApi"
        :isEditing="isEditing"
        @success="handleSuccess"
        :title="title"
    >
      <template v-slot="{ formErrors }">
        <el-form-item label="Tên bộ phận" prop="name" :error="formErrors.Name">
          <el-input v-model="formModel.name"/>
        </el-form-item>
        <el-form-item label="Mã bộ phận" prop="code" :error="formErrors.Code">
          <el-input v-model="formModel.code"/>
        </el-form-item>
        <el-form-item label="Bộ phận cha" prop="parentId" :error="formErrors.ParentId">
          <tree-select-remote
              :request-fn="()=> getAllMachinePartApi({machineTypeId: formModel.machineTypeId})"
              v-model="formModel.parentId"/>
        </el-form-item>
        <el-form-item label="Trạng thái" prop="status" :error="formErrors.Status">
          <select-from-config
              key-config="userStatusList"
              v-model="formModel.status"
              col-value="code"
          />
        </el-form-item>
        <el-form-item
            v-show="formModel?.machinePartThresholdList?.length"
            label="Ngưỡng nhiệt"
            prop="machinePartThresholdList"
            :error="formErrors.machinePartThresholdList">
          <div class="flex flex-wrap gap-1">
            <el-tag
                v-for="(item, index) in formModel?.machinePartThresholdList ?? []"
                :key="index"
                :effect="item?.temperatureThresholds?.length ? 'dark' : 'plain'"
                :type="item?.temperatureThresholds?.length ? 'success' : 'danger'"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </el-form-item>
      </template>
      <template v-slot:button>
        <div class="flex justify-between md:justify-start md:flex-row  gap-1">
          <div class="flex md:flex-row gap-1">
            <cancel-button class="w-full md:w-fit whitespace-nowrap" @click="() => formRef.triggerCancel()" :icon="null"></cancel-button>
            <el-button class="w-full md:w-fit whitespace-nowrap" type="warning" @click="openTemperatureThreshold">Thiết lập ngưỡng nhiệt</el-button>
          </div>
          <save-button class="w-full md:w-fit whitespace-nowrap" :loading="formRef?.loading" @click="() => formRef.submitForm()" :icon="null"></save-button>
        </div>
      </template>

    </FormWrapper>
    <MachinePartPointDialog
        v-model="dialogMachinePointVisible"
        v-model:thresholdList="machinePartThresholdList"
        @cancel="dialogMachinePointVisible = false"
        @save="saveMachinePoint"
        align-center
        class="h-fit"
        :size="appStore.isMobile ? '100%' : '50%'"
    ></MachinePartPointDialog>
  </div>

</template>

<script setup lang="ts">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {computed, ref} from 'vue'
import {rule} from '@/utils/validate'
import {isFormEditing} from '@/utils/is'
import {FormRules} from 'element-plus'
import {addMachinePartApi, editMachinePartApi, getAllMachinePartApi} from '@/api/machine-part'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import CancelButton from "@/components/Button/CancelButton.vue";
import SaveButton from "@/components/Button/SaveButton.vue";
import MachinePartPointDialog from '@/views/category/machine-part/components/MachinePartPointDialog.vue'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: false,
  }
})

const formRef = ref()

const dialogMachinePointVisible = ref(false)

const machinePartThresholdList = ref(props.formModel.machinePartThresholdList ?? [])

const appStore = useAppStore();

const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})

const openTemperatureThreshold = () => {
  machinePartThresholdList.value = props.formModel.machinePartThresholdList ?? []
  dialogMachinePointVisible.value = true
}

const saveMachinePoint = (data: any) => {
  const form = props.formModel;
  form.machinePartThresholdList = data
  emits('update:formModel', form)
  dialogMachinePointVisible.value = false
}

const emits = defineEmits(['update:formModel', 'success'])
const handleSuccess = (data: any) => {
  emits('success', data)
}
</script>
