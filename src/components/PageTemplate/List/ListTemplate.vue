<template>
  <div class="container">
    <div class="grid">
      <!-- Filter Section -->
      <div  v-show="showSearchForm" class="card filter-card">
          <search-form
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

        <slot name="top">
          <div
            style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border)">
            <div style="font-size: 15px; font-weight: 700; color: var(--primary); text-transform: uppercase;">
              {{ title }}
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div v-show="showBtnSwitch" class="view-switcher">
                <button class="view-btn" :class="{active: viewLayout ==='table'}" @click="()=>switchView('table')">
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
                <button class="view-btn" :class="{active: viewLayout ==='card'}" @click="() => switchView('card')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
              </div>
              <button v-show="showBtnAdd" class="btn-add" @click="$emit('addHandler')">+ Thêm</button>
            </div>
            <slot name="appendTop"></slot>
          </div>
        </slot>

        <!-- TABLE VIEW -->
        <div v-if="viewLayout ==='table'">
          <BaseTable
              :data="dataList"
              :loading="loading"
              @register="tableRegister"
              :columns="columnValue"
              v-bind="$attrs"
          >
          </BaseTable>
        </div>
        <div  v-if="viewLayout ==='card'" class="card-view-grid">
          <TableCard
            :data="dataList"
            :loading="loading"
            :columns="columnValue"
            :card-component="cardComponent"
            :card-props="cardProps"
            v-bind="$attrs"
          />
        </div>
        <slot name="pagination">
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
        </slot>
        <slot name="bottom">>

        </slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseTable from '@/components/Table/BaseTable.vue'
import {useTable} from '@/hooks/web/useTable'
import type {UseTableConfig} from '@/hooks/web/useTable'
import SearchForm from '@/components/PageTemplate/List/SearchForm.vue'
import {onBeforeUnmount, onMounted, PropType, ref, useAttrs, watch} from 'vue'
import BasePagination from '@/components/Pagination/BasePagination.vue'
import {TableColumn} from '@/components/Table'
import {usePaginationStore} from '@/store/modules/paginationStore'
import BasicColsCard from '@/components/Table/BasicColsCard.vue'

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
  cardComponent: {
    default: BasicColsCard,
    required: false,
  },
  cardProps: {
    required: false,
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
  showBtnAdd: {
    type: Boolean,
    default: true,
  },
  showBtnSwitch: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
})
const attrs = useAttrs()

const paginationStore = usePaginationStore()
const {tableRegister, searchParams, tableState, tableMethods} = useTable(props.useTableConfig)
const {loading, dataList} = tableState
const columnValue = ref(props.columns)
const paginationSetting = ref<object>({})
const viewLayout = ref("table");
const switchView = (layout:string) => {
  viewLayout.value = layout
}

// auto switch mobile
const autoSwitchViewOnMobile = () => {
  if (window.innerWidth <= 768) {
    switchView('card')
    console.log('📱 Auto-switched to card view for mobile')
  }
}

// optional: handle resize
const handleResize = () => {
  autoSwitchViewOnMobile()
}

onMounted(() => {
  autoSwitchViewOnMobile()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
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
