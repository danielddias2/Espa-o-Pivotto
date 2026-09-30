import { supabase } from '@/lib/supabase'

/**
 * Verifica de forma autoritativa no Supabase se o usuário autenticado é administrador.
 * 
 * Fluxo estrito:
 * 1. Obter usuário autenticado da sessão atual (`supabase.auth.getUser()`).
 * 2. Se não houver usuário ou houver erro na sessão, retornar false.
 * 3. Chamar a RPC segura `public.is_admin()` no banco (executada com SECURITY DEFINER).
 * 4. Se a RPC retornar true, retornar true.
 * 5. Se a RPC retornar false, retornar false.
 * 6. Se ocorrer erro real na RPC, registrar log seguro (sem dados sensíveis) e retornar false.
 * 
 * Não utiliza e-mails hardcoded, variáveis de ambiente ou metadados de cliente para autorização.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return false
    }

    const { data, error } = await supabase.rpc('is_admin')

    if (error) {
      // Registra a mensagem de erro da RPC sem vazar tokens, senhas ou JWTs
      console.error('[Auth] Falha ao verificar administrador:', error.message || error)
      return false
    }

    if (data === true) {
      return true
    }

    return false
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado na verificação'
    console.error('[Auth] Erro inesperado ao verificar administrador:', message)
    return false
  }
}
