<script setup lang="tsx">
import ListTemplate from '@/components/PageTemplate/List/ListTemplate.vue'
import { TableColumn } from '@/components/Table'
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import DrawerForm from '@/components/Form/DrawerForm.vue'
import SearchButton from '@/components/Button/SearchButton.vue'
import VirtualizedSelectFromUrl from '@/components/Selection/VirtualizedSelectFromUrl.vue'
import { useConfirmModal } from '@/hooks/web/useModal'
import { useAppStore } from '@/store/modules/app'
import FormulaForm from './components/FormulaForm.vue'
import FormulaVariableForm from './components/FormulaVariableForm.vue'
import FormulaCard from './components/FormulaCard.vue'
import FormulaVariableCard from './components/FormulaVariableCard.vue'
import { AGGREGATE_FUNCTION_OPTIONS, aggregateFunctionLabel, scopeRangeLabel } from './pdFormulaVariableOptions'
import { getAllMachineTypeApi } from '@/api/machine-type'
import { getAllMachineApi, getComponentMachineApi } from '@/api/machine'
import {
  deleteFormulaApi,
  deleteFormulaVariableApi,
  editFormulaApi,
  editFormulaVariableApi,
  listFormulasApi,
  listFormulaVariablesApi,
} from '@/api/formula'

// Hiện chỉ có 1 mục: quản lý công thức cảnh báo PD (bảng formulas/formula_variables) - nơi duy nhất
// được soạn/sửa biểu thức NCalc, dialog "Thiết lập ngưỡng cảnh báo" chỉ còn CHỌN công thức + ngày áp
// dụng (PdFormulaAssignmentPicker.vue). Dùng ListTemplate như mọi màn danh sách khác (chế độ bảng/ô,
// tìm kiếm, phân trang) - 2 API list trả thẳng mảng đầy đủ (không phân trang server), nên lọc/phân
// trang phía client trong fetchFormulasPage/fetchVariablesPage bên dưới (riêng lọc theo bộ phận của
// Công thức được đẩy xuống BE - xem machineComponentId).
const { confirmModal } = useConfirmModal()
const appStore = useAppStore()
const isMobile = computed(() => appStore.isMobile)

const activeSection = ref<'formulas' | 'variables'>('formulas')

// Số đếm trên tab - độc lập với trang đang xem.
const formulaCountAll = ref(0)
const variableCountAll = ref(0)

function paginateClient(rows: any[], params: any) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const start = (page - 1) * pageSize
  const total = rows.length
  return {
    data: {
      items: rows.slice(start, start + pageSize),
      totalRow: total,
      pageSize,
      rowIndex: total ? start + 1 : 0,
      lastRowIndex: Math.min(start + pageSize, total),
    },
  }
}

// ---- Công thức ----
async function fetchFormulasPage(params: any) {
  const res = await listFormulasApi({ domain: 1, machineComponentId: params.machineComponentId || undefined })
  let rows = (res.data as any[]) ?? []
  if (!params.machineComponentId) formulaCountAll.value = rows.length
  if (params.status && params.status !== 'all') rows = rows.filter((f) => String(f.status) === params.status)
  const q = (params.keyword ?? '').trim().toLowerCase()
  if (q) rows = rows.filter((f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q))
  return paginateClient(rows, params)
}

function formulaScopeLabel(row: any) {
  const parts: string[] = []
  if (row.componentAssignmentCount) parts.push(`${row.componentAssignmentCount} bộ phận`)
  if (row.partAssignmentCount) parts.push(`${row.partAssignmentCount} loại bộ phận`)
  return parts.length ? parts.join(' · ') : 'Chưa gán'
}

async function toggleFormulaStatus(row: any) {
  const nextStatus = row.status === 1 ? 0 : 1
  const previous = row.status
  row.status = nextStatus // optimistic
  try {
    const res: any = await editFormulaApi(row.id, {
      domain: row.domain,
      code: row.code,
      name: row.name,
      expression: row.expression,
      description: row.description,
      status: nextStatus,
    })
    if (res?.isSuccess === false) throw new Error(res?.message)
  } catch {
    row.status = previous
    ElMessage.error('Không đổi được trạng thái, thử lại sau')
  }
}

const formulaTableRef = ref<InstanceType<typeof ListTemplate>>()
const formulaMachineRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
const formulaComponentRef = ref<InstanceType<typeof VirtualizedSelectFromUrl>>()
function handleFormulaMachineTypeChange(searchParams: any) {
  searchParams.machineId = null
  searchParams.machineComponentId = null
  nextTick(() => formulaMachineRef?.value?.fetch())
}
function handleFormulaMachineChange(searchParams: any) {
  searchParams.machineComponentId = null
  nextTick(() => formulaComponentRef?.value?.fetch())
}

