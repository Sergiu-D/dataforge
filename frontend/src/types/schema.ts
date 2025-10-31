export interface Field {
  id: string
  name: string
  type: string
  options?: Record<string, any>
}

export interface DataType {
  id: string
  name: string
  category: string
  hasOptions?: boolean
  options?: {
    min?: number
    max?: number
    word_count?: number
    values?: string[]
  }
}

export interface Schema {
  fields: Field[]
  rows: number
}

export interface GeneratedRow {
  [key: string]: string
}