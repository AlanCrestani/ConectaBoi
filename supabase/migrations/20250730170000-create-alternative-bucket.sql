-- Criar bucket alternativo para desenvolvimento
INSERT INTO storage.buckets (id, name, public)
VALUES ('etl-scripts', 'etl-scripts', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o novo bucket
CREATE POLICY "Authenticated users can upload etl scripts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'etl-scripts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update etl scripts" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'etl-scripts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete etl scripts" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'etl-scripts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can view etl scripts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'etl-scripts' AND auth.role() = 'authenticated'
    ); 