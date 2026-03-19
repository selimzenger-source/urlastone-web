export interface Project {
  id: string
  project_name: string
  city: string
  country: string | null
  address: string | null
  lat: number
  lng: number
  description: string | null
  category: string
  product: string | null
  application_type: string | null
  contractor: string | null
  project_date: string | null
  photos: string[]
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type ProjectUpdate = Partial<ProjectInsert>
