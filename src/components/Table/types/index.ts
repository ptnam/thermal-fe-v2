import { TableProps as ElTableProps } from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import type { VNode } from 'vue'

export type TableColumn = Partial<TableColumnCtx<any>> & {
  hidden?: boolean
  slots?: {
    [key: string]: (scope: any) => VNode
  }
}

export interface TableSlotDefault {
  row: Recordable
  column: TableColumn

  [key: string]: any
}

export interface TableSetProps {
  field: string
  path: string
  value: any
}

type Recordable = Record<string, any>

export type TableProps<T = Recordable> = ElTableProps<any> & {
  columns?: TableColumn[]
  data?: T[]
  loading?: boolean
}
