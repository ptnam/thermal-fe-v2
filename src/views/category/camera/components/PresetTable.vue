<template>
  <div>
    <base-table :data="data" :columns="columns"></base-table>
  </div>
</template>
<script setup lang="tsx">
import {BaseTable} from "@/components/Table";
import {ElTag} from "element-plus";

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

const columns = [
  {
    type: 'expand',
    slots: {
      default: (props: any) => renderExpand(props)
    }
  },
  {prop: 'name', label: 'Góc quay'},
  {prop: 'presetTypeObject.name', label: 'Loại'},
]
defineProps({
  data: {
    type: Array,
    required: true,
  },
})
</script>