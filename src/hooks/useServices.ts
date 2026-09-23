import { useEffect, useState, useCallback } from 'react'
import { getActiveServices } from '@/services/clinicService'
import type { Service, LoadingState } from '@/types'

interface UseServicesResult {
  services: Service[]
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([])
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    try {
      const data = await getActiveServices()
      setServices(data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar serviços')
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { services, state, error, refetch: load }
}
