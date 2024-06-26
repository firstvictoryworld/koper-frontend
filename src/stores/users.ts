import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import type { LoginResponse, UserData } from '@/@types'
import UserTypes from '@/enums/UserTypesEnum'
import StructureStatusEnum from '@/enums/StructureStatusEnum'

const adminRoles = [
  UserTypes.BACKOFFICE,
  UserTypes.FONDO
]

const structureRoles = [
  UserTypes.STRUTTURA,
  UserTypes.UTENTE
]

// const structureCompletedStatuses = [
//   StructureStatusEnum.COMPLETED,
//   StructureStatusEnum.NOT_COMPLETED,
// ]

export const useUsersStore = defineStore('users', () => {
  // State/Variables

  const userDetails: Ref<UserData> = ref({
    email: null,
    id: null,
    authToken: null,
    name: null,
    surname: null,
    type: null,
    structureId: null,
    structureStatus: null,
    accesses: [],
    structureCompanies: [],
    structureCode: null,
    structurePostalCode: null,
    structureVatNumber: null,
    structureProvince: null,
    structureCity: null,
    deletedAt: null
  })

  // Getters/Computed

  const isLogged = computed(() => !!userDetails.value.id && !userDetails.value.deletedAt)
  const isAdmin = computed(() => !!userDetails.value.id && adminRoles.includes(userDetails.value.type || 0))
  const isFondo = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.FONDO)
  const isBackoffice = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.BACKOFFICE)
  const isStruttura = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.STRUTTURA)
  const isUtente = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.UTENTE)
  const isStructureOrUser = computed(() => !!userDetails.value.id && structureRoles.includes(userDetails.value.type || 0))
  const role = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.FONDO ? 'Fondo' : !!userDetails.value.id && userDetails.value.type === UserTypes.BACKOFFICE ? 'Admin' : !!userDetails.value.id && userDetails.value.type === UserTypes.STRUTTURA ?'Struttura' : 'Utente')
  const hasAccesses = computed(() => !!userDetails.value.accesses)
  
  const bearerToken = computed(() => userDetails.value.id ? `Bearer ${userDetails.value.authToken}` : '')
  const initials = computed(() => {
    return userDetails.value.id
      ? `${(userDetails.value.name || '').charAt(0)}${(userDetails.value.surname || '').charAt(0)}`
      : ''
  })
  const structureRejected = computed(
    () => isStruttura.value && userDetails.value.structureStatus === StructureStatusEnum.REJECTED
  )
  const structureNotApproved = computed(
    () => isStruttura.value && userDetails.value.structureStatus === StructureStatusEnum.NOT_APPROVED
  )
  const structureNotCompleted = computed(
    () => isStruttura.value && userDetails.value.structureStatus === StructureStatusEnum.NOT_COMPLETED
  )
  const structureCompleted = computed(
    () => isAdmin.value || userDetails.value.structureStatus === StructureStatusEnum.COMPLETED
  )

  const structureClosed = computed(
    () => isAdmin.value || userDetails.value.structureStatus === StructureStatusEnum.CLOSED
  )

  const structureTypes = computed(
    () => {
      if (isStruttura.value || isUtente.value ){
      return  userDetails.value.structureCompanies.map((company: any) => company.type)
      }
    }
  )

  // Actions/Functions

  const assignUserDetails = (response: LoginResponse, update: boolean = false) => {
    const _data = {} as UserData
    const { jwt } = response
    const { email, id, name, surname, type, structure_data, accesses, deleted_at } = response.data
    const { id: structureId, status: structureStatus, code: structureCode, business_name: structureBusinessName, 
            city: structureCity, vat_number: structureVatNumber, address: structureAddress, postal_code: structurePostalCode, 
            province: structureProvince, structure_types: structureCompanies } = structure_data || {}

    if (!update) {
      Object.assign(
        _data,
        { authToken: jwt },
        { email, id, name, surname, type, structureId, structureStatus, accesses, deleted_at, 
          structureCode, structureBusinessName, structureCity, structureVatNumber, structureAddress, structureCompanies }
      )
    } else {
      Object.assign(
        _data,
        {
          authToken: jwt || userDetails.value.authToken,
          email: email || userDetails.value.email,
          id: id || userDetails.value.id,
          name: name || userDetails.value.name,
          surname: surname || userDetails.value.surname,
          type: type || userDetails.value.type,
          structureId: structureId || userDetails.value.structureId,
          structureStatus: structureStatus || userDetails.value.structureStatus,
          structureCompanies: structureCompanies || userDetails.value.structureCompanies,
          accesses: accesses || userDetails.value.accesses,
          deletedAt: deleted_at || userDetails.value.deletedAt,
          structureCode: structureCode || userDetails.value.structureCode,
          structureBusinessName: structureBusinessName || userDetails.value.structureBusinessName,
          structureCity: structureCity || userDetails.value.structureCity,
          structureVatNumber: structureVatNumber || userDetails.value.structureVatNumber,
          structureAddress: structureAddress || userDetails.value.structureAddress,
          structurePostalCode: structurePostalCode || userDetails.value.structurePostalCode,
          structureProvince: structureProvince || userDetails.value.structureProvince
        }
      )
    }

    userDetails.value = _data
  }

  const logout = () => {
    const userKeys = Object.keys(userDetails.value)
    userKeys.forEach((key) => {
      userDetails.value[key as keyof UserData] = null
    })
  }

  return {
    assignUserDetails,
    isAdmin,
    isStructureOrUser,
    isFondo,
    isBackoffice,
    isStruttura,
    isUtente,
    isLogged,
    logout,
    userDetails,
    initials,
    role,
    bearerToken,
    structureRejected,
    structureNotApproved,
    structureNotCompleted,
    structureCompleted,
    structureClosed,
    structureTypes
  }
}, {
  persist: true
})
