-- Limpeza e Configuração RLS - ConectaBoi Insight
-- Este script remove políticas duplicadas e configura RLS corretamente

-- 1. DESABILITAR RLS NAS TABELAS DO SISTEMA (para permitir inserção de dados de teste)
ALTER TABLE public.assinaturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_confinamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS DUPLICADAS DAS TABELAS DE DADOS
-- fato_resumo
DROP POLICY IF EXISTS "Atualização por confinamento_id" ON public.fato_resumo;
DROP POLICY IF EXISTS "Exclusão por confinamento_id" ON public.fato_resumo;
DROP POLICY IF EXISTS "Inserção por confinamento_id" ON public.fato_resumo;
DROP POLICY IF EXISTS "Leitura por confinamento_id" ON public.fato_resumo;

-- fato_trato
DROP POLICY IF EXISTS "Atualização por confinamento_id" ON public.fato_trato;
DROP POLICY IF EXISTS "Exclusão por confinamento_id" ON public.fato_trato;
DROP POLICY IF EXISTS "Inserção por confinamento_id" ON public.fato_trato;
DROP POLICY IF EXISTS "Leitura por confinamento_id" ON public.fato_trato;

-- fato_carregamento
DROP POLICY IF EXISTS "Atualização por confinamento_id" ON public.fato_carregamento;
DROP POLICY IF EXISTS "Exclusão por confinamento_id" ON public.fato_carregamento;
DROP POLICY IF EXISTS "Inserção por confinamento_id" ON public.fato_carregamento;
DROP POLICY IF EXISTS "Leitura por confinamento_id" ON public.fato_carregamento;

-- 3. MANTER APENAS AS POLÍTICAS CORRETAS (que já existem)
-- As políticas "Users can..." já estão corretas e devem permanecer

-- 4. VERIFICAR RESULTADO FINAL
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('fato_resumo', 'fato_trato', 'fato_carregamento', 'assinaturas', 'user_confinamentos', 'user_roles')
ORDER BY tablename, policyname; 