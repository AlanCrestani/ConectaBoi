-- =====================================================
-- SISTEMA DE FACTURAÇÃO ELECTRÓNICA PARAGUAI
-- Inserção de Dados de Exemplo
-- =====================================================

-- =====================================================
-- 1. INSERIR EMPRESAS DE EXEMPLO
-- =====================================================

-- Empresa principal (KAROL S.A.)
INSERT INTO empresas (
    razao_social,
    ruc,
    timbrado,
    endereco,
    telefone,
    email,
    atividade_economica,
    data_inicio_vigencia
) VALUES (
    'KAROL S.A.',
    '80034080-9',
    '12345678',
    'Rua Principal, 123 - Asunción, Paraguai',
    '+595 21 123 456',
    'contato@karol.com.py',
    'Comércio de combustíveis e lubrificantes',
    '2024-01-01'
);

-- =====================================================
-- 2. INSERIR CLIENTES DE EXEMPLO
-- =====================================================

-- Cliente principal (GANADERA SIETE MONTES S.A.)
INSERT INTO clientes (
    nome,
    ruc_ci,
    endereco,
    telefone,
    email,
    tipo_cliente,
    empresa_id
) VALUES 
(
    'GANADERA SIETE MONTES S.A.',
    '80029530-7',
    'Estancia San José, Km 45 - Chaco, Paraguai',
    '+595 21 987 654',
    'gerencia@sietemontes.com.py',
    'PESSOA_JURIDICA',
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
),
(
    'TRANSPORTES RÁPIDOS LTDA.',
    '80012345-1',
    'Av. Industrial, 789 - Ciudad del Este, Paraguai',
    '+595 61 456 789',
    'admin@transportesrapidos.com.py',
    'PESSOA_JURIDICA',
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
),
(
    'MARÍA GONZÁLEZ',
    '12345678-9',
    'Calle Comercial, 456 - Encarnación, Paraguai',
    '+595 71 234 567',
    'maria.gonzalez@email.com',
    'PESSOA_FISICA',
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
);

-- =====================================================
-- 3. INSERIR PRODUTOS DE EXEMPLO
-- =====================================================

INSERT INTO produtos (
    codigo,
    descricao,
    unidade_medida,
    preco_base,
    iva_percent,
    categoria,
    ativo,
    empresa_id
) VALUES 
(
    'DIESEL-001',
    'COMB. DIESEL T3 B URUGUAIY',
    'LITROS',
    8500.00,
    10.00,
    'Combustíveis',
    TRUE,
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
),
(
    'GASOLINA-001',
    'GASOLINA PREMIUM 95 OCTANOS',
    'LITROS',
    9200.00,
    10.00,
    'Combustíveis',
    TRUE,
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
),
(
    'LUB-001',
    'ÓLEO LUBRIFICANTE 15W-40',
    'LITROS',
    45000.00,
    10.00,
    'Lubrificantes',
    TRUE,
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
),
(
    'ADIT-001',
    'ADITIVO PARA COMBUSTÍVEL',
    'UNIDADES',
    25000.00,
    10.00,
    'Aditivos',
    TRUE,
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
),
(
    'FILTRO-001',
    'FILTRO DE COMBUSTÍVEL',
    'UNIDADES',
    35000.00,
    10.00,
    'Filtros',
    TRUE,
    (SELECT id FROM empresas WHERE ruc = '80034080-9')
);

-- =====================================================
-- 4. INSERIR TIMBRADOS DE EXEMPLO
-- =====================================================

INSERT INTO timbrados (
    empresa_id,
    numero_timbrado,
    data_inicio_vigencia,
    data_fim_vigencia,
    ativo
) VALUES (
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    '12345678',
    '2024-01-01',
    '2024-12-31',
    TRUE
);

-- =====================================================
-- 5. INSERIR CONFIGURAÇÕES DE EXEMPLO
-- =====================================================

INSERT INTO configuracoes (
    empresa_id,
    chave,
    valor,
    descricao
) VALUES 
(
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    'moeda_padrao',
    'PYG',
    'Moeda padrão para faturas'
),
(
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    'iva_padrao',
    '10.00',
    'Percentual padrão de IVA'
),
(
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    'condicao_pagamento_padrao',
    'CONTADO',
    'Condição de pagamento padrão'
),
(
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    'prazo_credito_padrao',
    '0',
    'Prazo de crédito padrão em dias'
);

