import BaseTable from './BaseTable.vue'
import { ElTable } from 'element-plus'
import { TableColumn, TableSetProps } from './types'

export type { TableColumn, TableSlotDefault, TableSetProps, TableProps } from './types'

export interface TableExpose {
  setColumn: (columnProps: TableSetProps[]) => void
  addColumn: (column: TableColumn, index?: number) => void
  delColumn: (field: string) => void
  elTableRef: ComponentRef<typeof ElTable>
}

export { BaseTable }
