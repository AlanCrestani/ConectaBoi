-- =====================================================
-- SISTEMA DE FACTURAÇÃO ELECTRÓNICA PARAGUAI
-- Criação de Views e Relatórios
-- =====================================================

-- =====================================================
-- VIEW: RESUMO DE FATURAS
-- =====================================================
CREATE OR REPLACE VIEW v_resumo_faturas AS
SELECT 
    f.id,
    f.numero_factura,
    f.data_emissao,
    e.razao_social as empresa_nome,
    c.nome as cliente_nome,
    c.ruc_ci as cliente_ruc,
    f.subtotal,
    f.total_iva,
    f.total_geral,
    f.status,
    f.cdc,
    f.observacoes,
    COUNT(i.id) as total_itens
FROM faturas f
JOIN empresas e ON f.empresa_id = e.id
JOIN clientes c ON f.cliente_id = c.id
LEFT JOIN itens_fatura i ON f.id = i.fatura_id
GROUP BY f.id, f.numero_factura, f.data_emissao, e.razao_social, c.nome, c.ruc_ci, 
         f.subtotal, f.total_iva, f.total_geral, f.status, f.cdc, f.observacoes;

-- =====================================================
-- VIEW: TOP CLIENTES
-- =====================================================
CREATE OR REPLACE VIEW v_top_clientes AS
SELECT 
    c.id,
    c.nome as cliente_nome,
    c.ruc_ci as cliente_ruc,
    COUNT(f.id) as total_faturas,
    COALESCE(SUM(f.total_geral), 0) as total_vendas,
    COALESCE(AVG(f.total_geral), 0) as ticket_medio,
    MAX(f.data_emissao) as ultima_compra
FROM clientes c
LEFT JOIN faturas f ON c.id = f.cliente_id AND f.status = 'ATIVA'
GROUP BY c.id, c.nome, c.ruc_ci
ORDER BY total_vendas DESC;

-- =====================================================
-- VIEW: TOP PRODUTOS
-- =====================================================
CREATE OR REPLACE VIEW v_top_produtos AS
SELECT 
    p.id,
    p.codigo,
    p.descricao,
    p.categoria,
    COUNT(i.id) as total_vendas,
    COALESCE(SUM(i.quantidade), 0) as quantidade_total,
    COALESCE(SUM(i.valor_total), 0) as valor_total_vendas,
    COALESCE(AVG(i.preco_unitario), 0) as preco_medio
FROM produtos p
LEFT JOIN itens_fatura i ON p.id = i.produto_id
LEFT JOIN faturas f ON i.fatura_id = f.id AND f.status = 'ATIVA'
GROUP BY p.id, p.codigo, p.descricao, p.categoria
ORDER BY valor_total_vendas DESC;

-- =====================================================
-- VIEW: RELATÓRIO DE IVA
-- =====================================================
CREATE OR REPLACE VIEW v_relatorio_iva AS
SELECT 
    DATE_TRUNC('month', f.data_emissao) as mes_ano,
    EXTRACT(YEAR FROM f.data_emissao) as ano,
    EXTRACT(MONTH FROM f.data_emissao) as mes,
    COUNT(f.id) as total_faturas,
    COALESCE(SUM(f.subtotal), 0) as subtotal_geral,
    COALESCE(SUM(f.iva_5_percent), 0) as iva_5_percent_total,
    COALESCE(SUM(f.iva_10_percent), 0) as iva_10_percent_total,
    COALESCE(SUM(f.total_iva), 0) as total_iva_geral,
    COALESCE(SUM(f.total_geral), 0) as total_geral
FROM faturas f
WHERE f.status = 'ATIVA'
GROUP BY DATE_TRUNC('month', f.data_emissao), EXTRACT(YEAR FROM f.data_emissao), EXTRACT(MONTH FROM f.data_emissao)
ORDER BY mes_ano DESC;

