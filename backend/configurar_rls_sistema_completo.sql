-- Configuração RLS para Sistema Completo - ConectaBoi Insight
-- Este script configura as políticas RLS para permitir inserções nas tabelas do sistema

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA INSERÇÃO DE DADOS DE TESTE
ALTER TABLE public.assinaturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_confinamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. CONFIGURAR POLÍTICAS RLS PARA TABELAS DE DADOS (fato_resumo, fato_trato, fato_carregamento)
-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Users can insert their confinement data" ON public.fato_resumo;
DROP POLICY IF EXISTS "Users can select their confinement data" ON public.fato_resumo;
DROP POLICY IF EXISTS "Users can update their confinement data" ON public.fato_resumo;
DROP POLICY IF EXISTS "Users can delete their confinement data" ON public.fato_resumo;

DROP POLICY IF EXISTS "Users can insert their confinement data" ON public.fato_trato;
DROP POLICY IF EXISTS "Users can select their confinement data" ON public.fato_trato;
DROP POLICY IF EXISTS "Users can update their confinement data" ON public.fato_trato;
DROP POLICY IF EXISTS "Users can delete their confinement data" ON public.fato_trato;

DROP POLICY IF EXISTS "Users can insert their confinement data" ON public.fato_carregamento;
DROP POLICY IF EXISTS "Users can select their confinement data" ON public.fato_carregamento;
DROP POLICY IF EXISTS "Users can update their confinement data" ON public.fato_carregamento;
DROP POLICY IF EXISTS "Users can delete their confinement data" ON public.fato_carregamento;

-- 3. CRIAR NOVAS POLÍTICAS RLS BASEADAS EM user_confinamentos
-- Política para fato_resumo
CREATE POLICY "Users can insert their confinement data" ON public.fato_resumo
    FOR INSERT WITH CHECK (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can select their confinement data" ON public.fato_resumo
    FOR SELECT USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their confinement data" ON public.fato_resumo
    FOR UPDATE USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their confinement data" ON public.fato_resumo
    FOR DELETE USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

-- Política para fato_trato
CREATE POLICY "Users can insert their confinement data" ON public.fato_trato
    FOR INSERT WITH CHECK (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can select their confinement data" ON public.fato_trato
    FOR SELECT USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their confinement data" ON public.fato_trato
    FOR UPDATE USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their confinement data" ON public.fato_trato
    FOR DELETE USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

-- Política para fato_carregamento
CREATE POLICY "Users can insert their confinement data" ON public.fato_carregamento
    FOR INSERT WITH CHECK (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can select their confinement data" ON public.fato_carregamento
    FOR SELECT USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their confinement data" ON public.fato_carregamento
    FOR UPDATE USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their confinement data" ON public.fato_carregamento
    FOR DELETE USING (
        confinamento_id IN (
            SELECT confinamento_id 
            FROM public.user_confinamentos 
            WHERE user_id = auth.uid()
        )
    );

-- 4. VERIFICAR POLÍTICAS CRIADAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('fato_resumo', 'fato_trato', 'fato_carregamento', 'assinaturas', 'user_confinamentos', 'user_roles')
ORDER BY tablename, policyname; 