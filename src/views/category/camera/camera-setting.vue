<template>
    <div class="container main-container" v-loading="syncPresetLoading">
        <div class="camera-setting">

            <el-tabs v-model="activeName" type="border-card">
                <el-tab-pane label="Quản lý tour" name="1">
                    <div>
                        <div class="mb-4 flex items-center justify-end">
                            <button class="btn-add" @click="addTour">+ Thêm Tour</button>
                        </div>
                        <base-table :data="cameraTours" :columns="tourCols"></base-table>
                        <ActionForm v-model="dialogVisible" style="min-width: 500px">
                            <add-tour-form
                             v-model:formModel="formModel"
                              title="Thêm mới" 
                              @success="saveSuccess">
                            </add-tour-form>
                        </ActionForm>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="Quản lý góc quay" name="3">

                </el-tab-pane>
                <el-tab-pane label="Live" name="2">

                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<script setup lang="tsx">
import { ElTag } from "element-plus";
import { useLang } from "@/hooks/web/useI18n";
import ApiButton from "@/components/Button/ApiButton.vue";
import { ArrowRight, SwitchButton } from "@element-plus/icons-vue";
import { listPresetsApi, playTourApi } from "@/api/camera";
import { onMounted, ref } from 'vue'
import useRequest from '@/hooks/web/useRequest';
import { useRoute } from "vue-router";
import DeleteCircleButton from "@/components/Button/DeleteCircleButton.vue";
import ActionForm from '@/components/Form/ActionForm.vue'
import {BaseTable} from "@/components/Table";
import AddTourForm from "@/views/category/camera/components/AddTourForm.vue";

const { onRequest: presetRequest, isLoading: syncPresetLoading } = useRequest()


const { t } = useLang()
const activeName = ref('1')
const presets = ref([])
const cameraTours = ref([])
const formModel = ref({})
const route = useRoute()
const cameraId = route.params.id as string

const renderExpand = (scope: any) => {
    return (
        <div class="inline-block">
            {(scope.row.cameraTourPresets || []).map((item: any) => (
                <ElTag class="m-2" key={item.id} type="success" effect="dark">
                    {item.name}({item.time})
                </ElTag>
            ))}
        </div>
    )
}
const tourCols = [
    { prop: 'tourName', label: 'Tên' },
    {
        label: 'Góc quay',
        slots: {
            default: (scope: any) => renderExpand(scope)
        }
    },
    {
        prop: 'presetTypeObject.name',
        label: t('fields.action'),
        slots: {
            default: ({ row }) => (
                <div>
                    <ApiButton
                        api={() => playTourApi({ tourId: row.tourId, cameraId: row.cameraId, command: 'run' }).then(res => showMessage(res))}
                        icon={ArrowRight}
                        color="#4F6B99"
                        round={true}
                    >
                    </ApiButton>
                    <ApiButton
                        api={() => playTourApi({ tourId: row.tourId, cameraId: row.cameraId, command: 'stop' }).then(res => showMessage(res))}
                        icon={SwitchButton}
                        color="#FACE38"
                        round={true}
                    >
                    </ApiButton>
                    <DeleteCircleButton></DeleteCircleButton>
                </div>
            ),
        },
    },
]
const dialogVisible = ref(false)

const addTour = () => {
    formModel.value = {
        tourName: '',
        cameraTourPoints: [],
    }
    dialogVisible.value = true
}

const saveSuccess = () => {
    dialogVisible.value = false
    fetchData()
}
const fetchData = () => {
    presetRequest(listPresetsApi, cameraId).then((res) => {
        presets.value = res.data.presets
        cameraTours.value = res.data.cameraTours
    })
}

onMounted(() => {
    fetchData()
});
</script>