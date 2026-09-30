import { useState, useEffect, useCallback } from 'react'
import {
  getProfessionalsAdmin,
  createProfessional as apiCreateProfessional,
  updateProfessional as apiUpdateProfessional,
  setProfessionalActive as apiSetProfessionalActive,
  setProfessionalServices as apiSetProfessionalServices,
} from '@/services/clinicService'
import type {
  Professional,
  CreateProfessionalPayload,
  UpdateProfessionalPayload,
  LoadingState,
} from '@/types'

interface UseAdminProfessionalsResult {
  professionals: Professional[]
  loading: boolean
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
  setProfessionals: React.Dispatch<React.SetStateAction<Professional[]>>
  createProfessional: (payload: CreateProfessionalPayload) => Promise<Professional>
  updateProfessional: (payload: UpdateProfessionalPayload) => Promise<Professional>
  setProfessionalActive: (professionalId: string, active: boolean) => Promise<void>
  setProfessionalServices: (professionalId: string, serviceIds: string[]) => Promise<void>
}

/**
 * Hook para gestão administrativa de profissionais no painel do Espaço Pivotto.
 */
export function useAdminProfessionals(): UseAdminProfessionalsResult {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await getProfessionalsAdmin()
      setProfessionals(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais')
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createProfessional = useCallback(
    async (payload: CreateProfessionalPayload): Promise<Professional> => {
      const created = await apiCreateProfessional(payload)
      if (created && created.id) {
        setProfessionals((prev) => [created, ...prev])
      } else {
        await load()
      }
      return created
    },
    [load]
  )

  const updateProfessional = useCallback(
    async (payload: UpdateProfessionalPayload): Promise<Professional> => {
      const updated = await apiUpdateProfessional(payload)
      if (updated && updated.id) {
        setProfessionals((prev) =>
          prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        )
      } else {
        await load()
      }
      return updated
    },
    [load]
  )

  const setProfessionalActive = useCallback(
    async (professionalId: string, active: boolean): Promise<void> => {
      await apiSetProfessionalActive(professionalId, active)
      setProfessionals((prev) =>
        prev.map((p) => (p.id === professionalId ? { ...p, active } : p))
      )
    },
    []
  )

  const setProfessionalServices = useCallback(
    async (professionalId: string, serviceIds: string[]): Promise<void> => {
      await apiSetProfessionalServices(professionalId, serviceIds)
      await load()
    },
    [load]
  )

  return {
    professionals,
    loading: state === 'loading',
    state,
    error,
    refetch: load,
    setProfessionals,
    createProfessional,
    updateProfessional,
    setProfessionalActive,
    setProfessionalServices,
  }
}
