
type DatatableActionFunction = (row: DatatableRowInterface) => void

interface DatatableActionInterface {
  btnProps?: Record<string, any>
  icon?: string
  color?: string
  handler: DatatableActionFunction
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

export interface DatatableComponent {
  loadData(): void
}
