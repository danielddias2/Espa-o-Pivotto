-- ==============================================================================
-- ESPAÇO PIVOTTO — MIGRATION: ENTIDADE PROFISSIONAIS & VÍNCULOS
-- Arquivo: supabase/migrations/20260929_professionals.sql
-- ==============================================================================
-- 1. Criação da tabela public.professionals (com campo whatsapp para contato direto)
-- 2. Criação da tabela de relacionamento N:N public.professional_services
-- 3. Índices de performance e integridade referencial
-- 4. Row Level Security (RLS) e Policies
-- 5. Seed inicial da profissional pioneira (Josielly Pivotto - sem telefone fictício)
-- 6. RPCs para catálogo público (filtragem por serviço)
-- 7. RPCs administrativas (CRUD e vínculos no painel /admin/profissionais)
-- ==============================================================================

-- 1. TABELA DE PROFISSIONAIS (PROFESSIONALS)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    whatsapp TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garante a coluna whatsapp caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Índice para busca rápida de profissionais ativas
CREATE INDEX IF NOT EXISTS idx_professionals_active ON public.professionals(active);

-- 2. TABELA DE RELACIONAMENTO PROFISSIONAL ↔ PROCEDIMENTO (N:N)
CREATE TABLE IF NOT EXISTS public.professional_services (
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (professional_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_prof_services_prof ON public.professional_services(professional_id);
CREATE INDEX IF NOT EXISTS idx_prof_services_svc ON public.professional_services(service_id);

-- 3. ROW LEVEL SECURITY (RLS) & POLICIES

-- 3.1. Tabela professionals
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active professionals" ON public.professionals;
CREATE POLICY "Public can view active professionals"
    ON public.professionals
    FOR SELECT
    TO anon, authenticated
    USING (active = true);

DROP POLICY IF EXISTS "Admins can manage all professionals" ON public.professionals;
CREATE POLICY "Admins can manage all professionals"
    ON public.professionals
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.2. Tabela professional_services
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view professional services" ON public.professional_services;
CREATE POLICY "Public can view professional services"
    ON public.professional_services
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage professional services" ON public.professional_services;
CREATE POLICY "Admins can manage professional services"
    ON public.professional_services
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Concessão de permissões básicas de tabela
GRANT SELECT ON public.professionals TO anon, authenticated, service_role;
GRANT SELECT ON public.professional_services TO anon, authenticated, service_role;
GRANT ALL ON public.professionals TO authenticated, service_role;
GRANT ALL ON public.professional_services TO authenticated, service_role;

-- 4. SEED INICIAL: JOSIELLY PIVOTTO (Idempotente)
-- Josielly cadastrada como profissional pioneira com whatsapp NULL (sem dados fictícios).
-- Os vínculos com os procedimentos serão definidos pelo administrador no painel.
INSERT INTO public.professionals (id, name, specialty, bio, whatsapp, active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Josielly Pivotto',
    NULL,
    NULL,
    NULL,
    true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    active = true;

-- 5. RPCS PÚBLICAS (CATÁLOGO & JORNADA WHATSAPP)

-- 5.1. get_active_professionals()
CREATE OR REPLACE FUNCTION public.get_active_professionals()
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    whatsapp TEXT,
    active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id, name, photo_url, specialty, bio, whatsapp, active
    FROM public.professionals
    WHERE active = true
    ORDER BY name ASC;
$$;

-- 5.2. get_professionals_by_service(p_service_id)
CREATE OR REPLACE FUNCTION public.get_professionals_by_service(p_service_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    whatsapp TEXT,
    active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, p.name, p.photo_url, p.specialty, p.bio, p.whatsapp, p.active
    FROM public.professionals p
    JOIN public.professional_services ps ON ps.professional_id = p.id
    WHERE ps.service_id = p_service_id
      AND p.active = true
    ORDER BY p.name ASC;
$$;

-- 5.3. get_services_by_professional(p_professional_id)
-- Observação: utiliza apenas colunas existentes em public.services (ordenado por name ASC)
CREATE OR REPLACE FUNCTION public.get_services_by_professional(p_professional_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    duration_minutes INTEGER,
    price NUMERIC(10,2),
    description TEXT,
    image_url TEXT,
    active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT s.id, s.name, s.slug, s.duration_minutes, s.price, s.description, s.image_url, s.active
    FROM public.services s
    JOIN public.professional_services ps ON ps.service_id = s.id
    WHERE ps.professional_id = p_professional_id
      AND s.active = true
    ORDER BY s.name ASC;
$$;

-- 6. RPCS ADMINISTRATIVAS (PAINEL /admin/profissionais)

-- 6.1. get_professionals_admin()
CREATE OR REPLACE FUNCTION public.get_professionals_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    whatsapp TEXT,
    active BOOLEAN,
    services_count BIGINT,
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
        p.id,
        p.name,
        p.photo_url,
        p.specialty,
        p.bio,
        p.whatsapp,
        p.active,
        COUNT(ps.service_id)::BIGINT AS services_count,
        p.created_at,
        p.updated_at
    FROM public.professionals p
    LEFT JOIN public.professional_services ps ON ps.professional_id = p.id
    GROUP BY p.id
    ORDER BY p.name ASC;
END;
$$;

-- 6.2. create_professional(...)
CREATE OR REPLACE FUNCTION public.create_professional(
    p_name TEXT,
    p_photo_url TEXT DEFAULT NULL,
    p_specialty TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS public.professionals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new public.professionals;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários.' USING ERRCODE = '42501';
    END IF;

    IF trim(p_name) = '' THEN
        RAISE EXCEPTION 'Nome da profissional é obrigatório';
    END IF;

    INSERT INTO public.professionals (
        name, photo_url, specialty, bio, whatsapp, active
    ) VALUES (
        trim(p_name),
        NULLIF(trim(p_photo_url), ''),
        NULLIF(trim(p_specialty), ''),
        NULLIF(trim(p_bio), ''),
        NULLIF(trim(p_whatsapp), ''),
        true
    )
    RETURNING * INTO v_new;

    RETURN v_new;
END;
$$;

-- 6.3. update_professional(...)
CREATE OR REPLACE FUNCTION public.update_professional(
    p_professional_id UUID,
    p_name TEXT,
    p_photo_url TEXT DEFAULT NULL,
    p_specialty TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS public.professionals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated public.professionals;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários.' USING ERRCODE = '42501';
    END IF;

    IF trim(p_name) = '' THEN
        RAISE EXCEPTION 'Nome da profissional é obrigatório';
    END IF;

    UPDATE public.professionals
    SET
        name = trim(p_name),
        photo_url = NULLIF(trim(p_photo_url), ''),
        specialty = NULLIF(trim(p_specialty), ''),
        bio = NULLIF(trim(p_bio), ''),
        whatsapp = NULLIF(trim(p_whatsapp), ''),
        updated_at = now()
    WHERE id = p_professional_id
    RETURNING * INTO v_updated;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrada';
    END IF;

    RETURN v_updated;
END;
$$;

-- 6.4. set_professional_active(...)
CREATE OR REPLACE FUNCTION public.set_professional_active(
    p_professional_id UUID,
    p_active BOOLEAN
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

    UPDATE public.professionals
    SET
        active = p_active,
        updated_at = now()
    WHERE id = p_professional_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrada';
    END IF;
END;
$$;

-- 6.5. set_professional_services(...)
CREATE OR REPLACE FUNCTION public.set_professional_services(
    p_professional_id UUID,
    p_service_ids UUID[]
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

    -- Remove procedimentos anteriores da profissional
    DELETE FROM public.professional_services
    WHERE professional_id = p_professional_id;

    -- Insere novos procedimentos selecionados
    IF p_service_ids IS NOT NULL AND array_length(p_service_ids, 1) > 0 THEN
        INSERT INTO public.professional_services (professional_id, service_id)
        SELECT p_professional_id, unnest(p_service_ids)
        ON CONFLICT (professional_id, service_id) DO NOTHING;
    END IF;
END;
$$;

-- 7. CONCESSÃO DE PERMISSÕES DE EXECUÇÃO
GRANT EXECUTE ON FUNCTION public.get_active_professionals() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_professionals_by_service(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_services_by_professional(UUID) TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_professionals_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_professional(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_professional(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_professional_active(UUID, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_professional_services(UUID, UUID[]) TO authenticated, service_role;
