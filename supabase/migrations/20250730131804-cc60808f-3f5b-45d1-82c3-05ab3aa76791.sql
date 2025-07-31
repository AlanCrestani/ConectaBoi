-- Criar bucket para scripts Python
INSERT INTO storage.buckets (id, name, public) VALUES ('python-scripts', 'python-scripts', false);

-- Políticas para o bucket python-scripts (acesso direto aos arquivos)
CREATE POLICY "Usuários autenticados podem ver scripts"
ON storage.objects FOR SELECT
USING (bucket_id = 'python-scripts' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem upload de scripts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'python-scripts' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar scripts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'python-scripts' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar scripts"
ON storage.objects FOR DELETE
USING (bucket_id = 'python-scripts' AND auth.role() = 'authenticated');