const formulaDialogVisible = ref(false)
const formulaFormModel = ref<Record<string, any>>({})
function openAddFormula() {
  formulaFormModel.value = { status: 1 }
  formulaDialogVisible.value = true
}
function openEditFormula(scope: any) {
  formulaFormModel.value = JSON.parse(JSON.stringify(scope.row))
  formulaDialogVisible.value = true
}
function onFormulaSaved() {
  formulaDialogVisible.value = false
  formulaTableRef.value?.refresh()
}
function onDeleteFormula(scope: any) {
  const row = scope.row
  confirmModal('Xóa công thức', `Xóa công thức "${row.name}"? Không thể khôi phục.`, async () => {
    await deleteFormulaApi(row.id)
    ElMessage.success('Xóa thành công')
    formulaTableRef.value?.refresh()
  })
}

// Nút bật/tắt trạng thái dựng bằng inline style thay vì class scoped - class scoped của file này không
// gắn được vào phần tử tạo trong slot TSX (slot được ElTableColumn/TableCard - component khác - gọi lại
// lúc render, không phải lúc render chính component này, nên data-v-xxx không tự thêm vào).
function statusToggleStyle(active: boolean) {
  return {
    width: '34px', height: '20px', borderRadius: '20px',
    background: active ? 'var(--success)' : 'var(--border)',
    position: 'relative' as const, display: 'inline-block', border: 'none', cursor: 'pointer', padding: 0,
  }
}
function statusToggleKnobStyle(active: boolean) {
  return {
    position: 'absolute' as const, top: '2px', left: active ? '16px' : '2px',
    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.18)', transition: 'left 0.15s',
  }
}

const formulaColumns = computed<TableColumn[]>(() => [
  {
    prop: 'name',
    label: 'Công thức',
    minWidth: 200,
    slots: {
      default: ({ row }) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontFamily: 'monospace' }}>{row.code}</div>
        </div>
      ),
    },
  },
  { prop: 'expression', label: 'Biểu thức', minWidth: 220 },
  { prop: 'description', label: 'Mô tả', minWidth: 180 },
  {
    label: 'Phạm vi sử dụng',
    width: 170,
    slots: {
      default: ({ row }) => (
        <span style={{ color: 'var(--text-sub)', fontStyle: row.inUse ? 'normal' : 'italic' }}>{formulaScopeLabel(row)}</span>
      ),
    },
  },
  {
    label: 'Trạng thái',
    width: 110,
    slots: {
      default: ({ row }) => (
        <button
          type="button"
          style={statusToggleStyle(row.status === 1)}
          title={row.status === 1 ? 'Hoạt động - bấm để tắt' : 'Không hoạt động - bấm để bật'}
          onClick={() => toggleFormulaStatus(row)}
        >
          <span style={statusToggleKnobStyle(row.status === 1)}></span>
        </button>
      ),
    },
  },
  {
    label: 'Hành động',
    width: 110,
    slots: {
      default: (scope: any) => (
        <div>
          <button type="button" class="action-btn-circle btn-edit-round" title="Sửa" onClick={() => openEditFormula(scope)}>✎</button>
          <button
            type="button"
            class="action-btn-circle btn-delete-round"
            disabled={scope.row.isLocked || scope.row.inUse}
            title={scope.row.isLocked ? 'Đã dùng để tính kết quả - không xoá được' : scope.row.inUse ? 'Đang được sử dụng - không xoá được' : 'Xoá'}
            onClick={() => onDeleteFormula(scope)}
          >🗑</button>
        </div>
      ),
    },
  },
])

// ---- Biến số ----
async function fetchVariablesPage(params: any) {
  const res = await listFormulaVariablesApi({ domain: 1 })
  let rows = (res.data as any[]) ?? []
  variableCountAll.value = rows.length
  if (params.status && params.status !== 'all') rows = rows.filter((v) => String(v.status) === params.status)
  if (params.aggregateFunction) {
    rows = params.aggregateFunction === 'none'
      ? rows.filter((v) => v.aggregateFunction == null)
      : rows.filter((v) => String(v.aggregateFunction) === params.aggregateFunction)
  }
  const q = (params.keyword ?? '').trim().toLowerCase()
  if (q) rows = rows.filter((v) => v.name.toLowerCase().includes(q) || v.label.toLowerCase().includes(q))
  return paginateClient(rows, params)
}

