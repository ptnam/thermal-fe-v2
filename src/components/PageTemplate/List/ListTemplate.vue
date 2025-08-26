<template>
  <div>
    <search-form
        v-show="showSearchForm"
        :model="searchParams"
        :loading="loading"
        @search="() => tableMethods.getList()"
        v-bind="searchProps"
    >
      <slot :searchParams="searchParams"></slot>
    </search-form>
    <slot name="top">
      <add-button @click="$emit('addHandler')"></add-button>
    </slot>
    <BaseTable
        :data="dataList"
        :loading="loading"
        @register="tableRegister"
        :columns="columnValue"
        v-bind="$attrs"
    >
    </BaseTable>
    <BasePagination
        v-if="showPagination"
        class="mt-4"
        :total="tableState.total.value"
        v-model:page-size="tableState.pageSize.value"
        v-model:current-page="tableState.currentPage.value"
        v-model:rowIndex="tableState.rowIndex.value"
        v-model:lastRowIndex="tableState.lastRowIndex.value"
        :keyList="keyList"
        :pagination-setting="paginationSetting"
        :columns="columns"
        @saveSuccess="updatePaginationSetting"
    />
  </div>
</template>
<script setup lang="ts">
import BaseTable from '@/components/Table/BaseTable.vue'
import {useTable} from '@/hooks/web/useTable'
import type {UseTableConfig} from '@/hooks/web/useTable'
import SearchForm from '@/components/PageTemplate/List/SearchForm.vue'
import {onMounted, PropType, ref, watch} from 'vue'
import BasePagination from '@/components/Pagination/BasePagination.vue'
import AddButton from '@/components/Button/AddButton.vue'
import {TableColumn} from '@/components/Table'
import {usePaginationStore} from '@/store/modules/paginationStore'

const props = defineProps({
  keyList: {
    type: String,
    required: false,
    default: 'common',
  },
  columns: {
    type: Array as () => TableColumn[],
    default: () => [],
  },
  useTableConfig: {
    type: Object as PropType<UseTableConfig>,
    required: true,
  },
  searchProps: {
    type: Object,
    required: false,
  },
  showSearchForm: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
})
const paginationStore = usePaginationStore()
const {tableRegister, searchParams, tableState, tableMethods} = useTable(props.useTableConfig)
const {loading, dataList} = tableState
const columnValue = ref(props.columns)
const paginationSetting = ref<object>({})

const applyPaginationColumns = (paginationSettingValue: object) => {
  paginationSetting.value = paginationSettingValue
  const cols = props.columns.map((col) => ({...col}))
  for (const col of cols) {
    if (col.prop) {
      col.hidden = !paginationSetting.value[col.prop]
    }
  }
  columnValue.value = cols
}
const updatePaginationSetting = (paginationSettingValue: object) => {
  applyPaginationColumns(paginationSettingValue)
}
watch(
    () => props.columns,
    (newVal) => {
      applyPaginationColumns(paginationStore.getConfig(props.keyList, newVal))
    },
    {immediate: true}
)
onMounted(() => {
  applyPaginationColumns(paginationStore.getConfig(props.keyList, props.columns))
})
defineExpose({
  ...tableMethods,
})
</script>
