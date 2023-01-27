export interface UserLoginCredentials {
  email: string | null
  password: string | null
}

export interface UserData {
  email: string | null
  id: number | null
  authToken: string | null
  name: string | null
  surname: string | null
  type: number | null
  structureId: number | null
  structureStatus: number | null
}