async function toggleVariableStatus(row: any) {
  const nextStatus = row.status === 1 ? 0 : 1
  const previous = row.status
  row.status = nextStatus
  try {
    // Gửi lại NGUYÊN VẸN mọi field (kể cả nguồn dữ liệu tự tính) - chỉ đổi status, tránh vô tình null
    // hết sourceColumn/aggregateFunction/scopeType của biến "tự tính".
    const res: any = await editFormulaVariableApi(row.id, { ...row, status: nextStatus })
    if (res?.isSuccess === false) throw new Error(res?.message)
  } catch {
    row.status = previous
    ElMessage.error('Không đổi được trạng thái, thử lại sau')
  }
}

const variableTableRef = ref<InstanceType<typeof ListTemplate>>()
const variableDialogVisible = ref(false)
const variableFormModel = ref<Record<string, any>>({})
function openAddVariable() {
  variableFormModel.value = { status: 1 }
  variableDialogVisible.value = true
}
function openEditVariable(scope: any) {
  variableFormModel.value = JSON.parse(JSON.stringify(scope.row))
  variableDialogVisible.value = true
}
function onVariableSaved() {
  variableDialogVisible.value = false
  variableTableRef.value?.refresh()
}
function onDeleteVariable(scope: any) {
  const row = scope.row
  confirmModal('Xóa biến số', `Xóa biến số "${row.label}"? Không thể khôi phục.`, async () => {
    await deleteFormulaVariableApi(row.id)
    ElMessage.success('Xóa thành công')
    variableTableRef.value?.refresh()
  })
}

const variableColumns = computed<TableColumn[]>(() => [
  { prop: 'name', label: 'Tên biến', width: 140 },
  { prop: 'label', label: 'Nhãn hiển thị', width: 160 },
  { prop: 'description', label: 'Mô tả', minWidth: 160 },
  {
    label: 'Hàm tổng hợp',
    width: 150,
    slots: { default: ({ row }) => <span>{aggregateFunctionLabel(row)}</span> },
  },
  {
    label: 'Khoảng thời gian',
    minWidth: 220,
    slots: { default: ({ row }) => <span>{scopeRangeLabel(row)}</span> },
  },
  {
    label: 'Trạng thái',
    width: 110,
    slots: {
      default: ({ row }) => (
        <button
          type="button"
          style={statusToggleStyle(row.status === 1)}
          title={row.status === 1 ? 'Hoạt động - bấm để tắt' : 'Không hoạt động - bấm để bật'}
          onClick={() => toggleVariableStatus(row)}
        >
          <span style={statusToggleKnobStyle(row.status === 1)}></span>
        </button>
      ),
    },
  },
  {
    label: 'Hành động',
    width: 110,
    slots: {
      default: (scope: any) => (
        <div>
          <button type="button" class="action-btn-circle btn-edit-round" title="Sửa" onClick={() => openEditVariable(scope)}>✎</button>
          <button
            type="button"
            class="action-btn-circle btn-delete-round"
            disabled={scope.row.inUse}
            title={scope.row.inUse ? 'Đang được sử dụng trong công thức - không xoá được' : 'Xoá'}
            onClick={() => onDeleteVariable(scope)}
          >🗑</button>
        </div>
      ),
    },
  },
])

function onSectionChange(section: 'formulas' | 'variables') {
  activeSection.value = section
  formulaDialogVisible.value = false
  variableDialogVisible.value = false
}

// Nạp trước số đếm của cả 2 mục ngay khi vào trang - tab đang không active vẫn cần hiện đúng số đếm dù
// bảng của nó chưa từng fetch (ListTemplate chỉ fetch khi được render).
onMounted(async () => {
  const [formulaRes, variableRes] = await Promise.all([listFormulasApi({ domain: 1 }), listFormulaVariablesApi({ domain: 1 })])
  formulaCountAll.value = ((formulaRes.data as any[]) ?? []).length
  variableCountAll.value = ((variableRes.data as any[]) ?? []).length
})
</script>

