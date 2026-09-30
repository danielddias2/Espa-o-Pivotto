import { supabase } from '@/lib/supabase'

/**
 * Verifica de forma segura se o usuário autenticado possui privilégios de administrador.
 * 
 * Estratégia em camadas:
 * 1. RPC `is_admin()` no Supabase (verificação autoritativa no banco).
 * 2. Consulta direta na tabela `public.admin_users`.
 * 3. Validação defensiva de e-mail administrativo oficial / metadata.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // 1. Verificação via RPC is_admin() (preferencial)
    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (!error && typeof data === 'boolean') {
        return data
      }
    } catch {
      // Ignora falha de RPC se a função ainda não tiver sido criada no Supabase
    }

    // 2. Verificação direta na tabela admin_users
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

      if (!error && data) {
        return true
      }
    } catch {
      // Ignora se tabela ainda não existir
    }

    // 3. Fallback defensivo por e-mail administrativo oficial ou metadata
    const officialAdminEmails = [
      'contato@espacopivotto.com.br',
      'admin@espacopivotto.com.br',
      (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.toLowerCase(),
    ].filter(Boolean) as string[]

    const userEmail = user.email?.toLowerCase().trim()
    if (userEmail && officialAdminEmails.includes(userEmail)) {
      return true
    }

    // Metadados explícitos configurados no Supabase Auth
    if (
      user.app_metadata?.role === 'admin' ||
      user.app_metadata?.role === 'superadmin' ||
      user.user_metadata?.role === 'admin'
    ) {
      return true
    }

    return false
  } catch (err) {
    console.error('[Espaço Pivotto][checkIsAdmin] Erro na verificação:', err)
    return false
  }
}
