-- ==============================================================================
-- ESPAÇO PIVOTTO — RPC AUTORIZATIVA: public.is_admin()
-- Arquivo: supabase/migrations/20260930_is_admin_rpc.sql
-- ==============================================================================
-- Cria a função canônica public.is_admin() com SECURITY DEFINER.
-- A função verifica de forma autoritativa no PostgreSQL se o usuário
-- autenticado atual (auth.uid()) está cadastrado em public.admin_users com role = 'admin'.
-- Não recebe parâmetros (não recebe UUID nem email do cliente).
-- ==============================================================================

-- 1. Remove qualquer versão anterior com parâmetros ou assinatura divergente
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Criação da RPC segura e canônica
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 3. Comentário descritivo na função
COMMENT ON FUNCTION public.is_admin() IS 'Verifica com SECURITY DEFINER se o usuário autenticado atual (auth.uid()) possui role admin na tabela public.admin_users.';

-- 4. Permissões de execução:
-- Concede permissão de execução a usuários autenticados e service_role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Revoga execução anônima pública (usuários não logados recebem 404/403 do PostgREST)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
