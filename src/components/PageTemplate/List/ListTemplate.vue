<template>
  <div class="container">
    <div class="grid">
      <!-- Filter Section -->
      <div class="card filter-card">
          <search-form
              v-show="showSearchForm"
              class="filter-row"
              :model="searchParams"
              :loading="loading"
              @search="() => tableMethods.getList()"
              v-bind="searchProps"
          >
            <slot :searchParams="searchParams" :tableMethods="tableMethods"></slot>
          </search-form>
      </div>

      <!-- Table/Card Section -->
      <div class="card table-container-full">
        <div
            style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border)">
          <div style="font-size: 15px; font-weight: 700; color: var(--primary); text-transform: uppercase;">
            {{ title }}
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div class="view-switcher">
              <button class="view-btn active" onclick="switchView('table')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button class="view-btn" onclick="switchView('card')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
            <button class="btn-add" @click="$emit('addHandler')">+ Thêm</button>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div>
          <BaseTable
              :data="dataList"
              :loading="loading"
              @register="tableRegister"
              :columns="columnValue"
              v-bind="$attrs"
          >
          </BaseTable>
        </div>
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
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseTable from '@/components/Table/BaseTable.vue'
import {useTable} from '@/hooks/web/useTable'
import type {UseTableConfig} from '@/hooks/web/useTable'
import SearchForm from '@/components/PageTemplate/List/SearchForm.vue'
import {onMounted, PropType, ref, watch} from 'vue'
import BasePagination from '@/components/Pagination/BasePagination.vue'
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
  title: {
    type: String,
    required: false,
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
