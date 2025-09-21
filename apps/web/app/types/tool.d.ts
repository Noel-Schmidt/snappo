export interface ToolMeta {
  slug: string
  title: string
  badge?: string
  description: string
  component: string
  tags?: string[]
  status?: 'stable' | 'beta'
  accent?: string
}
