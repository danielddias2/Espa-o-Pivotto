-- ==============================================================================
-- ESPAÇO PIVOTTO — MIGRATION: ENTIDADE PROFISSIONAIS & VÍNCULOS
-- Arquivo: supabase/migrations/20260929_professionals.sql
-- ==============================================================================
-- 1. Criação da tabela public.professionals
-- 2. Criação da tabela de relacionamento N:N public.professional_services
-- 3. Adição da coluna professional_id na tabela public.appointments
-- 4. Índices de performance e integridade referencial
-- 5. Row Level Security (RLS) e Policies
-- 6. RPCs para catálogo público e painel administrativo
-- 7. Seed inicial da profissional principal (Josielly Pivotto)
-- ==============================================================================

-- 0. PRÉ-REQUISITO DE SEGURANÇA: CONTROLE DE ADMINISTRADORES & FUNÇÃO is_admin()
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own record" ON public.admin_users;
CREATE POLICY "Admins can view own record"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

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

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 1. TABELA DE PROFISSIONAIS (PROFESSIONALS)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- 3. ATUALIZAÇÃO DA TABELA APPOINTMENTS (AGENDAMENTOS)
-- Adiciona a referência à profissional de forma segura (preservando histórico anterior)
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_professional ON public.appointments(professional_id);

-- 4. ROW LEVEL SECURITY (RLS) & POLICIES

-- 4.1. Tabela professionals
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

-- 4.2. Tabela professional_services
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

-- Permissões em tabelas
GRANT SELECT ON public.professionals TO anon, authenticated, service_role;
GRANT SELECT ON public.professional_services TO anon, authenticated, service_role;
GRANT ALL ON public.professionals TO authenticated, service_role;
GRANT ALL ON public.professional_services TO authenticated, service_role;

