import { supabase } from '@/lib/supabase'

const PROFESSIONALS_BUCKET = 'professionals'
const PROCEDURE_IMAGES_BUCKET = 'procedure-images'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadPhotoResult {
  url: string
  path: string
}

/**
 * Valida o arquivo de imagem antes do envio.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Selecione uma imagem JPG, PNG ou WebP.',
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Arquivo muito grande. O tamanho máximo permitido é 5 MB.',
    }
  }

  return { valid: true }
}

/**
 * Realiza o upload de uma foto de profissional para o Supabase Storage.
 * Retorna a URL pública de acesso.
 */
export async function uploadProfessionalPhoto(
  file: File,
  professionalId?: string
): Promise<string> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const idPrefix = professionalId ? professionalId.slice(0, 8) : Date.now().toString()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const fileName = `prof_${idPrefix}_${randomSuffix}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(PROFESSIONALS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    // Tratamento amigável para quando o bucket ainda não tiver sido criado no Supabase
    if (uploadError.message?.toLowerCase().includes('not found') || (uploadError as { statusCode?: number }).statusCode === 404) {
      throw new Error(
        'O bucket de armazenamento "professionals" ainda não foi criado no Supabase. Crie o bucket no painel ou informe a URL direta da imagem.'
      )
    }
    throw new Error(`Falha no upload da foto: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROFESSIONALS_BUCKET)
    .getPublicUrl(fileName)

  if (!publicUrlData?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública da imagem enviada.')
  }

  return publicUrlData.publicUrl
}

/**
 * Remove a foto do Supabase Storage caso tenha sido enviada para o bucket oficial.
 */
export async function deleteProfessionalPhoto(photoUrl: string): Promise<void> {
  if (!photoUrl || !photoUrl.includes(`/${PROFESSIONALS_BUCKET}/`)) {
    return
  }

  try {
    const parts = photoUrl.split(`/${PROFESSIONALS_BUCKET}/`)
    if (parts.length > 1) {
      const filePath = parts[1].split('?')[0]
      if (filePath) {
        await supabase.storage.from(PROFESSIONALS_BUCKET).remove([filePath])
      }
    }
  } catch (err) {
    console.warn('[Espaço Pivotto][Storage] Erro ao remover foto antiga:', err)
  }
}

// ── Imagens de Procedimentos (bucket: procedure-images) ──────

/**
 * Realiza o upload de uma imagem de procedimento para o Supabase Storage.
 * Arquivos organizados em: procedures/{serviceId}/{nome-único}.ext
 * Retorna a URL pública de acesso.
 */
export async function uploadServiceImage(
  file: File,
  serviceId?: string
): Promise<string> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const randomSuffix = Math.random().toString(36).substring(2, 10)
  const timestamp = Date.now()
  const prefix = serviceId ? serviceId.slice(0, 8) : 'new'
  const filePath = `procedures/${prefix}/${timestamp}_${randomSuffix}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(PROCEDURE_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    if (
      uploadError.message?.toLowerCase().includes('not found') ||
      (uploadError as { statusCode?: number }).statusCode === 404
    ) {
      throw new Error(
        'O bucket de armazenamento "procedure-images" ainda não foi criado no Supabase. Crie o bucket no painel ou informe a URL direta da imagem.'
      )
    }
    throw new Error(`Falha no upload da imagem: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROCEDURE_IMAGES_BUCKET)
    .getPublicUrl(filePath)

  if (!publicUrlData?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública da imagem enviada.')
  }

  return publicUrlData.publicUrl
}

/**
 * Remove a imagem de procedimento do Supabase Storage.
 * Aceita a URL pública completa e extrai o path relativo.
 */
export async function deleteServiceImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes(`/${PROCEDURE_IMAGES_BUCKET}/`)) {
    return
  }

  try {
    const parts = imageUrl.split(`/${PROCEDURE_IMAGES_BUCKET}/`)
    if (parts.length > 1) {
      const filePath = parts[1].split('?')[0]
      if (filePath) {
        await supabase.storage.from(PROCEDURE_IMAGES_BUCKET).remove([filePath])
      }
    }
  } catch (err) {
    console.warn('[Espaço Pivotto][Storage] Erro ao remover imagem de procedimento:', err)
  }
}

