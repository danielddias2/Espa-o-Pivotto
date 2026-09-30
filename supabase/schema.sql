-- ==============================================================================
-- ESPAÇO PIVOTTO - SCHEMA COMPLETO E MIGRATION INICIAL SUPABASE (POSTGRESQL)
-- Especialista: Josielly Pivotto (Cabelo • Maquiagem • Sobrancelha) - Redenção/PA
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABELAS PRINCIPAIS
-- ==============================================================================

-- 2.1. CONFIGURAÇÕES DO STUDIO (SINGLETON)
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_singleton BOOLEAN NOT NULL DEFAULT TRUE,
    clinic_name TEXT NOT NULL DEFAULT 'Espaço Pivotto',
    professional_name TEXT DEFAULT 'Josielly Pivotto',
    phone TEXT DEFAULT '(94) 99123-4567',
    email TEXT DEFAULT 'contato@espacopivotto.com.br',
    address TEXT DEFAULT 'Redenção - PA',
    city TEXT DEFAULT 'Redenção',
    state TEXT DEFAULT 'PA',
    instagram TEXT DEFAULT '@espacopivotto',
    whatsapp TEXT DEFAULT '5594991234567',
    booking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    min_notice_hours INTEGER NOT NULL DEFAULT 2 CHECK (min_notice_hours >= 1),
    max_advance_days INTEGER NOT NULL DEFAULT 30 CHECK (max_advance_days >= 1),
    slot_interval_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_interval_minutes > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT clinic_settings_singleton_unique UNIQUE (is_singleton),
    CONSTRAINT clinic_settings_singleton_check CHECK (is_singleton = TRUE)
);

-- 2.2. SERVIÇOS / PROCEDIMENTOS
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price NUMERIC(10, 2),
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    buffer_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT services_slug_key UNIQUE (slug),
    CONSTRAINT duration_minutes CHECK (duration_minutes > 0),
    CONSTRAINT services_price_check CHECK (price IS NULL OR price >= 0),
    CONSTRAINT services_buffer_check CHECK (buffer_minutes >= 0)
);

-- 2.3. CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT clients_phone_key UNIQUE (phone)
);

-- 2.4. AGENDAMENTOS (APPOINTMENTS)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT appointments_status_check CHECK (
        status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')
    ),
    CONSTRAINT appointments_time_range_check CHECK (end_at > start_at)
);

-- 2.5. DISPONIBILIDADE SEMANAL (OPERATING HOURS)
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Segunda, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT availability_time_check CHECK (end_time > start_time)
);

-- 2.6. BLOQUEIOS DE HORÁRIO / DIAS OFF (BLOCKED SLOTS)
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT blocked_slots_time_check CHECK (end_at > start_at)
);

