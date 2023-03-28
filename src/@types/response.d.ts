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
      code: string
      business_name: string,
      city: string,
      vat_number: string,
      address: string,
      postal_code: string,
      province: string,
      structure_types: Array,
    },
    accesses: Array,
    deleted_at: datetime
  }
}
