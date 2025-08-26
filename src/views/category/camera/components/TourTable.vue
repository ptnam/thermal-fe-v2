<template>
  <div>
    <base-table :data="data" :columns="columns"></base-table>
  </div>
</template>
<script setup lang="tsx">
import {BaseTable} from "@/components/Table";
import {ElTag} from "element-plus";
import {useLang} from "@/hooks/web/useI18n";
import ApiButton from "@/components/Button/ApiButton.vue";
import {ArrowRight, SwitchButton} from "@element-plus/icons-vue";
import {playTourApi} from "@/api/camera";

const {t} = useLang()
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

const columns = [
  {
    type: 'expand',
    slots: {
      default: (scope: any) => renderExpand(scope)
    }
  },
  {prop: 'tourName', label: 'Tên'},
  {
    prop: 'presetTypeObject.name',
    label: t('fields.action'),
    slots: {
      default: ({row}) => (
          <div>
            <ApiButton
                api={() => playTourApi({tourId: row.tourId, cameraId: row.cameraId, command: 'run'})}
                icon={ArrowRight}
                color="#4F6B99"
                round={true}
            >
            </ApiButton>
            <ApiButton
                api={() => playTourApi({tourId: row.tourId, cameraId: row.cameraId, command: 'stop'})}
                icon={SwitchButton}
                color="#FACE38"
                round={true}
            >
            </ApiButton>
          </div>
      ),
    },
  },
]
defineProps({
  data: {
    type: Array,
    required: true,
  },
})
</script>