<template>
    <FormWrapper :form-model="formModel" :form-props="{ labelWidth: '140px', rules: formRules }"
        :request-fn="isEditing ? editUserApi : addUserApi" :isEditing="isEditing" @success="handleSuccess">
        <template v-slot="{ formErrors }">
            <el-form-item label="Tên" prop="name" :error="formErrors.Name">
                <el-input v-model="formModel.firstName" />
            </el-form-item>
            <el-select v-model="formModel.cameraTourPoints" multiple filterable placeholder="Chọn điểm tour">
                <el-option v-for="item in cameraTourPointsOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <base-table :data="data" :columns="tourPointColumns"></base-table>
        </template>
    </FormWrapper>
</template>

<script setup lang="tsx">
import FormWrapper from '@/components/Form/FormWrapper.vue'
import { addUserApi, editUserApi } from '@/api/user'
import { computed, ref } from 'vue'
import { rule } from '@/utils/validate'
import { isFormEditing } from '@/utils/is'
import { FormRules, ElInput } from 'element-plus'
import {BaseTable} from "@/components/Table";

const formModel = defineModel('formModel', { required: true })

const cameraTourPointsOptions = ref([
    { id: 1, name: 'Điểm tour 1' },
    { id: 2, name: 'Điểm tour 2' },
    { id: 3, name: 'Điểm tour 3' },
])

const tourPointColumns = [
    { prop: 'name', label: 'Tên Góc quay' },
    {
       label: 'Thời gian dừng',
      slots: {
        default: (scope: any) => (
            <ElInput
                modelValue={scope.row.time}
                placeholder="Nhập thời gian dừng tại điểm tour (giây)"
                onUpdate:modelValue={(val: string) => {
                  scope.row.time = val
                }}
            />
        )
        }
    },
]
const data = ref([
    { id: 1, name: 'Điểm tour 1', description: 'Mô tả điểm tour 1' },
    { id: 2, name: 'Điểm tour 2', description: 'Mô tả điểm tour 2' },
])
const isEditing = computed(() => {
    return isFormEditing(formModel.value)
})
const formRules = computed<FormRules>(() => {
    const rules: FormRules = {
        name: [rule('required', true, 'name'), rule('min', 3, 'username')],
    }

    return rules
})
const emit = defineEmits<(e: 'success', data: any) => void>()
const handleSuccess = (data: any) => {
    emit('success', data)
}
</script>
