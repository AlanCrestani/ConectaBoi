-- Habilitar RLS no storage.objects para corrigir os warnings de segurança
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;