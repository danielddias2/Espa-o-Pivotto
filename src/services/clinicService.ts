import { supabase } from '@/lib/supabase'
import type {
  Service,
  AvailableSlot,
  CreateAppointmentPayload,
  ClinicSettings,
  UpdateClinicSettingsPayload,
  CreateServicePayload,
  UpdateServicePayload,
  AdminAppointment,
  AppointmentStatus,
  AdminClient,
  CreateClientPayload,
  UpdateClientPayload,
  Professional,
  CreateProfessionalPayload,
  UpdateProfessionalPayload,
} from '@/types'

// ── Serviços ativos ───────────────────────────────────────────

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase.rpc('get_active_services')
  if (error) throw error
  return (data as Service[]) ?? []
}

// ── Horários disponíveis ──────────────────────────────────────

export async function getAvailableSlots(
  serviceId: string,
  date: string, // formato: 'YYYY-MM-DD'
  professionalId?: string | null
): Promise<AvailableSlot[]> {
  const params: Record<string, unknown> = {
    p_service_id: serviceId,
    p_date: date,
  }
  if (professionalId) {
    params.p_professional_id = professionalId
  }
  const { data, error } = await supabase.rpc('get_available_slots', params)
  if (error) throw error
  return (data as AvailableSlot[]) ?? []
}

// ── Criar agendamento público ─────────────────────────────────

export async function createPublicAppointment(
  payload: CreateAppointmentPayload
): Promise<void> {
  const params: Record<string, unknown> = {
    p_name: payload.p_name,
    p_phone: payload.p_phone,
    p_email: payload.p_email ?? null,
    p_service_id: payload.p_service_id,
    p_start_at: payload.p_start_at,
    p_notes: payload.p_notes ?? null,
  }
  if (payload.p_professional_id) {
    params.p_professional_id = payload.p_professional_id
  }
  const { error } = await supabase.rpc('create_public_appointment', params)
  if (error) throw error
}

// ── Configurações da clínica / espaço ─────────────────────────

export async function getClinicSettings(): Promise<ClinicSettings | null> {
  const { data, error } = await supabase.rpc('get_clinic_settings')
  if (error) throw error
  if (Array.isArray(data)) return (data[0] as ClinicSettings) ?? null
  return (data as ClinicSettings) ?? null
}

export async function updateClinicSettings(
  payload: UpdateClinicSettingsPayload
): Promise<void> {
  const clinicName = payload.p_clinic_name ?? payload.clinic_name ?? ''
  const professionalName = payload.p_professional_name ?? (payload.professional_name as string | undefined)
  const bookingEnabled = payload.p_booking_enabled ?? (payload.booking_enabled as boolean | undefined)
  const minNoticeHours = payload.p_min_notice_hours ?? (payload.min_notice_hours as number | undefined)
  const maxAdvanceDays = payload.p_max_advance_days ?? (payload.max_advance_days as number | undefined)
  const slotIntervalMinutes = payload.p_slot_interval_minutes ?? (payload.slot_interval_minutes as number | undefined)

  const params: Record<string, unknown> = {
    p_clinic_name: clinicName,
  }

  if (professionalName !== undefined) params.p_professional_name = professionalName
  if (bookingEnabled !== undefined) params.p_booking_enabled = bookingEnabled
  if (minNoticeHours !== undefined) params.p_min_notice_hours = minNoticeHours
  if (maxAdvanceDays !== undefined) params.p_max_advance_days = maxAdvanceDays
  if (slotIntervalMinutes !== undefined) params.p_slot_interval_minutes = slotIntervalMinutes

  const { error } = await supabase.rpc('update_clinic_settings', params)
  if (error) throw error
}


// ── Admin: Gestão de Serviços ─────────────────────────────────

export async function getServicesAdmin(): Promise<Service[]> {
  const { data, error } = await supabase.rpc('get_services_admin')
  if (error) throw error
  return (data as Service[]) ?? []
}

export async function createService(
  payload: CreateServicePayload
): Promise<Service> {
  const { data, error } = await supabase.rpc('create_service', {
    p_name: payload.p_name,
    p_slug: payload.p_slug,
    p_duration_minutes: payload.p_duration_minutes,
    p_price: payload.p_price ?? null,
    p_description: payload.p_description ?? null,
    p_image_url: payload.p_image_url ?? null,
  })
  if (error) throw error
  return data as Service
}

export async function updateService(
  payload: UpdateServicePayload
): Promise<Service> {
  const { data, error } = await supabase.rpc('update_service', {
    p_service_id: payload.p_service_id,
    p_name: payload.p_name,
    p_slug: payload.p_slug,
    p_duration_minutes: payload.p_duration_minutes,
    p_price: payload.p_price,
    p_description: payload.p_description,
    p_image_url: payload.p_image_url,
  })
  if (error) throw error
  return data as Service
}

