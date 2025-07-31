-- Corrigir políticas de storage para permitir acesso ao confinamento específico
-- Primeiro, vamos garantir que o confinamento existe
INSERT INTO public.confinamentos (id, nome, razao_social, cnpj, master_user_id, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Confinamento Teste',
  'Empresa Teste LTDA',
  '00.000.000/0001-00',
  (SELECT id FROM auth.users LIMIT 1),
  true
) ON CONFLICT (id) DO NOTHING;

-- Atualizar políticas de storage para ser mais permissiva durante desenvolvimento
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;

-- Políticas mais permissivas para desenvolvimento
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update files" ON storage.objects
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete files" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view files" ON storage.objects
    FOR SELECT USING (auth.role() = 'authenticated');

-- Garantir que o bucket python-scripts existe e tem as políticas corretas
INSERT INTO storage.buckets (id, name, public)
VALUES ('python-scripts', 'python-scripts', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas específicas para o bucket python-scripts
CREATE POLICY "Authenticated users can upload python scripts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'python-scripts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update python scripts" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'python-scripts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete python scripts" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'python-scripts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can view python scripts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'python-scripts' AND auth.role() = 'authenticated'
    ); 