-- =====================================================
-- VIEW: FATURAS COMPLETAS COM DETALHES
-- =====================================================
CREATE OR REPLACE VIEW v_faturas_completas AS
SELECT 
    f.id as fatura_id,
    f.numero_factura,
    f.data_emissao,
    e.razao_social as empresa_nome,
    e.ruc as empresa_ruc,
    e.timbrado as empresa_timbrado,
    c.nome as cliente_nome,
    c.ruc_ci as cliente_ruc,
    c.endereco as cliente_endereco,
    c.telefone as cliente_telefone,
    f.condicao_venda,
    f.tipo_cambio,
    f.moeda,
    f.subtotal,
    f.desconto_total,
    f.iva_5_percent,
    f.iva_10_percent,
    f.total_iva,
    f.total_geral,
    f.cdc,
    f.status,
    f.observacoes,
    COUNT(i.id) as total_itens,
    STRING_AGG(
        p.descricao || ' (' || i.quantidade || ' ' || i.unidade_medida || ')', 
        '; ' ORDER BY i.created_at
    ) as itens_descricao
FROM faturas f
JOIN empresas e ON f.empresa_id = e.id
JOIN clientes c ON f.cliente_id = c.id
LEFT JOIN itens_fatura i ON f.id = i.fatura_id
LEFT JOIN produtos p ON i.produto_id = p.id
GROUP BY f.id, f.numero_factura, f.data_emissao, e.razao_social, e.ruc, e.timbrado,
         c.nome, c.ruc_ci, c.endereco, c.telefone, f.condicao_venda, f.tipo_cambio,
         f.moeda, f.subtotal, f.desconto_total, f.iva_5_percent, f.iva_10_percent,
         f.total_iva, f.total_geral, f.cdc, f.status, f.observacoes;

-- =====================================================
-- VIEW: ESTATÍSTICAS MENSAIS
-- =====================================================
CREATE OR REPLACE VIEW v_estatisticas_mensais AS
SELECT 
    EXTRACT(YEAR FROM f.data_emissao) as ano,
    EXTRACT(MONTH FROM f.data_emissao) as mes,
    TO_CHAR(f.data_emissao, 'YYYY-MM') as ano_mes,
    COUNT(f.id) as total_faturas,
    COUNT(DISTINCT f.cliente_id) as clientes_unicos,
    COALESCE(SUM(f.total_geral), 0) as receita_total,
    COALESCE(AVG(f.total_geral), 0) as ticket_medio,
    COALESCE(SUM(f.total_iva), 0) as iva_total,
    COALESCE(SUM(f.desconto_total), 0) as descontos_total,
    COUNT(CASE WHEN f.status = 'ATIVA' THEN 1 END) as faturas_ativas,
    COUNT(CASE WHEN f.status = 'CANCELADA' THEN 1 END) as faturas_canceladas
FROM faturas f
GROUP BY EXTRACT(YEAR FROM f.data_emissao), EXTRACT(MONTH FROM f.data_emissao), TO_CHAR(f.data_emissao, 'YYYY-MM')
ORDER BY ano DESC, mes DESC;

-- =====================================================
-- VIEW: PRODUTOS MAIS VENDIDOS POR MÊS
-- =====================================================
CREATE OR REPLACE VIEW v_produtos_mais_vendidos_mes AS
SELECT 
    EXTRACT(YEAR FROM f.data_emissao) as ano,
    EXTRACT(MONTH FROM f.data_emissao) as mes,
    p.codigo,
    p.descricao,
    p.categoria,
    COUNT(i.id) as vendas_realizadas,
    COALESCE(SUM(i.quantidade), 0) as quantidade_vendida,
    COALESCE(SUM(i.valor_total), 0) as valor_total_vendas,
    COALESCE(AVG(i.preco_unitario), 0) as preco_medio
FROM produtos p
JOIN itens_fatura i ON p.id = i.produto_id
JOIN faturas f ON i.fatura_id = f.id AND f.status = 'ATIVA'
GROUP BY EXTRACT(YEAR FROM f.data_emissao), EXTRACT(MONTH FROM f.data_emissao),
         p.codigo, p.descricao, p.categoria
ORDER BY ano DESC, mes DESC, valor_total_vendas DESC;

-- =====================================================
-- VIEW: CLIENTES MAIS ATIVOS
-- =====================================================
CREATE OR REPLACE VIEW v_clientes_mais_ativos AS
SELECT 
    c.id,
    c.nome as cliente_nome,
    c.ruc_ci as cliente_ruc,
    c.tipo_cliente,
    COUNT(f.id) as total_faturas,
    COALESCE(SUM(f.total_geral), 0) as valor_total_compras,
    COALESCE(AVG(f.total_geral), 0) as ticket_medio,
    MIN(f.data_emissao) as primeira_compra,
    MAX(f.data_emissao) as ultima_compra,
    EXTRACT(DAYS FROM (MAX(f.data_emissao) - MIN(f.data_emissao))) as dias_entre_primeira_ultima,
    COUNT(CASE WHEN f.data_emissao >= NOW() - INTERVAL '30 days' THEN 1 END) as faturas_ultimos_30_dias,
    COUNT(CASE WHEN f.data_emissao >= NOW() - INTERVAL '90 days' THEN 1 END) as faturas_ultimos_90_dias
