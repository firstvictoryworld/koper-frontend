export type FieldInterface = {
  value: any
  path?: string
  show?: () => boolean
  size?: number
  binds: Record<string, any>
  options?: Array<{ label: string; value: any }>
}
