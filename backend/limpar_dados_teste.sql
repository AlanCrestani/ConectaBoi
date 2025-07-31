-- Limpar Dados de Teste - ConectaBoi Insight
-- Este script remove todos os dados de teste das tabelas

-- 1. LIMPAR TABELA fato_carregamento (dados de teste)
DELETE FROM public.fato_carregamento 
WHERE confinamento_id = '00000000-0000-0000-0000-000000000001';

-- 2. LIMPAR TABELA fato_trato (se existir dados)
DELETE FROM public.fato_trato 
WHERE confinamento_id = '00000000-0000-0000-0000-000000000001';

-- 3. LIMPAR TABELA fato_resumo (se existir dados)
DELETE FROM public.fato_resumo 
WHERE confinamento_id = '00000000-0000-0000-0000-000000000001';

-- 4. VERIFICAR RESULTADO
SELECT 
    'fato_carregamento' as tabela,
    COUNT(*) as registros_restantes
FROM public.fato_carregamento
UNION ALL
SELECT 
    'fato_trato' as tabela,
    COUNT(*) as registros_restantes
FROM public.fato_trato
UNION ALL
SELECT 
    'fato_resumo' as tabela,
    COUNT(*) as registros_restantes
FROM public.fato_resumo;

-- 5. MANTER DADOS DO SISTEMA (user_confinamentos, user_roles, assinaturas)
-- Estes dados NÃO devem ser apagados pois são necessários para o funcionamento 