-- =====================================================
-- 6. INSERIR FATURAS DE EXEMPLO
-- =====================================================

-- Fatura 1
INSERT INTO faturas (
    numero_factura,
    empresa_id,
    cliente_id,
    data_emissao,
    condicao_venda,
    tipo_cambio,
    moeda,
    subtotal,
    desconto_total,
    iva_5_percent,
    iva_10_percent,
    total_iva,
    total_geral,
    cdc,
    status,
    observacoes
) VALUES (
    '2024000001',
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    (SELECT id FROM clientes WHERE ruc_ci = '80029530-7'),
    '2024-01-15 10:30:00',
    'CONTADO',
    1.0000,
    'PYG',
    4250000.00,
    0.00,
    0.00,
    425000.00,
    425000.00,
    4675000.00,
    '8003408080029530712024000001202401154250000000',
    'ATIVA',
    'Entrega na estância San José'
);

-- Fatura 2
INSERT INTO faturas (
    numero_factura,
    empresa_id,
    cliente_id,
    data_emissao,
    condicao_venda,
    tipo_cambio,
    moeda,
    subtotal,
    desconto_total,
    iva_5_percent,
    iva_10_percent,
    total_iva,
    total_geral,
    cdc,
    status,
    observacoes
) VALUES (
    '2024000002',
    (SELECT id FROM empresas WHERE ruc = '80034080-9'),
    (SELECT id FROM clientes WHERE ruc_ci = '80012345-1'),
    '2024-01-16 14:15:00',
    'CREDITO',
    1.0000,
    'PYG',
    1840000.00,
    92000.00,
    0.00,
    174800.00,
    174800.00,
    1922800.00,
    '8003408080012345120240000022024011619200000000',
    'ATIVA',
    'Entrega no depósito central'
);

-- =====================================================
-- 7. INSERIR ITENS DAS FATURAS
-- =====================================================

-- Itens da Fatura 1
INSERT INTO itens_fatura (
    fatura_id,
    produto_id,
    codigo_produto,
    descricao,
    unidade_medida,
    quantidade,
    preco_unitario,
    desconto_percent,
    valor_desconto,
    valor_total,
    iva_percent,
    valor_iva
) VALUES 
(
    (SELECT id FROM faturas WHERE numero_factura = '2024000001'),
    (SELECT id FROM produtos WHERE codigo = 'DIESEL-001'),
    'DIESEL-001',
    'COMB. DIESEL T3 B URUGUAIY',
    'LITROS',
    500.00,
    8500.00,
    0.00,
    0.00,
    4250000.00,
    10.00,
    425000.00
);

-- Itens da Fatura 2
INSERT INTO itens_fatura (
    fatura_id,
    produto_id,
    codigo_produto,
    descricao,
    unidade_medida,
    quantidade,
    preco_unitario,
    desconto_percent,
    valor_desconto,
    valor_total,
    iva_percent,
    valor_iva
) VALUES 
(
    (SELECT id FROM faturas WHERE numero_factura = '2024000002'),
    (SELECT id FROM produtos WHERE codigo = 'GASOLINA-001'),
    'GASOLINA-001',
    'GASOLINA PREMIUM 95 OCTANOS',
    'LITROS',
    200.00,
    9200.00,
    5.00,
    92000.00,
    1840000.00,
    10.00,
    174800.00
);

-- =====================================================
-- VERIFICAÇÃO DE INSERÇÃO
-- =====================================================
SELECT 'Dados de exemplo inseridos com sucesso!' as status;

-- Verificar dados inseridos
SELECT 'Empresas criadas:' as info, COUNT(*) as total FROM empresas;
SELECT 'Clientes criados:' as info, COUNT(*) as total FROM clientes;
SELECT 'Produtos criados:' as info, COUNT(*) as total FROM produtos;
SELECT 'Faturas criadas:' as info, COUNT(*) as total FROM faturas;
SELECT 'Itens de fatura criados:' as info, COUNT(*) as total FROM itens_fatura; 