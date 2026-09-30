import type { Professional, Service } from '@/types'

/**
 * Normaliza um número de telefone para o formato internacional do WhatsApp (apenas dígitos).
 * Se o número tiver 10 ou 11 dígitos (DDD + celular no Brasil), adiciona o DDI 55 automaticamente.
 */
export function cleanWhatsAppNumber(phone?: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''

  // Se já possui DDI 55 e tamanho de celular (12 ou 13 dígitos)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits
  }

  // DDD (2 dígitos) + Telefone (8 ou 9 dígitos) -> adiciona 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }

  return digits
}

interface GenerateWhatsAppLinkParams {
  service: Service
  professional?: Professional | null
  clinicWhatsApp?: string | null
}

/**
 * Gera o link direto para o WhatsApp oficial com procedimento e profissional codificados.
 * 
 * Regra estrita de prioridade:
 * 1. WhatsApp específico da profissional selecionada (`professional.whatsapp`)
 * 2. WhatsApp geral da clínica (`clinic_settings.whatsapp`)
 * 
 * Se NENHUM dos dois estiver configurado, retorna `null`.
 * Não utiliza nenhum telefone fictício, placeholder ou fallback externo não confirmado.
 */
export function generateProfessionalWhatsAppLink({
  service,
  professional,
  clinicWhatsApp,
}: GenerateWhatsAppLinkParams): string | null {
  // 1. Determina o número de destino respeitando a ordem de prioridade
  const rawTargetNumber = professional?.whatsapp?.trim() || clinicWhatsApp?.trim() || ''
  const cleanNumber = cleanWhatsAppNumber(rawTargetNumber)

  // Se nenhum número válido foi informado, retorna null (não inventar link)
  if (!cleanNumber) {
    return null
  }

  // 2. Monta o texto humanizado e profissional da mensagem
  const serviceName = service.name.trim()
  let messageText = ''

  if (professional && professional.name) {
    const profName = professional.name.trim()
    messageText = `Olá! Gostaria de saber mais sobre o procedimento ${serviceName} e gostaria de agendar com a ${profName}.`
  } else {
    messageText = `Olá! Gostaria de saber mais sobre o procedimento ${serviceName} e gostaria de agendar um horário.`
  }

  // 3. Codifica os parâmetros para a URL do WhatsApp
  const encodedText = encodeURIComponent(messageText)

  return `https://wa.me/${cleanNumber}?text=${encodedText}`
}

/**
 * Gera link simples para o WhatsApp geral da clínica, ou null se não configurado.
 */
export function getClinicWhatsAppLink(
  clinicWhatsApp?: string | null,
  message?: string
): string | null {
  const cleanNumber = cleanWhatsAppNumber(clinicWhatsApp)
  if (!cleanNumber) return null

  if (message && message.trim()) {
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message.trim())}`
  }

  return `https://wa.me/${cleanNumber}`
}
