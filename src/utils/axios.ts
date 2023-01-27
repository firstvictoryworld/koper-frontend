import axios, { type Axios } from "axios"
import type { InjectionKey } from "vue"

export const axiosInjectKey = Symbol('$axios injection key') as InjectionKey<Axios>

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BASE_URL}${import.meta.env.VITE_APP_API_PATH}`,
  withCredentials: true
})

export default axiosInstance
