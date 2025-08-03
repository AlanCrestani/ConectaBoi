-- =====================================================
-- SISTEMA DE FACTURAÇÃO ELECTRÓNICA PARAGUAI
-- Criação das Tabelas Principais
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA: empresas
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    ruc VARCHAR(20) UNIQUE NOT NULL,
    timbrado VARCHAR(20),
    endereco TEXT,
    telefone VARCHAR(50),
    email VARCHAR(100),
    atividade_economica TEXT,
    data_inicio_vigencia DATE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA: clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    ruc_ci VARCHAR(20),
    endereco TEXT,
    telefone VARCHAR(50),
    email VARCHAR(100),
    tipo_cliente VARCHAR(20) CHECK (tipo_cliente IN ('PESSOA_FISICA', 'PESSOA_JURIDICA')),
    empresa_id UUID REFERENCES empresas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA: produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(100),
    descricao TEXT NOT NULL,
    unidade_medida VARCHAR(20),
    preco_base DECIMAL(15,2),
    iva_percent DECIMAL(5,2) DEFAULT 10.00,
    categoria VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    empresa_id UUID REFERENCES empresas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA: faturas
-- =====================================================
CREATE TABLE IF NOT EXISTS faturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    empresa_id UUID REFERENCES empresas(id),
    cliente_id UUID REFERENCES clientes(id),
    data_emissao TIMESTAMP WITH TIME ZONE NOT NULL,
    condicao_venda VARCHAR(50) DEFAULT 'CONTADO',
    tipo_cambio DECIMAL(10,4) DEFAULT 1.0000,
    moeda VARCHAR(10) DEFAULT 'PYG',
    numero_venda VARCHAR(50),
    numero_pedido VARCHAR(50),
    prazo_credito_dias INTEGER DEFAULT 0,
    tipo_transacao VARCHAR(50),
    subtotal DECIMAL(15,2),
    desconto_total DECIMAL(15,2) DEFAULT 0,
    iva_5_percent DECIMAL(15,2) DEFAULT 0,
    iva_10_percent DECIMAL(15,2) DEFAULT 0,
    total_iva DECIMAL(15,2),
    total_geral DECIMAL(15,2),
    cdc VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'CANCELADA', 'ANULADA')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA: itens_fatura
-- =====================================================
CREATE TABLE IF NOT EXISTS itens_fatura (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fatura_id UUID REFERENCES faturas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    codigo_produto VARCHAR(100),
    descricao TEXT NOT NULL,
    unidade_medida VARCHAR(20),
    quantidade DECIMAL(10,3) NOT NULL,
    preco_unitario DECIMAL(15,2) NOT NULL,
    desconto_percent DECIMAL(5,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    iva_percent DECIMAL(5,2) DEFAULT 10.00,
    valor_iva DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA: timbrados
-- =====================================================
CREATE TABLE IF NOT EXISTS timbrados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    numero_timbrado VARCHAR(20) NOT NULL,
    data_inicio_vigencia DATE NOT NULL,
    data_fim_vigencia DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA: configuracoes
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    chave VARCHAR(100) NOT NULL,
    valor TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, chave)
);

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================
COMMENT ON TABLE empresas IS 'Empresas cadastradas no sistema';
COMMENT ON TABLE clientes IS 'Clientes das empresas';
COMMENT ON TABLE produtos IS 'Produtos/serviços oferecidos';
COMMENT ON TABLE faturas IS 'Faturas eletrônicas emitidas';
COMMENT ON TABLE itens_fatura IS 'Itens de cada fatura';
COMMENT ON TABLE timbrados IS 'Timbrados fiscais das empresas';
COMMENT ON TABLE configuracoes IS 'Configurações específicas por empresa';

-- =====================================================
-- VERIFICAÇÃO DE CRIAÇÃO
-- =====================================================
SELECT 'Tabelas criadas com sucesso!' as status; 