export async function setServiceActive(
  serviceId: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase.rpc('set_service_active', {
    p_service_id: serviceId,
    p_active: active,
  })
  if (error) throw error
}

// ── Admin: Gestão da Agenda ───────────────────────────────────

export async function getAppointmentsAdmin(): Promise<AdminAppointment[]> {
  const { data, error } = await supabase.rpc('get_appointments_admin')
  if (error) throw error
  return (data as AdminAppointment[]) ?? []
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  const { error } = await supabase.rpc('update_appointment_status', {
    p_appointment_id: appointmentId,
    p_new_status: status,
  })
  if (error) throw error
}

// ── Admin: Gestão de Clientes ─────────────────────────────────

export async function getClientsAdmin(): Promise<AdminClient[]> {
  const { data, error } = await supabase.rpc('get_clients_admin')
  if (error) throw error
  return (data as AdminClient[]) ?? []
}

export async function createClient(
  payload: CreateClientPayload
): Promise<AdminClient> {
  const { data, error } = await supabase.rpc('create_client', {
    p_name: payload.p_name,
    p_phone: payload.p_phone,
    p_email: payload.p_email ?? null,
  })
  if (error) throw error
  return data as AdminClient
}

export async function updateClient(
  payload: UpdateClientPayload
): Promise<AdminClient> {
  const { data, error } = await supabase.rpc('update_client', {
    p_client_id: payload.p_client_id,
    p_name: payload.p_name,
    p_phone: payload.p_phone,
    p_email: payload.p_email ?? null,
  })
  if (error) throw error
  return data as AdminClient
}

export async function deleteClient(clientId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_client', {
    p_client_id: clientId,
  })
  if (error) {
    if (import.meta.env.DEV) {
      console.error('[Espaço Pivotto][deleteClient] Erro:', error)
    }
    throw error
  }
}

export async function getClientAppointments(
  clientId: string
): Promise<AdminAppointment[]> {
  const { data, error } = await supabase
    .rpc('get_appointments_admin')
    .eq('client_id', clientId)
  if (error) throw error
  return (data as AdminAppointment[]) ?? []
}

// ── Profissionais: Consulta Pública & Filtros ──────────────────

export async function getActiveProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase.rpc('get_active_professionals')
  if (error) throw error
  return (data as Professional[]) ?? []
}

export async function getProfessionalsByService(
  serviceId: string
): Promise<Professional[]> {
  const { data, error } = await supabase.rpc('get_professionals_by_service', {
    p_service_id: serviceId,
  })
  if (error) throw error
  return (data as Professional[]) ?? []
}

export async function getServicesByProfessional(
  professionalId: string
): Promise<Service[]> {
  const { data, error } = await supabase.rpc('get_services_by_professional', {
    p_professional_id: professionalId,
  })
  if (error) throw error
  return (data as Service[]) ?? []
}

// ── Profissionais: Gestão Administrativa ───────────────────────

export async function getProfessionalsAdmin(): Promise<Professional[]> {
  const { data, error } = await supabase.rpc('get_professionals_admin')
  if (error) throw error
  return (data as Professional[]) ?? []
}

export async function createProfessional(
  payload: CreateProfessionalPayload
): Promise<Professional> {
  const { data, error } = await supabase.rpc('create_professional', {
    p_name: payload.p_name,
    p_photo_url: payload.p_photo_url ?? null,
    p_specialty: payload.p_specialty ?? null,
    p_bio: payload.p_bio ?? null,
    p_whatsapp: payload.p_whatsapp ?? null,
  })
  if (error) throw error
  return data as Professional
}

export async function updateProfessional(
  payload: UpdateProfessionalPayload
): Promise<Professional> {
  const { data, error } = await supabase.rpc('update_professional', {
    p_professional_id: payload.p_professional_id,
    p_name: payload.p_name,
    p_photo_url: payload.p_photo_url ?? null,
    p_specialty: payload.p_specialty ?? null,
    p_bio: payload.p_bio ?? null,
    p_whatsapp: payload.p_whatsapp ?? null,
  })
  if (error) throw error
  return data as Professional
}

export async function setProfessionalActive(
  professionalId: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase.rpc('set_professional_active', {
    p_professional_id: professionalId,
    p_active: active,
  })
  if (error) throw error
}

export async function setProfessionalServices(
  professionalId: string,
  serviceIds: string[]
): Promise<void> {
  const { error } = await supabase.rpc('set_professional_services', {
    p_professional_id: professionalId,
    p_service_ids: serviceIds,
  })
  if (error) throw error
}

