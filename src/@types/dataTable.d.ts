
type DatatableActionFunctionType = (row: DatatableRowInterface) => void
type DatatableShowFunctionType = (row: DatatableRowInterface) => boolean
type DataTableBtnPropType = string | number | boolean | any[] | ((row: DatatableRowInterface) => any)

interface DatatableActionInterface {
  btnProps?: Record<string, DataTableBtnPropType>
  icon?: string
  color?: string
  handler: DatatableActionFunctionType
  show?: DatatableShowFunctionType
}

export interface DatatableColInterface {
  label?: string
  key: string
  class?: string
  colProps?: any
  actions?: DatatableActionInterface[]
}

export interface DatatableRowInterface {
  [key: string]: any
}

export interface DatatableStampInterface {
  name: string
  quantity?: number
  total_stamp?: number
}

export interface DatatableComponent {
  loadData(): void
}
