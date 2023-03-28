import { get, map, set, update } from "lodash"
import { inject, provide, type InjectionKey, type UnwrapNestedRefs } from "vue"
import type { LendingInterface, LendingAgreededInterface } from "./LendingComponent.vue"

export interface LendingListInterface {
  list: LendingInterface[]
  agreeded?: LendingAgreededInterface[]
}

const lendingInjectionKey = Symbol('$lending injection key') as InjectionKey<UnwrapNestedRefs<LendingListInterface>>

export const provideLendingsListObject = (list : LendingListInterface) => {
  provide(lendingInjectionKey, list)
}

export const getLendingsListObject = () => {
  return inject(lendingInjectionKey)
}

export const getPath = (indexes: number[], append?: string): string => {
  let path = 'list'
  if (indexes.length) {
    path += `[${indexes.reverse().join('].children[')}]`
  }
  if (path.length && append) {
    path += `.${append}`
  }
  return path
}

export const getParent = (lendingsList: LendingListInterface, indexes: number[]) => {
  const data = { parentPath: null, parentNode: null } as { parentPath: null|string, parentNode: null|LendingInterface }

  if (indexes.length <= 1) { return data }

  const _indexes = indexes.slice(0, -1).reverse()

  data.parentPath = getPath(_indexes)
  data.parentNode = get(lendingsList, data.parentPath)
  
  return data
}

export const addLending = (lendingsList: LendingListInterface, indexes: number[] = [], asCategory: boolean = false) => {  
  const _indexes = [...indexes]

  _indexes.reverse()
  _indexes[0] += 1
  const path = getPath(_indexes)
  const { parentPath, parentNode } = getParent(lendingsList, _indexes)

  console.log(path, parentPath, parentNode)
  
  set(lendingsList, path, {
    id: null,
    code: '',
    name: '',
    children: [],
    parent_id: parentNode ? parentNode.id : null,
    inpatient: 0,
    outpatient: 0,
    dentistry: 0,
    prevention: 0,
    serious_illness: 0,
    lending_cost: undefined,
    refund_value: undefined,
    deleted_at: null,
    is_category: asCategory,
    editing: true,
    percentage: 0,
  } as LendingInterface)
}

export const setEditing = (lendingsList: LendingListInterface, indexes: number[], editing?: boolean) => {
  const _indexes = [...indexes]

  _indexes.reverse()
  const path = getPath(_indexes)
  
  update(lendingsList, path, (data: LendingInterface) => ({ ...data, editing: editing !== undefined ? editing : !data.editing }))
}

export const updateLending = (lendingsList: LendingListInterface, indexes: number[], key: keyof LendingInterface, value: any) => {
  const _indexes = [...indexes]

  _indexes.reverse()
  const path = getPath(_indexes)
  
  update(lendingsList, path, (data: LendingInterface) => ({ ...data, [key]: value }))
}

export const removeLending = (lendingsList: LendingListInterface, indexes: number[] = []) => {
  const _indexes = [...indexes]

  const i = _indexes.pop()

  _indexes.reverse()
  const path = getPath(_indexes) + '.children'
  const list = get(lendingsList, path)

  list.splice(i, 1)
}

export const setupList = (children: LendingInterface[]): LendingInterface[] => {
  return map(children, (child) => ({
    ...child,
    is_category: child.children.length > 0,
    type: setupType(child),
    children: setupList(child.children)
  }))
}

export const setupType = (data: Partial<LendingInterface>): string => {
  return data.inpatient ? 'inpatient' :
    data.outpatient ? 'outpatient' :
    data.dentistry ? 'dentistry' :
    data.prevention ? 'prevention' :
    data.serious_illness ? 'serious_illness' :
    ''
}
