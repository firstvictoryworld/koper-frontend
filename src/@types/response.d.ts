export interface LoginResponse {
  jwt: string
  data: {
    id: number
    name: string
    surname: string
    email: string
    email_verified_at: string
    created_at: string
    updated_at: string
    type: number
    structure_data: {
      id: number
      status: number
    }
  }
}
