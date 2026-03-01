<script lang="tsx">
import {defineComponent, ref, unref, onMounted} from 'vue'
import {ElTable, ElTableColumn} from 'element-plus'
import type {TableColumn} from './types'

export default defineComponent({
  name: 'BaseTable',
  props: {
    columns: {
      type: Array as () => TableColumn[],
      default: () => [],
    },
    data: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['register'],
  setup(props, {emit, attrs, expose}) {
    const elTableRef = ref<InstanceType<typeof ElTable>>()

    onMounted(() => {
      const tableRef = unref(elTableRef)
      emit('register', tableRef?.$parent, elTableRef)
    })

    const addColumn = (column: TableColumn, index?: number) => {
      if (index !== void 0) {
        props.columns.splice(index, 0, column)
      } else {
        props.columns.push(column)
      }
    }

    const delColumn = (field: string) => {
      const index = props.columns.findIndex((item) => item.prop === field)
      if (index > -1) {
        props.columns.splice(index, 1)
      }
    }

    expose({
      elTableRef,
      addColumn,
      delColumn,
    })

    const renderColumn = (col: TableColumn, idx: number) => {
      const {slots = {}, children, hidden, ...columnProps} = col

      if (hidden) return null

      // Recursive rendering for nested columns
      if (children?.length) {
        return (
            <ElTableColumn
                key={col.prop ?? col.label ?? idx}
                {...columnProps}
            >
              {renderColumns(children)}
            </ElTableColumn>
        )
      }

      return (
          <ElTableColumn
              key={col.prop ?? col.label ?? idx}
              {...columnProps}
              v-slots={slots}
          />
      )
    }

    const renderColumns = (columns: TableColumn[] = props.columns) => {
      return columns.map((col, idx) => renderColumn(col, idx))
    }

    return () => (
        <ElTable
            ref={elTableRef}
            data={props.data}
            v-loading={props.loading}
            {...attrs}
            rowClassName="bg-(--bg-body)"
            cellClassName="py-3 px-[15px]"
        >
          {renderColumns()}
        </ElTable>
    )
  },
})
</script>
