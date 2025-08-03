-- =====================================================
-- CRIAR VIEWS PARA RELATÓRIOS DE COMBUSTÍVEL
-- =====================================================

-- View para resumo de consumo por equipamento
CREATE OR REPLACE VIEW public.v_consumo_por_equipamento AS
SELECT 
  cl.equipamento,
  COUNT(cl.id) as total_abastecimentos,
  SUM(cl.quantidade_litros) as total_litros,
  SUM(cl.valor_total) as total_gasto,
  AVG(cl.preco_unitario) as preco_medio,
  MAX(cl.data) as ultimo_abastecimento
FROM public.combustivel_lancamentos cl
GROUP BY cl.equipamento;

-- View para resumo de consumo por usuário
CREATE OR REPLACE VIEW public.v_consumo_por_usuario AS
SELECT 
  u.nome as usuario,
  u.cargo,
  COUNT(cl.id) as total_lancamentos,
  SUM(cl.quantidade_litros) as total_litros,
  SUM(cl.valor_total) as total_gasto,
  MAX(cl.data) as ultimo_lancamento
FROM public.usuarios_combustivel u
LEFT JOIN public.combustivel_lancamentos cl ON u.id = cl.created_by
GROUP BY u.id, u.nome, u.cargo;

-- View para alertas ativos
CREATE OR REPLACE VIEW public.v_alertas_ativos AS
SELECT 
  a.id,
  a.tipo_alerta,
  a.valor_limite,
  a.ativo,
  a.created_at
FROM public.combustivel_alertas a
WHERE a.ativo = true
ORDER BY a.created_at DESC;

-- View para resumo diário de combustível
CREATE OR REPLACE VIEW public.v_combustivel_resumo_diario AS
SELECT 
  cl.data,
  cl.tipo_combustivel,
  SUM(cl.quantidade_litros) as total_litros,
  SUM(cl.valor_total) as total_valor,
  AVG(cl.preco_unitario) as preco_medio,
  COUNT(*) as total_lancamentos,
  STRING_AGG(DISTINCT cl.equipamento, ', ') as equipamentos_utilizados,
  STRING_AGG(DISTINCT cl.operador, ', ') as operadores
FROM public.combustivel_lancamentos cl
GROUP BY cl.data, cl.tipo_combustivel
ORDER BY cl.data DESC, cl.tipo_combustivel;

-- View para resumo mensal de combustível
CREATE OR REPLACE VIEW public.v_combustivel_resumo_mensal AS
SELECT 
  DATE_TRUNC('month', cl.data) as mes,
  cl.tipo_combustivel,
  SUM(cl.quantidade_litros) as total_litros,
  SUM(cl.valor_total) as total_valor,
  AVG(cl.preco_unitario) as preco_medio,
  COUNT(*) as total_lancamentos,
  COUNT(DISTINCT cl.data) as dias_com_lancamentos,
  STRING_AGG(DISTINCT cl.equipamento, ', ') as equipamentos_utilizados
FROM public.combustivel_lancamentos cl
GROUP BY DATE_TRUNC('month', cl.data), cl.tipo_combustivel
ORDER BY mes DESC, cl.tipo_combustivel;

-- View para equipamentos mais utilizados
CREATE OR REPLACE VIEW public.v_combustivel_equipamentos_ranking AS
SELECT 
  cl.equipamento,
  COUNT(cl.id) as total_lancamentos,
  SUM(cl.quantidade_litros) as total_litros,
  SUM(cl.valor_total) as total_valor,
  AVG(cl.preco_unitario) as preco_medio,
  MIN(cl.data) as primeira_utilizacao,
  MAX(cl.data) as ultima_utilizacao
FROM public.combustivel_lancamentos cl
GROUP BY cl.equipamento
ORDER BY total_litros DESC;

-- View para operadores mais ativos
CREATE OR REPLACE VIEW public.v_combustivel_operadores_ranking AS
SELECT 
  cl.operador,
  COUNT(cl.id) as total_lancamentos,
  SUM(cl.quantidade_litros) as total_litros,
  SUM(cl.valor_total) as total_valor,
  MIN(cl.data) as primeira_operacao,
  MAX(cl.data) as ultima_operacao
FROM public.combustivel_lancamentos cl
GROUP BY cl.operador
ORDER BY total_lancamentos DESC;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

-- Estrutura criada com sucesso! 
-- Agora você pode:
-- 1. Cadastrar usuários através da aplicação
-- 2. Cadastrar equipamentos
-- 3. Fazer lançamentos de combustível
-- 4. Configurar alertas
-- 5. Usar as views para relatórios

-- Para testar as views (quando houver dados):
-- SELECT * FROM public.v_consumo_por_equipamento;
-- SELECT * FROM public.v_consumo_por_usuario;
-- SELECT * FROM public.v_alertas_ativos;
-- SELECT * FROM public.v_combustivel_resumo_diario;
-- SELECT * FROM public.v_combustivel_resumo_mensal;
-- SELECT * FROM public.v_combustivel_equipamentos_ranking;
-- SELECT * FROM public.v_combustivel_operadores_ranking; 