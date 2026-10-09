<template>
  <div>
    <base-table :data="data" :columns="columns" :border="true"></base-table>
  </div>
</template>
<script setup lang="tsx">
import { useLang } from '@/hooks/web/useI18n'
import { computed } from 'vue'
import {BaseTable} from "@/components/Table";
import {ElTag} from "element-plus";

const { t } = useLang()

const renderExpand = (props: any) => {
  return (
      <div class="inline-block">
        {(props.row.cameraMonitorPoints || []).map((item: any) => (
            <ElTag class="m-2" key={item.id} type="success" effect="dark">
              {item.name}
            </ElTag>
        ))}
      </div>
  )
}

const columns = computed(() => [
  {
    type: 'expand',
    slots: {
      default: (props: any) => renderExpand(props)
    }
  },
  {prop: 'name', label: t('camera.preset')},
  {prop: 'presetTypeObject.name', label: t('fields.type')},
])
defineProps({
  data: {
    type: Array,
    required: true,
  },
})
</script>