-- 5. SEED INICIAL: JOSIELLY PIVOTTO
-- Garante que Josielly Pivotto esteja cadastrada como profissional pioneira
INSERT INTO public.professionals (id, name, specialty, bio, active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Josielly Pivotto',
    'Cabelo, Maquiagem, Sobrancelha & Noivas',
    'Fundadora do Espaço Pivotto. Especialista em produções sofisticadas para noivas e beleza com propósito.',
    true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    specialty = EXCLUDED.specialty,
    bio = EXCLUDED.bio,
    active = true;

-- Vincula Josielly Pivotto a todos os serviços ativos existentes
INSERT INTO public.professional_services (professional_id, service_id)
SELECT '11111111-1111-1111-1111-111111111111', id
FROM public.services
ON CONFLICT (professional_id, service_id) DO NOTHING;

-- 6. RPCS PÚBLICAS (CATÁLOGO & AGENDAMENTO)

-- 6.1. get_active_professionals()
CREATE OR REPLACE FUNCTION public.get_active_professionals()
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id, name, photo_url, specialty, bio, active
    FROM public.professionals
    WHERE active = true
    ORDER BY name ASC;
$$;

-- 6.2. get_professionals_by_service(p_service_id)
CREATE OR REPLACE FUNCTION public.get_professionals_by_service(p_service_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
    active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, p.name, p.photo_url, p.specialty, p.bio, p.active
    FROM public.professionals p
    JOIN public.professional_services ps ON ps.professional_id = p.id
    WHERE ps.service_id = p_service_id
      AND p.active = true
    ORDER BY p.name ASC;
$$;

-- 6.3. get_services_by_professional(p_professional_id)
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

-- 7. RPCS ADMINISTRATIVAS (GESTÃO DE PROFISSIONAIS)

-- 7.1. get_professionals_admin()
CREATE OR REPLACE FUNCTION public.get_professionals_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    photo_url TEXT,
    specialty TEXT,
    bio TEXT,
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

-- 7.2. create_professional(...)
CREATE OR REPLACE FUNCTION public.create_professional(
    p_name TEXT,
    p_photo_url TEXT DEFAULT NULL,
    p_specialty TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL
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
        name, photo_url, specialty, bio, active
    ) VALUES (
        trim(p_name),
        NULLIF(trim(p_photo_url), ''),
        NULLIF(trim(p_specialty), ''),
        NULLIF(trim(p_bio), ''),
        true
    )
    RETURNING * INTO v_new;

    RETURN v_new;
END;
$$;

-- 7.3. update_professional(...)
CREATE OR REPLACE FUNCTION public.update_professional(
    p_professional_id UUID,
    p_name TEXT,
    p_photo_url TEXT DEFAULT NULL,
    p_specialty TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL
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
        updated_at = now()
    WHERE id = p_professional_id
    RETURNING * INTO v_updated;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrada';
    END IF;

    RETURN v_updated;
END;
$$;

-- 7.4. set_professional_active(...)
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

-- 7.5. set_professional_services(...)
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

-- 8. EVOLUÇÃO DAS RPCS DE AGENDAMENTO (COM SUPORTE A PROFISSIONAL & 100% RETROCOMPATÍVEL)

-- 8.1. Evolução de create_public_appointment(...) com atribuição inteligente de profissional
CREATE OR REPLACE FUNCTION public.create_public_appointment(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_service_id UUID DEFAULT NULL,
    p_start_at TIMESTAMPTZ DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_professional_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking_enabled BOOLEAN;
    v_min_notice_hours INTEGER;
    v_duration_minutes INTEGER;
    v_buffer_minutes INTEGER;
    v_end_at TIMESTAMPTZ;
    v_client_id UUID;
    v_clean_phone TEXT;
    v_assigned_professional_id UUID := NULL;
BEGIN
    -- 1. Verifica configuração de agendamento online
    SELECT booking_enabled, min_notice_hours
    INTO v_booking_enabled, v_min_notice_hours
    FROM public.clinic_settings
    LIMIT 1;

    IF v_booking_enabled IS FALSE THEN
        RAISE EXCEPTION 'Agendamentos estão temporariamente desativados';
    END IF;

    -- 2. Valida o serviço solicitado
    SELECT duration_minutes, COALESCE(buffer_minutes, 0)
    INTO v_duration_minutes, v_buffer_minutes
    FROM public.services
    WHERE id = p_service_id AND active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Serviço não encontrado ou inativo';
    END IF;

    -- 3. Calcula o horário de término
    v_end_at := p_start_at + (v_duration_minutes || ' minutes')::INTERVAL;

    -- 4. Valida antecedência mínima
    IF p_start_at < (now() + (COALESCE(v_min_notice_hours, 2) || ' hours')::INTERVAL) THEN
        RAISE EXCEPTION 'Horário indisponível';
    END IF;

    -- 5. Validação de bloqueios manuais do estúdio
    IF EXISTS (
        SELECT 1 FROM public.blocked_slots
        WHERE start_at < v_end_at
          AND end_at > p_start_at
    ) THEN
        RAISE EXCEPTION 'Horário indisponível';
    END IF;

    -- 6. Definição da Profissional (Específica vs "Qualquer Profissional Disponível")
    IF p_professional_id IS NOT NULL THEN
        -- 6.1. Profissional específica escolhida pela cliente:
        IF NOT EXISTS (
            SELECT 1 FROM public.professionals
            WHERE id = p_professional_id AND active = true
        ) THEN
            RAISE EXCEPTION 'Profissional não encontrada ou inativa';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM public.professional_services
            WHERE professional_id = p_professional_id AND service_id = p_service_id
        ) THEN
            RAISE EXCEPTION 'A profissional selecionada não realiza este procedimento';
        END IF;

        -- Validação de conflito na agenda da profissional
        IF EXISTS (
            SELECT 1 FROM public.appointments
            WHERE status NOT IN ('cancelled')
              AND (professional_id = p_professional_id OR professional_id IS NULL)
              AND start_at < (v_end_at + (v_buffer_minutes || ' minutes')::INTERVAL)
              AND end_at > p_start_at
        ) THEN
            RAISE EXCEPTION 'Horário indisponível para esta profissional';
        END IF;

        v_assigned_professional_id := p_professional_id;
    ELSE
        -- 6.2. "Qualquer profissional disponível":
        -- Procura entre as profissionais ativas habilitadas para o procedimento
        -- que estão livres no horário desejado (balanceando carga do dia)
        SELECT p.id INTO v_assigned_professional_id
        FROM public.professionals p
        JOIN public.professional_services ps ON ps.professional_id = p.id
        WHERE ps.service_id = p_service_id
          AND p.active = true
          AND NOT EXISTS (
              SELECT 1 FROM public.appointments a
              WHERE a.status NOT IN ('cancelled')
                AND (a.professional_id = p.id OR a.professional_id IS NULL)
                AND a.start_at < (v_end_at + (v_buffer_minutes || ' minutes')::INTERVAL)
                AND a.end_at > p_start_at
          )
        ORDER BY (
            SELECT COUNT(*)
            FROM public.appointments a2
            WHERE a2.professional_id = p.id
              AND a2.start_at::date = p_start_at::date
              AND a2.status NOT IN ('cancelled')
        ) ASC, p.name ASC
        LIMIT 1;

        -- Se existem profissionais cadastradas para o serviço mas nenhuma estava livre:
        IF v_assigned_professional_id IS NULL AND EXISTS (
            SELECT 1 FROM public.professional_services ps
            JOIN public.professionals p ON p.id = ps.professional_id
            WHERE ps.service_id = p_service_id AND p.active = true
        ) THEN
            RAISE EXCEPTION 'Não há profissionais disponíveis neste horário';
        END IF;

        -- Fallback: se nenhuma profissional foi cadastrada no serviço ainda,
        -- garante ao menos que não colida com compromissos gerais da clínica
        IF v_assigned_professional_id IS NULL THEN
            IF EXISTS (
                SELECT 1 FROM public.appointments
                WHERE status NOT IN ('cancelled')
                  AND start_at < (v_end_at + (v_buffer_minutes || ' minutes')::INTERVAL)
                  AND end_at > p_start_at
            ) THEN
                RAISE EXCEPTION 'Horário indisponível';
            END IF;
        END IF;
    END IF;

    -- 7. Localiza ou cadastra a cliente pelo telefone
    v_clean_phone := trim(p_phone);

    SELECT id INTO v_client_id
    FROM public.clients
    WHERE phone = v_clean_phone
    LIMIT 1;

    IF v_client_id IS NOT NULL THEN
        UPDATE public.clients
        SET
            name = trim(p_name),
            email = COALESCE(NULLIF(trim(p_email), ''), email),
            updated_at = now()
        WHERE id = v_client_id;
    ELSE
        INSERT INTO public.clients (name, phone, email)
        VALUES (trim(p_name), v_clean_phone, NULLIF(trim(p_email), ''))
        RETURNING id INTO v_client_id;
    END IF;

    -- 8. Insere o agendamento com a profissional designada de forma atômica
    INSERT INTO public.appointments (
        client_id,
        service_id,
        professional_id,
        start_at,
        end_at,
        status,
        notes
    ) VALUES (
        v_client_id,
        p_service_id,
        v_assigned_professional_id,
        p_start_at,
        v_end_at,
        'pending',
        NULLIF(trim(p_notes), '')
    );
END;
$$;

-- 8.2. Evolução de get_available_slots(...) com suporte a profissional e "Qualquer Profissional"
CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_service_id UUID,
    p_date DATE,
    p_professional_id UUID DEFAULT NULL
)
RETURNS TABLE (
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking_enabled BOOLEAN;
    v_min_notice_hours INTEGER;
    v_slot_interval_minutes INTEGER;
    v_duration_minutes INTEGER;
    v_buffer_minutes INTEGER;
    v_earliest_allowed TIMESTAMPTZ;
    v_dow INTEGER;
    v_avail RECORD;
    v_curr_time TIME;
    v_slot_start TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_timezone TEXT := 'America/Sao_Paulo';
    v_target_profs UUID[];
    v_has_profs BOOLEAN := false;
BEGIN
    -- 1. Busca configurações gerais de agendamento
    SELECT booking_enabled, min_notice_hours, slot_interval_minutes
    INTO v_booking_enabled, v_min_notice_hours, v_slot_interval_minutes
    FROM public.clinic_settings
    LIMIT 1;

    IF v_booking_enabled IS FALSE THEN
        RETURN;
    END IF;

    v_min_notice_hours := COALESCE(v_min_notice_hours, 2);
    v_slot_interval_minutes := COALESCE(v_slot_interval_minutes, 30);

    -- 2. Busca informações do serviço solicitado
    SELECT duration_minutes, COALESCE(buffer_minutes, 0)
    INTO v_duration_minutes, v_buffer_minutes
    FROM public.services
    WHERE id = p_service_id AND active = true;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- 3. Identifica profissionais a serem verificadas
    IF p_professional_id IS NOT NULL THEN
        -- Profissional específica: valida se ela realiza este serviço
        IF NOT EXISTS (
            SELECT 1 FROM public.professional_services
            WHERE professional_id = p_professional_id AND service_id = p_service_id
        ) THEN
            RETURN;
        END IF;
        v_target_profs := ARRAY[p_professional_id];
        v_has_profs := true;
    ELSE
        -- Qualquer profissional disponível: busca todas as ativas que realizam o serviço
        SELECT COALESCE(array_agg(ps.professional_id), ARRAY[]::UUID[])
        INTO v_target_profs
        FROM public.professional_services ps
        JOIN public.professionals p ON p.id = ps.professional_id
        WHERE ps.service_id = p_service_id AND p.active = true;

        v_has_profs := (array_length(v_target_profs, 1) IS NOT NULL AND array_length(v_target_profs, 1) > 0);
    END IF;

    -- 4. Limite de antecedência mínima
    v_earliest_allowed := now() + (v_min_notice_hours || ' hours')::INTERVAL;

    -- 5. Dia da semana da data consultada (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    v_dow := EXTRACT(DOW FROM p_date)::INTEGER;

    -- 6. Percorre os blocos de atendimento para o dia da semana
    FOR v_avail IN
        SELECT start_time, end_time
        FROM public.availability
        WHERE day_of_week = v_dow AND is_active = true
        ORDER BY start_time ASC
    LOOP
        v_curr_time := v_avail.start_time;

        WHILE (v_curr_time + (v_duration_minutes || ' minutes')::INTERVAL) <= v_avail.end_time LOOP
            v_slot_start := (p_date + v_curr_time) AT TIME ZONE v_timezone;
            v_slot_end := v_slot_start + (v_duration_minutes || ' minutes')::INTERVAL;

            -- Valida antecedência mínima
            IF v_slot_start >= v_earliest_allowed THEN
                -- Valida ausência de bloqueios manuais do estúdio
                IF NOT EXISTS (
                    SELECT 1 FROM public.blocked_slots b
                    WHERE b.start_at < v_slot_end
                      AND b.end_at > v_slot_start
                ) THEN
                    IF v_has_profs THEN
                        -- O horário é livre se pelo menos UMA das profissionais qualificadas estiver livre
                        IF EXISTS (
                            SELECT 1
                            FROM unnest(v_target_profs) AS q_pid
                            WHERE NOT EXISTS (
                                SELECT 1 FROM public.appointments a
                                WHERE a.status NOT IN ('cancelled')
                                  AND (a.professional_id = q_pid OR a.professional_id IS NULL)
                                  AND a.start_at < (v_slot_end + (v_buffer_minutes || ' minutes')::INTERVAL)
                                  AND a.end_at > v_slot_start
                            )
                        ) THEN
                            start_at := v_slot_start;
                            end_at := v_slot_end;
                            RETURN NEXT;
                        END IF;
                    ELSE
                        -- Fallback geral quando não houver profissionais cadastradas
                        IF NOT EXISTS (
                            SELECT 1 FROM public.appointments a
                            WHERE a.status NOT IN ('cancelled')
                              AND a.start_at < (v_slot_end + (v_buffer_minutes || ' minutes')::INTERVAL)
                              AND a.end_at > v_slot_start
                        ) THEN
                            start_at := v_slot_start;
                            end_at := v_slot_end;
                            RETURN NEXT;
                        END IF;
                    END IF;
                END IF;
            END IF;

            v_curr_time := v_curr_time + (v_slot_interval_minutes || ' minutes')::INTERVAL;
        END LOOP;
    END LOOP;
END;
$$;

-- 8.3. Evolução de get_appointments_admin() incluindo professional_id e professional_name
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
    duration_minutes INTEGER,
    professional_id UUID,
    professional_name TEXT
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
        s.duration_minutes,
        p.id AS professional_id,
        p.name AS professional_name
    FROM public.appointments a
    JOIN public.clients c ON a.client_id = c.id
    JOIN public.services s ON a.service_id = s.id
    LEFT JOIN public.professionals p ON a.professional_id = p.id
    ORDER BY a.start_at ASC;
END;
$$;

-- Permissões de Execução
GRANT EXECUTE ON FUNCTION public.get_active_professionals() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_professionals_by_service(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_services_by_professional(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_available_slots(UUID, DATE, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(TEXT, TEXT, TEXT, UUID, TIMESTAMPTZ, TEXT, UUID) TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_professionals_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_professional(TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_professional(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_professional_active(UUID, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_professional_services(UUID, UUID[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_appointments_admin() TO authenticated, service_role;