FROM clientes c
LEFT JOIN faturas f ON c.id = f.cliente_id AND f.status = 'ATIVA'
GROUP BY c.id, c.nome, c.ruc_ci, c.tipo_cliente
ORDER BY valor_total_compras DESC;

-- =====================================================
-- VIEW: RESUMO FINANCEIRO
-- =====================================================
CREATE OR REPLACE VIEW v_resumo_financeiro AS
SELECT 
    EXTRACT(YEAR FROM f.data_emissao) as ano,
    EXTRACT(MONTH FROM f.data_emissao) as mes,
    TO_CHAR(f.data_emissao, 'YYYY-MM') as ano_mes,
    COUNT(f.id) as total_faturas,
    COALESCE(SUM(f.subtotal), 0) as subtotal_geral,
    COALESCE(SUM(f.desconto_total), 0) as descontos_geral,
    COALESCE(SUM(f.iva_5_percent), 0) as iva_5_percent_total,
    COALESCE(SUM(f.iva_10_percent), 0) as iva_10_percent_total,
    COALESCE(SUM(f.total_iva), 0) as total_iva,
    COALESCE(SUM(f.total_geral), 0) as receita_total,
    COALESCE(AVG(f.total_geral), 0) as ticket_medio,
    COALESCE(SUM(f.total_geral) / NULLIF(COUNT(f.id), 0), 0) as receita_media_por_fatura,
    COUNT(DISTINCT f.cliente_id) as clientes_unicos,
    COUNT(CASE WHEN f.condicao_venda = 'CONTADO' THEN 1 END) as vendas_a_vista,
    COUNT(CASE WHEN f.condicao_venda = 'CREDITO' THEN 1 END) as vendas_a_prazo
FROM faturas f
WHERE f.status = 'ATIVA'
GROUP BY EXTRACT(YEAR FROM f.data_emissao), EXTRACT(MONTH FROM f.data_emissao), TO_CHAR(f.data_emissao, 'YYYY-MM')
ORDER BY ano DESC, mes DESC;

-- =====================================================
-- VIEW: ANÁLISE DE DESCONTOS
-- =====================================================
CREATE OR REPLACE VIEW v_analise_descontos AS
SELECT 
    f.id as fatura_id,
    f.numero_factura,
    f.data_emissao,
    c.nome as cliente_nome,
    f.subtotal,
    f.desconto_total,
    CASE 
        WHEN f.subtotal > 0 THEN (f.desconto_total / f.subtotal) * 100 
        ELSE 0 
    END as percentual_desconto,
    f.total_geral,
    f.status
FROM faturas f
JOIN clientes c ON f.cliente_id = c.id
WHERE f.desconto_total > 0
ORDER BY f.data_emissao DESC;

-- =====================================================
-- VIEW: PRODUTOS POR CATEGORIA
-- =====================================================
CREATE OR REPLACE VIEW v_produtos_por_categoria AS
SELECT 
    p.categoria,
    COUNT(p.id) as total_produtos,
    COUNT(CASE WHEN p.ativo = TRUE THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN p.ativo = FALSE THEN 1 END) as produtos_inativos,
    COALESCE(AVG(p.preco_base), 0) as preco_medio_categoria,
    COALESCE(SUM(i.valor_total), 0) as vendas_categoria,
    COUNT(DISTINCT i.fatura_id) as faturas_com_produtos_categoria
FROM produtos p
LEFT JOIN itens_fatura i ON p.id = i.produto_id
LEFT JOIN faturas f ON i.fatura_id = f.id AND f.status = 'ATIVA'
GROUP BY p.categoria
ORDER BY vendas_categoria DESC;

-- =====================================================
-- VERIFICAÇÃO DE CRIAÇÃO
-- =====================================================
SELECT 'Views e relatórios criados com sucesso!' as status;

-- Listar todas as views criadas
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE 'v_%'
ORDER BY viewname; 