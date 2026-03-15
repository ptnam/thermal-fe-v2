<template>
  <FormWrapper
      :form-model="formModel"
      :form-props="{ labelWidth: '160px', rules: userRules }"
      :request-fn="isEditing ? editAreaApi : addAreaApi"
      :isEditing="isEditing"
      @success="handleSuccess"
      :transform-form-data="transformFormData"
  >
    <template v-slot="{ formErrors }">
      <el-form-item label="Tỉnh" prop="provinceId" :error="formErrors.ProvinceId">
        <select-from-config
            v-model="formModel.provinceId"
            key-config="provinceList"
        />
      </el-form-item>
      <el-form-item label="Mã khu vực" prop="code" :error="formErrors.Code">
        <el-input v-model="formModel.code"/>
      </el-form-item>
      <el-form-item label="Tên khu vực" prop="name" :error="formErrors.Name">
        <el-input v-model="formModel.name"/>
      </el-form-item>
      <el-form-item label="Loại bản đồ" prop="mapType" :error="formErrors.MapType">
        <select-from-config
            v-model="formModel.mapType"
            key-config="mapTypeList"
            colValue="code"
            @change="changeMapType"
        />
      </el-form-item>
      <template v-if="formModel.mapType === MAP_TYPE_PICTURE">
        <Suspense>
          <el-form-item prop="photoPath" label="Sơ đồ một sợi" :error="formErrors.PhotoPath">
            <ImageUploader v-model="formModel.photoPath"/>
          </el-form-item>
        </Suspense>
        <Suspense>
          <el-form-item prop="emapPhotoPath" label="Sơ đồ mặt bằng" :error="formErrors.emapPhotoPath">
            <ImageUploader v-model="formModel.emapPhotoPath"/>
          </el-form-item>
        </Suspense>
      </template>
      <el-form-item label="Khu vực cha" prop="parentId" :error="formErrors.ParentId">
        <tree-select-remote
            v-model="formModel.parentId"
            :request-fn="getAllTreeAreaApi"
            clearable
        />
      </el-form-item>
      <el-form-item label="Tọa độ" :error="formErrors.Latitude ?? formErrors.Longitude">
        <div class="flex">
          <LatLngPicker ref="mapPicker" :map-config="formModel" @input="setCoordinate"/>
          <div v-show="formModel.latitude && formModel.longitude" class="ml-4">
            <p class="m-0">
              <span class="font-bold">Kinh độ:</span> {{ formModel.longitude }},
              <span class="font-bold">Vĩ độ:</span> {{ formModel.latitude }}
            </p>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Ghi chú" prop="note" :error="formErrors.Note">
        <el-input v-model="formModel.note"/>
      </el-form-item>
      <el-form-item label="Giá trị đánh giá" prop="comparationDataMode" :error="formErrors.ComparationDataMode">
        <select-from-config
            v-model="formModel.comparationDataMode"
            key-config="comparationDataModeList"
        ></select-from-config>
      </el-form-item>
      <el-form-item label="Nhiệt độ môi trường" prop="environmentTemperature"
                    :error="formErrors.EnvironmentTemperature">
        <el-input-number
            v-model="formModel.environmentTemperature"
            :controls="false"
            :min="0"
            :max="100"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status" :error="formErrors.Status">
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
import FormWrapper from '@/components/Form/FormWrapper.vue'
import SelectFromConfig from '@/components/Selection/SelectFromConfig.vue'
import {computed, nextTick, ref, watch} from 'vue'
import {rule} from '@/utils/validate'
import {isFormEditing} from '@/utils/is'
import {FormRules} from 'element-plus'
import {addAreaApi, editAreaApi, getAllTreeAreaApi} from '@/api/area'
import TreeSelectRemote from '@/components/Tree/TreeSelectRemote.vue'
import LatLngPicker from '@/components/Map/LatLngPicker.vue'
import ImageUploader from '@/components/Input/ImageUploader.vue'
import {MAP_TYPE_PICTURE} from '@/constants'
import {removeAllObjectInObject} from "@/utils/objectUtils";
import InputNumber from "@/components/Input/InputNumber.vue";

const props = defineProps({
  formModel: {
    type: Object,
    required: true,
  },
})
const mapPicker = ref<InstanceType<typeof LatLngPicker>>()
const transformFormData = (formData: any) => {
  return removeAllObjectInObject(formData)
}

watch(
    () => props.formModel,
    () => {
      nextTick(() => {
        mapPicker.value?.refresh() // Call refresh when 'formModel' changes
      })
    },
    {deep: true}, // Set deep to true if you want to watch nested properties
)

const emit = defineEmits(['update:formModel', 'success'])

const updateFormModel = (node: any) => {
  emit('update:formModel', {...props.formModel, ...node})
}
const changeMapType = () => {
  props.formModel.photoPath = null
}
const setCoordinate = (coordinate: any) => {
  updateFormModel(coordinate)
}
const isEditing = computed(() => {
  return isFormEditing(props.formModel)
})
const userRules = computed<FormRules>(() => {
  const rules: FormRules = {
    code: [rule('required', true, 'Mã khu vực'), rule('min', 3, 'Mã khu vực')],
    name: [rule('required', true, 'Tên khu vực')],
    status: [rule('required', true, 'status')],
  }

  return rules
})
const handleSuccess = (data: any) => {
  emit('success', data)
}
</script>
