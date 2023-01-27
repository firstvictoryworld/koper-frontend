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
    structureStatus: null
  })

  // Getters/Computed

  const isLogged = computed(() => !!userDetails.value.id)
  const isAdmin = computed(() => !!userDetails.value.id && adminRoles.includes(userDetails.value.type || 0))
  const isFondo = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.FONDO)
  const isBackoffice = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.BACKOFFICE)
  const isStruttura = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.STRUTTURA)
  const role = computed(() => !!userDetails.value.id && userDetails.value.type === UserTypes.FONDO ? 'Fondo' : !!userDetails.value.id && userDetails.value.type === UserTypes.BACKOFFICE ? 'Admin' : 'Struttura')
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

  // Actions/Functions

  const assignUserDetails = (response: LoginResponse, update: boolean = false) => {
    const _data = {} as UserData
    const { jwt } = response
    const { email, id, name, surname, type, structure_data } = response.data
    const { id: structureId, status: structureStatus } = structure_data || {}

    if (!update) {
      Object.assign(
        _data,
        { authToken: jwt },
        { email, id, name, surname, type, structureId, structureStatus }
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
    isFondo,
    isBackoffice,
    isStruttura,
    isLogged,
    logout,
    userDetails,
    initials,
    role,
    bearerToken,
    structureRejected,
    structureNotApproved,
    structureNotCompleted,
    structureCompleted
  }
}, {
  persist: true
})
