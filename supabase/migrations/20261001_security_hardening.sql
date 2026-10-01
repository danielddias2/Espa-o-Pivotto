-- ==============================================================================
-- ESPAÇO PIVOTTO — MIGRATION: HARDENING DE SEGURANÇA E RLS POLICIES
-- Arquivo: supabase/migrations/20261001_security_hardening.sql
-- ==============================================================================
-- OBJETIVO:
-- 1. Substituir policies permissivas TO authenticated USING (true) por public.is_admin().
-- 2. Garantir que usuários autenticados comuns NÃO possam administrar tabelas nem storage.
-- 3. Preservar rigorosamente a leitura pública (anon) necessária para o site.
-- 4. Proteger o bucket de storage 'procedure-images' com restrição a public.is_admin().
-- ==============================================================================

-- ==============================================================================
-- PARTE 1: TABELAS DO BANCO DE DADOS (ROW LEVEL SECURITY)
-- ==============================================================================

-- 1.1. public.clinic_settings
-- Leitura pública mantida (dados institucionais visíveis no site).
-- Gestão administrativa restrita a administradores.
DROP POLICY IF EXISTS "Authenticated can manage clinic settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Admins can manage clinic settings" ON public.clinic_settings;
CREATE POLICY "Admins can manage clinic settings"
    ON public.clinic_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view clinic settings" ON public.clinic_settings;
CREATE POLICY "Public can view clinic settings"
    ON public.clinic_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 1.2. public.services
-- Leitura pública de serviços ativos mantida (catálogo público).
-- Gestão completa restrita a administradores.
DROP POLICY IF EXISTS "Authenticated can manage all services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;
CREATE POLICY "Admins can manage all services"
    ON public.services
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
    ON public.services
    FOR SELECT
    TO anon, authenticated
    USING (active = true);

-- 1.3. public.clients
-- Dados de clientes protegidos exclusivamente para administradores.
-- Usuários autenticados comuns não possuem acesso direto à tabela.
DROP POLICY IF EXISTS "Authenticated can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;
CREATE POLICY "Admins can manage clients"
    ON public.clients
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 1.4. public.appointments
-- Agendamentos protegidos exclusivamente para administradores.
DROP POLICY IF EXISTS "Authenticated can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON public.appointments;
CREATE POLICY "Admins can manage appointments"
    ON public.appointments
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 1.5. public.availability (reforço de segurança)
DROP POLICY IF EXISTS "Authenticated can manage availability" ON public.availability;
DROP POLICY IF EXISTS "Admins can manage availability" ON public.availability;
CREATE POLICY "Admins can manage availability"
    ON public.availability
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view availability" ON public.availability;
CREATE POLICY "Public can view availability"
    ON public.availability
    FOR SELECT
    TO anon, authenticated
    USING (active = true);

-- 1.6. public.blocked_slots (reforço de segurança)
DROP POLICY IF EXISTS "Authenticated can manage blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Admins can manage blocked slots" ON public.blocked_slots;
CREATE POLICY "Admins can manage blocked slots"
    ON public.blocked_slots
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view blocked slots" ON public.blocked_slots;
CREATE POLICY "Public can view blocked slots"
    ON public.blocked_slots
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ==============================================================================
-- PARTE 2: SUPABASE STORAGE — BUCKET 'procedure-images'
-- ==============================================================================

-- 2.1. Leitura pública de imagens de procedimentos (exibição no site e agendamento)
DROP POLICY IF EXISTS "Public can view procedure images" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to procedure-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public can view procedure images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'procedure-images');

-- 2.2. Upload restrito a administradores
DROP POLICY IF EXISTS "Admins can upload procedure images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload procedure images" ON storage.objects;
CREATE POLICY "Admins can upload procedure images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'procedure-images'
        AND public.is_admin()
    );

-- 2.3. Atualização/substituição restrita a administradores
DROP POLICY IF EXISTS "Admins can update procedure images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update procedure images" ON storage.objects;
CREATE POLICY "Admins can update procedure images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'procedure-images'
        AND public.is_admin()
    );

-- 2.4. Exclusão restrita a administradores
DROP POLICY IF EXISTS "Admins can delete procedure images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete procedure images" ON storage.objects;
CREATE POLICY "Admins can delete procedure images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'procedure-images'
        AND public.is_admin()
    );
