-- ==============================================================================
-- ESPAÇO PIVOTTO — SISTEMA DE AUTORIZAÇÃO E SEGURANÇA ADMINISTRATIVA
-- Arquivo: supabase/admin_authorization.sql
-- ==============================================================================
-- Este script implementa:
-- 1. Tabela public.admin_users para controle estrito de administradores
-- 2. Políticas de Row Level Security (RLS) impeditivas para não-administradores
-- 3. Função segura public.is_admin() (SECURITY DEFINER)
-- 4. Proteção contra execução anônima e não-autorizada em todas as RPCs administrativas
-- ==============================================================================

-- 1. TABELA DE ADMINISTRADORES
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado só pode consultar se o seu próprio ID é administrador
DROP POLICY IF EXISTS "Admins can view own record" ON public.admin_users;
CREATE POLICY "Admins can view own record"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 2. FUNÇÃO SEGURA IS_ADMIN()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 1. Verifica se o usuário autenticado está na tabela admin_users
    IF EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Fallback por e-mail oficial registrado em auth.users
    IF EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
          AND LOWER(email) IN ('contato@espacopivotto.com.br', 'admin@espacopivotto.com.br')
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- Restringe execução de is_admin apenas a usuários autenticados e service_role
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 3. REVOGAR EXECUÇÃO ANÔNIMA EM TODAS AS RPCS ADMINISTRATIVAS
REVOKE ALL ON FUNCTION public.get_services_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_service(TEXT, TEXT, INTEGER, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_service(UUID, TEXT, TEXT, INTEGER, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_service_active(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_appointments_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_appointment_status(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_clients_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_client(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_client(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_client(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_clinic_settings(TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;

-- Conceder apenas a authenticated e service_role
GRANT EXECUTE ON FUNCTION public.get_services_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_service(TEXT, TEXT, INTEGER, NUMERIC, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_service(UUID, TEXT, TEXT, INTEGER, NUMERIC, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_service_active(UUID, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_appointments_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_appointment_status(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_clients_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_client(TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_client(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_client(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_clinic_settings(TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 4. ATUALIZAR AS RPCS PARA BLOQUEAR EXECUÇÃO POR USUÁRIOS AUTENTICADOS NÃO-ADMINISTRADORES

-- 4.1. get_services_admin()
CREATE OR REPLACE FUNCTION public.get_services_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    duration_minutes INTEGER,
    price NUMERIC(10,2),
    description TEXT,
    image_url TEXT,
    active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários.' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.slug,
        s.duration_minutes,
        s.price,
        s.description,
        s.image_url,
        s.active,
        s.created_at,
        s.updated_at
    FROM public.services s
    ORDER BY s.created_at DESC;
END;
$$;

-- 4.2. get_appointments_admin()
CREATE OR REPLACE FUNCTION public.get_appointments_admin()
RETURNS TABLE (
    appointment_id UUID,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ,
    client_id UUID,
    client_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    service_id UUID,
    service_name TEXT,
    duration_minutes INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários.' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        a.id AS appointment_id,
        a.start_at,
        a.end_at,
        a.status,
        a.notes,
        a.created_at,
        c.id AS client_id,
        c.name AS client_name,
        c.phone AS client_phone,
        c.email AS client_email,
        s.id AS service_id,
        s.name AS service_name,
        s.duration_minutes
    FROM public.appointments a
    JOIN public.clients c ON a.client_id = c.id
    JOIN public.services s ON a.service_id = s.id
    ORDER BY a.start_at ASC;
END;
$$;

-- 4.3. get_clients_admin()
CREATE OR REPLACE FUNCTION public.get_clients_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários.' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.phone,
        c.email,
        c.notes,
        c.created_at,
        c.updated_at
    FROM public.clients c
    ORDER BY c.name ASC;
END;
$$;

-- 4.4. update_clinic_settings()
CREATE OR REPLACE FUNCTION public.update_clinic_settings(
    p_clinic_name TEXT,
    p_professional_name TEXT DEFAULT NULL,
    p_booking_enabled BOOLEAN DEFAULT NULL,
    p_min_notice_hours INTEGER DEFAULT NULL,
    p_max_advance_days INTEGER DEFAULT NULL,
    p_slot_interval_minutes INTEGER DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_instagram TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários.' USING ERRCODE = '42501';
    END IF;

    UPDATE public.clinic_settings
    SET
        clinic_name           = COALESCE(p_clinic_name, clinic_name),
        professional_name     = COALESCE(p_professional_name, professional_name),
        booking_enabled       = COALESCE(p_booking_enabled, booking_enabled),
        min_notice_hours      = COALESCE(p_min_notice_hours, min_notice_hours),
        max_advance_days      = COALESCE(p_max_advance_days, max_advance_days),
        slot_interval_minutes = COALESCE(p_slot_interval_minutes, slot_interval_minutes),
        phone                 = COALESCE(p_phone, phone),
        email                 = COALESCE(p_email, email),
        address               = COALESCE(p_address, address),
        city                  = COALESCE(p_city, city),
        state                 = COALESCE(p_state, state),
        instagram             = COALESCE(p_instagram, instagram),
        whatsapp              = COALESCE(p_whatsapp, whatsapp),
        updated_at            = now()
    WHERE is_singleton = true;
END;
$$;

-- 4.5. Helper para cadastrar o primeiro administrador
-- Substitua 'SEU_EMAIL_AQUI' pelo e-mail com o qual você fez cadastro no Supabase Auth:
-- INSERT INTO public.admin_users (id, email, role)
-- SELECT id, email, 'admin'
-- FROM auth.users
-- WHERE email = 'contato@espacopivotto.com.br'
-- ON CONFLICT (id) DO NOTHING;