<template>
  <div class="container">
    <div class="bread-crumb">Quản trị hệ thống / <span>Cài đặt công thức PD</span></div>

    <div class="tabs-container">
      <div :class="['tab-item', activeSection === 'formulas' ? 'active' : '']" @click="onSectionChange('formulas')">
        Công thức <span class="tab-count">{{ formulaCountAll }}</span>
      </div>
      <div :class="['tab-item', activeSection === 'variables' ? 'active' : '']" @click="onSectionChange('variables')">
        Biến số <span class="tab-count">{{ variableCountAll }}</span>
      </div>
    </div>

    <list-template
        v-if="activeSection === 'formulas'"
        ref="formulaTableRef"
        title="Danh sách công thức"
        key-list="formula-settings-formulas"
        :columns="formulaColumns"
        :card-component="FormulaCard"
        :use-table-config="{
          fetchDataApi: fetchFormulasPage,
          searchDefaults: { keyword: '', status: 'all', machineTypeId: null, machineId: null, machineComponentId: null },
        }"
        :row-key="(row: any) => row.id"
        @addHandler="openAddFormula"
    >
      <template slot="search" v-slot="{ searchParams, tableMethods }">
        <div class="filter-item">
          <div class="filter-label">Tên hoặc mã công thức</div>
          <el-input class="filter-input" v-model="searchParams.keyword" clearable placeholder="Tìm theo tên hoặc mã công thức..." />
        </div>
        <div class="filter-item">
          <div class="filter-label">Trạng thái</div>
          <el-select class="filter-input" v-model="searchParams.status">
            <el-option label="Tất cả trạng thái" value="all" />
            <el-option label="Hoạt động" value="1" />
            <el-option label="Không hoạt động" value="0" />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">Loại thiết bị</div>
          <virtualized-select-from-url
              v-model="searchParams.machineTypeId"
              :request-fn="getAllMachineTypeApi"
              all-option-label="Tất cả"
              filterable
              value-key="id"
              clearable
              class="filter-input"
              @change="() => handleFormulaMachineTypeChange(searchParams)"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Thiết bị</div>
          <virtualized-select-from-url
              ref="formulaMachineRef"
              v-model="searchParams.machineId"
              :request-fn="() => getAllMachineApi({ machineTypeId: searchParams.machineTypeId })"
              all-option-label="Tất cả"
              filterable
              value-key="id"
              clearable
              class="filter-input"
              @change="() => handleFormulaMachineChange(searchParams)"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">Bộ phận</div>
          <virtualized-select-from-url
              ref="formulaComponentRef"
              v-model="searchParams.machineComponentId"
              :request-fn="() => getComponentMachineApi({ machineId: searchParams.machineId, hasMonitorPoints: false })"
              all-option-label="Tất cả"
              filterable
              value-key="id"
              clearable
              class="filter-input"
          />
        </div>
        <search-button @click="tableMethods.getList"></search-button>
      </template>
    </list-template>

    <list-template
        v-else
        ref="variableTableRef"
        title="Danh sách biến số"
        key-list="formula-settings-variables"
        :columns="variableColumns"
        :card-component="FormulaVariableCard"
        :use-table-config="{ fetchDataApi: fetchVariablesPage, searchDefaults: { keyword: '', status: 'all', aggregateFunction: '' } }"
        :row-key="(row: any) => row.id"
        @addHandler="openAddVariable"
    >
      <template slot="search" v-slot="{ searchParams, tableMethods }">
        <div class="filter-item">
          <div class="filter-label">Tên biến hoặc nhãn hiển thị</div>
          <el-input class="filter-input" v-model="searchParams.keyword" clearable placeholder="Tìm theo tên biến hoặc nhãn hiển thị..." />
        </div>
        <div class="filter-item">
          <div class="filter-label">Hàm tổng hợp</div>
          <el-select class="filter-input" v-model="searchParams.aggregateFunction">
            <el-option label="Tất cả" value="" />
            <el-option label="Biến cứng (code)" value="none" />
            <el-option v-for="o in AGGREGATE_FUNCTION_OPTIONS" :key="o.value" :label="o.label" :value="String(o.value)" />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">Trạng thái</div>
          <el-select class="filter-input" v-model="searchParams.status">
            <el-option label="Tất cả trạng thái" value="all" />
            <el-option label="Hoạt động" value="1" />
            <el-option label="Không hoạt động" value="0" />
          </el-select>
        </div>
        <search-button @click="tableMethods.getList"></search-button>
      </template>
    </list-template>

    <drawer-form v-model="formulaDialogVisible" :title="formulaFormModel.id ? 'Sửa công thức' : 'Thêm công thức'" :size="isMobile ? '100%' : '560px'">
      <FormulaForm :form-model="formulaFormModel" @success="onFormulaSaved" />
    </drawer-form>

    <drawer-form v-model="variableDialogVisible" :title="variableFormModel.id ? 'Sửa biến số' : 'Thêm biến số'" :size="isMobile ? '100%' : '480px'">
      <FormulaVariableForm :form-model="variableFormModel" @success="onVariableSaved" />
    </drawer-form>
  </div>
</template>

<style scoped>
.tabs-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1px;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  color: var(--text-sub);
  font-weight: 600;
  font-size: 14px;
  transition: 0.3s;
  border-bottom: 3px solid transparent;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-item:hover {
  color: var(--primary);
  background: var(--bg-body);
}

.tab-item.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, transparent);
}

.tab-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-sub);
  background: var(--bg-body);
  padding: 1px 7px;
  border-radius: 20px;
}
.tab-item.active .tab-count { background: var(--bg-card); color: var(--primary); }
</style>
