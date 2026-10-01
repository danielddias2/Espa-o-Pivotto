-- ==============================================================================
-- ESPAÇO PIVOTTO — SUPABASE STORAGE: BUCKET 'professionals'
-- Arquivo: supabase/storage_setup.sql
-- ==============================================================================
-- Criação e configuração do bucket público para armazenamento de fotos das profissionais
-- com controle estrito de upload restrito a administradores.
-- ==============================================================================

-- 1. Criação do bucket 'professionals'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'professionals',
    'professionals',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Políticas de Leitura e Escrita em storage.objects

-- 2.1. Leitura pública de fotos das profissionais
DROP POLICY IF EXISTS "Public can view professional photos" ON storage.objects;
CREATE POLICY "Public can view professional photos"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'professionals');

-- 2.2. Upload de fotos restrito a administradores
DROP POLICY IF EXISTS "Admins can upload professional photos" ON storage.objects;
CREATE POLICY "Admins can upload professional photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'professionals'
        AND public.is_admin()
    );

-- 2.3. Atualização de fotos restrita a administradores
DROP POLICY IF EXISTS "Admins can update professional photos" ON storage.objects;
CREATE POLICY "Admins can update professional photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'professionals'
        AND public.is_admin()
    );

-- 2.4. Exclusão de fotos restrita a administradores
DROP POLICY IF EXISTS "Admins can delete professional photos" ON storage.objects;
CREATE POLICY "Admins can delete professional photos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'professionals'
        AND public.is_admin()
    );

-- ==============================================================================
-- 3. Bucket 'procedure-images' (Fotos dos Procedimentos)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'procedure-images',
    'procedure-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 3.1. Leitura pública de imagens de procedimentos
DROP POLICY IF EXISTS "Public can view procedure images" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to procedure-images" ON storage.objects;
CREATE POLICY "Public can view procedure images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'procedure-images');

-- 3.2. Upload de fotos de procedimentos restrito a administradores
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

-- 3.3. Atualização de fotos de procedimentos restrita a administradores
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

-- 3.4. Exclusão de fotos de procedimentos restrita a administradores
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
