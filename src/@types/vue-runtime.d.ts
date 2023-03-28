declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filters: Record<string, (...args: any) => string>
  }
}

export {}