-- ==============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_at ON public.appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_range ON public.appointments(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_availability_day ON public.availability(day_of_week, is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_range ON public.blocked_slots(start_at, end_at);

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- 4.1. clinic_settings
DROP POLICY IF EXISTS "Public can view clinic settings" ON public.clinic_settings;
CREATE POLICY "Public can view clinic settings"
    ON public.clinic_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated can manage clinic settings" ON public.clinic_settings;
CREATE POLICY "Authenticated can manage clinic settings"
    ON public.clinic_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4.2. services
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
    ON public.services FOR SELECT
    USING (active = true);

DROP POLICY IF EXISTS "Authenticated can manage all services" ON public.services;
CREATE POLICY "Authenticated can manage all services"
    ON public.services FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4.3. clients
DROP POLICY IF EXISTS "Authenticated can manage clients" ON public.clients;
CREATE POLICY "Authenticated can manage clients"
    ON public.clients FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4.4. appointments
DROP POLICY IF EXISTS "Authenticated can manage appointments" ON public.appointments;
CREATE POLICY "Authenticated can manage appointments"
    ON public.appointments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4.5. availability
DROP POLICY IF EXISTS "Public can view availability" ON public.availability;
CREATE POLICY "Public can view availability"
    ON public.availability FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated can manage availability" ON public.availability;
CREATE POLICY "Authenticated can manage availability"
    ON public.availability FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4.6. blocked_slots
DROP POLICY IF EXISTS "Public can view blocked slots" ON public.blocked_slots;
CREATE POLICY "Public can view blocked slots"
    ON public.blocked_slots FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated can manage blocked slots" ON public.blocked_slots;
CREATE POLICY "Authenticated can manage blocked slots"
    ON public.blocked_slots FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 5. AS 15 RPCS EXCLUSIVAS DO ESPAÇO PIVOTTO
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- RPC 1: get_clinic_settings()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_clinic_settings()
RETURNS SETOF public.clinic_settings
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.clinic_settings LIMIT 1;
$$;

-- ------------------------------------------------------------------------------
-- RPC 2: get_active_services()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_active_services()
RETURNS SETOF public.services
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.services
    WHERE active = true
    ORDER BY name ASC;
$$;

-- ------------------------------------------------------------------------------
-- RPC 3: get_available_slots(p_service_id uuid, p_date date)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_service_id UUID,
    p_date DATE
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
    v_dow INTEGER;
    v_avail RECORD;
    v_curr_time TIME;
    v_slot_start TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_earliest_allowed TIMESTAMPTZ;
    v_timezone CONSTANT TEXT := 'America/Belem'; -- Horário oficial Redenção/PA (UTC-3)
BEGIN
    -- 1. Verifica se agendamentos estão habilitados
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

    -- 3. Limite de antecedência mínima
    v_earliest_allowed := now() + (v_min_notice_hours || ' hours')::INTERVAL;

    -- 4. Dia da semana da data consultada (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    v_dow := EXTRACT(DOW FROM p_date)::INTEGER;

    -- 5. Percorre os blocos de atendimento para o dia da semana
    FOR v_avail IN
        SELECT start_time, end_time
        FROM public.availability
        WHERE day_of_week = v_dow AND is_active = true
        ORDER BY start_time ASC
    LOOP
        v_curr_time := v_avail.start_time;

        WHILE (v_curr_time + (v_duration_minutes || ' minutes')::INTERVAL) <= v_avail.end_time LOOP
            -- Monta timestamps com o timezone correto do studio
            v_slot_start := (p_date + v_curr_time) AT TIME ZONE v_timezone;
            v_slot_end := v_slot_start + (v_duration_minutes || ' minutes')::INTERVAL;

            -- Valida antecedência mínima
            IF v_slot_start >= v_earliest_allowed THEN
                -- Valida se não conflita com agendamentos existentes (não cancelados)
                IF NOT EXISTS (
                    SELECT 1 FROM public.appointments a
                    WHERE a.status NOT IN ('cancelled')
                      AND a.start_at < (v_slot_end + (v_buffer_minutes || ' minutes')::INTERVAL)
                      AND a.end_at > v_slot_start
                )
                -- Valida se não conflita com bloqueios manuais
                AND NOT EXISTS (
                    SELECT 1 FROM public.blocked_slots b
                    WHERE b.start_at < v_slot_end
                      AND b.end_at > v_slot_start
                ) THEN
                    start_at := v_slot_start;
                    end_at := v_slot_end;
                    RETURN NEXT;
                END IF;
            END IF;

            v_curr_time := v_curr_time + (v_slot_interval_minutes || ' minutes')::INTERVAL;
        END LOOP;
    END LOOP;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 4: create_public_appointment(...)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_public_appointment(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_service_id UUID DEFAULT NULL,
    p_start_at TIMESTAMPTZ DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
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

    -- 5. Validação atômica de concorrência / colisão com agendamentos existentes
    IF EXISTS (
        SELECT 1 FROM public.appointments
        WHERE status NOT IN ('cancelled')
          AND start_at < (v_end_at + (v_buffer_minutes || ' minutes')::INTERVAL)
          AND end_at > p_start_at
    ) THEN
        RAISE EXCEPTION 'Horário indisponível';
    END IF;

    -- 6. Validação de bloqueios manuais
    IF EXISTS (
        SELECT 1 FROM public.blocked_slots
        WHERE start_at < v_end_at
          AND end_at > p_start_at
    ) THEN
        RAISE EXCEPTION 'Horário indisponível';
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

    -- 8. Insere o agendamento
    INSERT INTO public.appointments (
        client_id,
        service_id,
        start_at,
        end_at,
        status,
        notes
    ) VALUES (
        v_client_id,
        p_service_id,
        p_start_at,
        v_end_at,
        'pending',
        NULLIF(trim(p_notes), '')
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 5: get_services_admin()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_services_admin()
RETURNS SETOF public.services
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.services
    ORDER BY created_at DESC;
$$;

-- ------------------------------------------------------------------------------
-- RPC 6: create_service(...)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_service(
    p_name TEXT,
    p_slug TEXT,
    p_duration_minutes INTEGER,
    p_price NUMERIC DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL
)
RETURNS public.services
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_service public.services;
BEGIN
    IF p_duration_minutes <= 0 THEN
        RAISE EXCEPTION 'A duração do serviço deve ser maior que zero minutos.';
    END IF;

    INSERT INTO public.services (
        name,
        slug,
        duration_minutes,
        price,
        description,
        image_url,
        active
    ) VALUES (
        trim(p_name),
        lower(trim(p_slug)),
        p_duration_minutes,
        p_price,
        trim(p_description),
        trim(p_image_url),
        true
    )
    RETURNING * INTO v_service;

    RETURN v_service;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 7: update_service(...)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_service(
    p_service_id UUID,
    p_name TEXT,
    p_slug TEXT,
    p_duration_minutes INTEGER,
    p_price NUMERIC DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL
)
RETURNS public.services
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_service public.services;
BEGIN
    IF p_duration_minutes <= 0 THEN
        RAISE EXCEPTION 'A duração do serviço deve ser maior que zero minutos.';
    END IF;

    UPDATE public.services
    SET
        name = trim(p_name),
        slug = lower(trim(p_slug)),
        duration_minutes = p_duration_minutes,
        price = p_price,
        description = trim(p_description),
        image_url = trim(p_image_url),
        updated_at = now()
    WHERE id = p_service_id
    RETURNING * INTO v_service;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'service not found';
    END IF;

    RETURN v_service;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 8: set_service_active(p_service_id uuid, p_active boolean)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_service_active(
    p_service_id UUID,
    p_active BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.services
    SET active = p_active, updated_at = now()
    WHERE id = p_service_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'service not found';
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 9: get_appointments_admin()
-- ------------------------------------------------------------------------------
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    JOIN public.clients c ON c.id = a.client_id
    JOIN public.services s ON s.id = a.service_id
    ORDER BY a.start_at ASC;
$$;

-- ------------------------------------------------------------------------------
-- RPC 10: update_appointment_status(p_appointment_id uuid, p_new_status text)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_appointment_status(
    p_appointment_id UUID,
    p_new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_new_status NOT IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show') THEN
        RAISE EXCEPTION 'status de agendamento inválido';
    END IF;

    UPDATE public.appointments
    SET status = p_new_status, updated_at = now()
    WHERE id = p_appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'agendamento não encontrado';
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 11: get_clients_admin()
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_clients_admin()
RETURNS SETOF public.clients
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.clients
    ORDER BY name ASC;
$$;

-- ------------------------------------------------------------------------------
-- RPC 12: create_client(p_name text, p_phone text, p_email text)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_client(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL
)
RETURNS public.clients
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_client public.clients;
BEGIN
    INSERT INTO public.clients (
        name,
        phone,
        email
    ) VALUES (
        trim(p_name),
        trim(p_phone),
        NULLIF(trim(p_email), '')
    )
    RETURNING * INTO v_client;

    RETURN v_client;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 13: update_client(p_client_id uuid, p_name text, p_phone text, p_email text)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_client(
    p_client_id UUID,
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL
)
RETURNS public.clients
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_client public.clients;
BEGIN
    UPDATE public.clients
    SET
        name = trim(p_name),
        phone = trim(p_phone),
        email = NULLIF(trim(p_email), ''),
        updated_at = now()
    WHERE id = p_client_id
    RETURNING * INTO v_client;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'cliente não encontrado';
    END IF;

    RETURN v_client;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 14: delete_client(p_client_id uuid)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_client(
    p_client_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validação: não permitir excluir cliente se houver agendamentos atrelados
    IF EXISTS (
        SELECT 1 FROM public.appointments
        WHERE client_id = p_client_id
    ) THEN
        RAISE EXCEPTION 'Não é possível excluir este cliente pois existem agendamentos vinculados ao seu histórico.';
    END IF;

    DELETE FROM public.clients
    WHERE id = p_client_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'cliente não encontrado';
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- RPC 15: update_clinic_settings(...)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_clinic_settings(
    p_clinic_name TEXT DEFAULT NULL,
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
    UPDATE public.clinic_settings
    SET
        clinic_name = COALESCE(NULLIF(trim(p_clinic_name), ''), clinic_name),
        professional_name = COALESCE(NULLIF(trim(p_professional_name), ''), professional_name),
        booking_enabled = COALESCE(p_booking_enabled, booking_enabled),
        min_notice_hours = COALESCE(p_min_notice_hours, min_notice_hours),
        max_advance_days = COALESCE(p_max_advance_days, max_advance_days),
        slot_interval_minutes = COALESCE(p_slot_interval_minutes, slot_interval_minutes),
        phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
        email = COALESCE(NULLIF(trim(p_email), ''), email),
        address = COALESCE(NULLIF(trim(p_address), ''), address),
        city = COALESCE(NULLIF(trim(p_city), ''), city),
        state = COALESCE(NULLIF(trim(p_state), ''), state),
        instagram = COALESCE(NULLIF(trim(p_instagram), ''), instagram),
        whatsapp = COALESCE(NULLIF(trim(p_whatsapp), ''), whatsapp),
        updated_at = now()
    WHERE is_singleton = TRUE;
END;
$$;

-- ==============================================================================
-- 6. PERMISSÕES / GRANTS (ROLES SUPABASE)
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Acesso Público (anon + authenticated)
GRANT EXECUTE ON FUNCTION public.get_clinic_settings() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_active_services() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_available_slots(UUID, DATE) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(TEXT, TEXT, TEXT, UUID, TIMESTAMPTZ, TEXT) TO anon, authenticated, service_role;

-- Acesso Administrativo (authenticated + service_role)
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

-- Permissões em tabelas
GRANT SELECT ON public.clinic_settings TO anon, authenticated, service_role;
GRANT SELECT ON public.services TO anon, authenticated, service_role;
GRANT SELECT ON public.availability TO anon, authenticated, service_role;
GRANT SELECT ON public.blocked_slots TO anon, authenticated, service_role;

GRANT ALL ON public.clinic_settings TO authenticated, service_role;
GRANT ALL ON public.services TO authenticated, service_role;
GRANT ALL ON public.clients TO authenticated, service_role;
GRANT ALL ON public.appointments TO authenticated, service_role;
GRANT ALL ON public.availability TO authenticated, service_role;
GRANT ALL ON public.blocked_slots TO authenticated, service_role;

-- ==============================================================================
-- 7. SEED DATA OFICIAL - ESPAÇO PIVOTTO (JOSIELLY PIVOTTO)
-- ==============================================================================

-- 7.1. Configuração Inicial do Studio
INSERT INTO public.clinic_settings (
    is_singleton,
    clinic_name,
    professional_name,
    phone,
    email,
    address,
    city,
    state,
    instagram,
    whatsapp,
    booking_enabled,
    min_notice_hours,
    max_advance_days,
    slot_interval_minutes
) VALUES (
    TRUE,
    'Espaço Pivotto',
    'Josielly Pivotto',
    '(94) 99123-4567',
    'contato@espacopivotto.com.br',
    'Redenção - PA',
    'Redenção',
    'PA',
    '@espacopivotto',
    '5594991234567',
    TRUE,
    2,
    30,
    30
) ON CONFLICT (is_singleton) DO NOTHING;

-- 7.2. Disponibilidade Padrão (Segunda a Sábado)
-- 0=Dom (Fechado), 1=Seg a 5=Sex (08:00 às 18:00), 6=Sáb (08:00 às 16:00)
INSERT INTO public.availability (day_of_week, start_time, end_time, is_active)
VALUES
    (1, '08:00:00', '18:00:00', TRUE),
    (2, '08:00:00', '18:00:00', TRUE),
    (3, '08:00:00', '18:00:00', TRUE),
    (4, '08:00:00', '18:00:00', TRUE),
    (5, '08:00:00', '18:00:00', TRUE),
    (6, '08:00:00', '16:00:00', TRUE),
    (0, '08:00:00', '12:00:00', FALSE);

-- 7.3. Catálogo de Procedimentos (Cabelo • Maquiagem • Sobrancelha)
INSERT INTO public.services (
    name,
    slug,
    description,
    duration_minutes,
    price,
    image_url,
    active,
    buffer_minutes
) VALUES
(
    'Penteado Noiva Exclusivo',
    'penteado-noiva',
    'Penteado autoral e personalizado para noivas, planejado para resistir com perfeição e elegância durante todo o grande dia.',
    120,
    350.00,
    '/images/brides/noiva-buque.jpg',
    TRUE,
    15
),
(
    'Maquiagem Noiva Blindada',
    'maquiagem-noiva',
    'Técnica de alta resistência à prova de água e emoção, acabamento glow e realce sublime da beleza natural da noiva.',
    90,
    300.00,
    '/images/brides/noiva-veu.jpg',
    TRUE,
    15
),
(
    'Produção Completa Noiva (Penteado + Make)',
    'producao-completa-noiva',
    'Experiência exclusiva de beleza para o grande dia, integrando penteado e maquiagem com suporte personalizado.',
    180,
    600.00,
    '/images/brides/noiva-ensaio.jpg',
    TRUE,
    20
),
(
    'Penteado Social / Festa',
    'penteado-festa',
    'Penteados sofisticados, tranças estruturadas, coques e semipresos para madrinhas, formandas e convidadas de gala.',
    60,
    180.00,
    '/images/services/penteado-tranca.jpg',
    TRUE,
    10
),
(
    'Maquiagem Festa Glam',
    'maquiagem-festa',
    'Maquiagem social para eventos com técnicas de iluminação, olhos destacados e pele com durabilidade extrema.',
    60,
    180.00,
    '/images/services/maquiagem-festa.jpg',
    TRUE,
    10
),
(
    'Design de Sobrancelhas Estratégico',
    'design-sobrancelhas',
    'Mapeamento facial personalizado e alinhamento milimétrico para valorizar a arquitetura e expressão natural do olhar.',
    30,
    60.00,
    '/images/services/sobrancelha-design.jpg',
    TRUE,
    5
),
(
    'Definição & Tratamento de Cachos',
    'cabelo-cachos',
    'Tratamento profundo de nutrição, corte a seco e finalização especializada para curvas e texturas cacheadas e crespas.',
    90,
    160.00,
    '/images/services/cabelo-cachos.jpg',
    TRUE,
    10
)
ON CONFLICT (slug) DO NOTHING;
