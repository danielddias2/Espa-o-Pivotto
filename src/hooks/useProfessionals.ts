import { useState, useEffect, useCallback } from 'react'
import {
  getActiveProfessionals,
  getProfessionalsByService,
} from '@/services/clinicService'
import type { Professional, LoadingState } from '@/types'

interface UseProfessionalsResult {
  professionals: Professional[]
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para consulta de profissionais ativas no site público.
 * Se serviceId for informado, filtra as profissionais que realizam aquele procedimento.
 */
export function useProfessionals(serviceId?: string): UseProfessionalsResult {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = serviceId
        ? await getProfessionalsByService(serviceId)
        : await getActiveProfessionals()
      setProfessionals(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar profissionais')
      setState('error')
    }
  }, [serviceId])

  useEffect(() => {
    load()
  }, [load])

  return { professionals, state, error, refetch: load }
}
