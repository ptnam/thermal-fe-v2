<template>
  <div>
    <ElCard class="pt-4">
      <SearchForm
        v-show="showSearchForm"
        :model="searchParams"
        :loading="loading"
        @search="() => tableMethods.getList()"
        v-bind="searchProps"
      >
        <slot :searchParams="searchParams" :tableMethod="tableMethods"></slot>
      </SearchForm>
    </ElCard>
    <ElCard class="mt-2">
      <slot name="top">
        <AddButton
          @click="$emit('addHandler')"
          class="float-end mb-2"
        ></AddButton>
      </slot>
      <BaseTable
        :data="dataList"
        :loading="loading"
        @register="tableRegister"
        :columns="columnValue"
        @sort-change="sortChange"
        :default-sort="defaultSort"
        v-bind="$attrs"
      >
      </BaseTable>
      <BasePagination
        v-if="paginationVisible"
        class="mt-4"
        v-model:table-state="tableState"
        :key-list="keyList"
        :pagination-setting="paginationSetting"
        :columns="columns"
        @success="updatePaginationSetting"
      />
    </ElCard>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import BaseTable from "@/components/ui/Table/BaseTable.vue";
import SearchForm from "./SearchForm.vue";
import BasePagination from "@/components/ui/Pagination/BasePagination.vue";
import type { TableColumn } from "@/components/ui/Table";
import { useTable, type UseTableConfig } from "@/composables/client/useTable";
import type { PropType } from "vue";
import { usePaginationStore } from "@/stores/modules/paginationStore";
import { ElCard } from "element-plus";
import AddButton from "@/components/ui/Button/AddButton.vue";

const props = defineProps({
  keyList: {
    type: String,
    required: true,
  },
  columns: {
    type: Array as PropType<TableColumn[]>,
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
  paginationVisible: {
    type: Boolean,
    default: true,
  },
});
const paginationStore = usePaginationStore();
const { tableRegister, searchParams, tableState, tableMethods } = useTable(
  props.useTableConfig,
);
const { loading, dataList } = tableState;
const columnValue = ref(props.columns);
const paginationSetting = ref<Recordable>({});

const applyPaginationColumns = (paginationSettingValue: Recordable) => {
  paginationSetting.value = paginationSettingValue;
  const cols = props.columns.map((col) => ({ ...col }));
  for (const col of cols) {
    if (col.prop) {
      col.hidden = !paginationSetting.value[col.prop];
    }
  }
  columnValue.value = cols;
};
const updatePaginationSetting = (paginationSettingValue: Recordable) => {
  applyPaginationColumns(paginationSettingValue);
};

const defaultSort = computed(() => {
  const sortValue = (searchParams["sort"] as string)?.split(":") || [];
  const [prop, order] = sortValue;
  return {
    prop: prop || undefined,
    order: order || undefined,
  };
});

const sortChange = ({ prop, order }) => {
  tableState.currentPage.value = 1;
  searchParams["sort"] = order ? `${prop}:${order}` : undefined;
  tableMethods.refresh();
};

watch(
  () => props.columns,
  (newVal) => {
    applyPaginationColumns(paginationStore.getConfig(props.keyList, newVal));
  },
  { immediate: true },
);
onMounted(() => {
  applyPaginationColumns(
    paginationStore.getConfig(props.keyList, props.columns),
  );
});
defineExpose({
  ...tableMethods,
});
</script>
