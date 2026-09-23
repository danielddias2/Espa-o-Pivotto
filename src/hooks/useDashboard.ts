import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getAppointmentsAdmin,
  getClientsAdmin,
  getClinicSettings,
} from '@/services/clinicService'
import type {
  AdminAppointment,
  AdminClient,
  ClinicSettings,
  DashboardMetrics,
  LoadingState,
} from '@/types'
import { getTodayString } from '@/utils/formatters'

export function extractLocalDateString(iso?: string | null): string {
  if (!iso || typeof iso !== 'string') return ''
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

export interface UseDashboardResult {
  metrics: DashboardMetrics
  upcomingAppointments: AdminAppointment[]
  clinicSettings: ClinicSettings | null
  totalClients: AdminClient[]
  state: LoadingState
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardResult {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [clients, setClients] = useState<AdminClient[]>([])
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null)
  const [state, setState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setState('loading')
    setError(null)

    try {
      const [appointmentsResult, clientsResult, settingsResult] =
        await Promise.allSettled([
          getAppointmentsAdmin(),
          getClientsAdmin(),
          getClinicSettings(),
        ])

      let hasAnySuccess = false
      const errorMessages: string[] = []

      if (appointmentsResult.status === 'fulfilled') {
        const raw = appointmentsResult.value
        setAppointments(Array.isArray(raw) ? raw : [])
        hasAnySuccess = true
      } else {
        errorMessages.push('agendamentos')
      }

      if (clientsResult.status === 'fulfilled') {
        const raw = clientsResult.value
        setClients(Array.isArray(raw) ? raw : [])
        hasAnySuccess = true
      } else {
        errorMessages.push('clientes')
      }

      if (settingsResult.status === 'fulfilled') {
        setClinicSettings(settingsResult.value ?? null)
        hasAnySuccess = true
      } else {
        errorMessages.push('configurações')
      }

      if (hasAnySuccess) {
        setState('success')
        if (errorMessages.length > 0) {
          setError(`Aviso: falha parcial ao carregar (${errorMessages.join(', ')})`)
        }
      } else {
        setState('error')
        setError('Não foi possível conectar ao Supabase.')
      }
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const metrics = useMemo<DashboardMetrics>(() => {
    const today = getTodayString()

    if (!Array.isArray(appointments)) {
      return {
        todayAppointmentsCount: 0,
        pendingCount: 0,
        confirmedCount: 0,
        totalClientsCount: Array.isArray(clients) ? clients.length : 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
        totalAppointmentsCount: 0,
      }
    }

    const todayAppointments = appointments.filter((a) => {
      if (!a || !a.start_at) return false
      return extractLocalDateString(a.start_at) === today
    })

    const pending = appointments.filter((a) => a?.status === 'pending')
    const confirmed = appointments.filter((a) => a?.status === 'confirmed')
    const completed = appointments.filter((a) => a?.status === 'completed')
    const cancelled = appointments.filter((a) => a?.status === 'cancelled')
    const noShow = appointments.filter((a) => (a?.status as string) === 'no_show')

    return {
      todayAppointmentsCount: todayAppointments.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      totalClientsCount: Array.isArray(clients) ? clients.length : 0,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      noShowCount: noShow.length,
      totalAppointmentsCount: appointments.length,
    }
  }, [appointments, clients])

  const upcomingAppointments = useMemo<AdminAppointment[]>(() => {
    if (!Array.isArray(appointments) || appointments.length === 0) return []

    const now = Date.now()

    const activeList = appointments.filter((a) => {
      if (!a || !a.start_at) return false
      const isPendingOrConfirmed = a.status === 'pending' || a.status === 'confirmed'
      if (!isPendingOrConfirmed) return false

      const appStartTime = new Date(a.start_at).getTime()
      if (isNaN(appStartTime)) return false
      return appStartTime > now
    })

    activeList.sort((a, b) => {
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    })

    return activeList.slice(0, 6)
  }, [appointments])

  return {
    metrics,
    upcomingAppointments,
    clinicSettings,
    totalClients: clients,
    state,
    error,
    refetch: loadData,
  }
}
