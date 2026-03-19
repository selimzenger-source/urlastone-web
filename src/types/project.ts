export interface Project {
  id: string
  project_name: string
  city: string
  address: string | null
  lat: number
  lng: number
  description: string | null
  category: string
  photos: string[]
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type ProjectUpdate = Partial<ProjectInsert>
