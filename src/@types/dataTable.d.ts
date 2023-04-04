
type DatatableActionFunctionType = (row: DatatableRowInterface) => void
type DatatableShowFunctionType = (row: DatatableRowInterface) => boolean
type DatatableLoadingFunctionType = (row: DatatableRowInterface) => boolean
type DataTableBtnPropType = string | number | boolean | any[] | ((row: DatatableRowInterface) => any)

interface DatatableActionInterface {
  btnProps?: Record<string, DataTableBtnPropType>
  icon?: string
  color?: string
  handler: DatatableActionFunctionType
  show?: DatatableShowFunctionType
  loading?: DatatableLoadingFunctionType
}

export interface DatatableColInterface {
  label?: string
  key: string
  class?: string
  colProps?: any
  actions?: DatatableActionInterface[]
  enableFilter?: boolean
  filterOptions?: { label: string, value: string | number }[]
  enableSelectAll?: boolean
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
  resetSelectAll(): void
  loadData(): void
}

export interface DatatableFilter {
	key: string
	values: (string | number)[]
}
