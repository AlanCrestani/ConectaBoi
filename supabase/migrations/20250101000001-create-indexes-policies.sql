-- =====================================================
-- SISTEMA DE FACTURAÇÃO ELECTRÓNICA PARAGUAI
-- Criação de Índices e Políticas RLS
-- =====================================================

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_empresas_ruc ON empresas(ruc);
CREATE INDEX IF NOT EXISTS idx_empresas_created_at ON empresas(created_at);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc_ci ON clientes(ruc_ci);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo_cliente ON clientes(tipo_cliente);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);

-- Índices para faturas
CREATE INDEX IF NOT EXISTS idx_faturas_empresa_id ON faturas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_faturas_cliente_id ON faturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_faturas_numero_factura ON faturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_faturas_data_emissao ON faturas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_faturas_cdc ON faturas(cdc);

-- Índices para itens_fatura
CREATE INDEX IF NOT EXISTS idx_itens_fatura_fatura_id ON itens_fatura(fatura_id);
CREATE INDEX IF NOT EXISTS idx_itens_fatura_produto_id ON itens_fatura(produto_id);

-- Índices para timbrados
CREATE INDEX IF NOT EXISTS idx_timbrados_empresa_id ON timbrados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_timbrados_numero_timbrado ON timbrados(numero_timbrado);
CREATE INDEX IF NOT EXISTS idx_timbrados_ativo ON timbrados(ativo);

-- Índices para configuracoes
CREATE INDEX IF NOT EXISTS idx_configuracoes_empresa_id ON configuracoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_fatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE timbrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA empresas
-- =====================================================

-- Usuários podem ver apenas suas próprias empresas
CREATE POLICY "Usuários podem ver suas empresas" ON empresas
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias empresas
CREATE POLICY "Usuários podem inserir suas empresas" ON empresas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias empresas
CREATE POLICY "Usuários podem atualizar suas empresas" ON empresas
    FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias empresas
CREATE POLICY "Usuários podem deletar suas empresas" ON empresas
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS RLS PARA clientes
-- =====================================================

-- Usuários podem ver clientes de suas empresas
CREATE POLICY "Usuários podem ver clientes de suas empresas" ON clientes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = clientes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem inserir clientes em suas empresas
CREATE POLICY "Usuários podem inserir clientes em suas empresas" ON clientes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = clientes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar clientes de suas empresas
CREATE POLICY "Usuários podem atualizar clientes de suas empresas" ON clientes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = clientes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem deletar clientes de suas empresas
CREATE POLICY "Usuários podem deletar clientes de suas empresas" ON clientes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = clientes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA produtos
-- =====================================================

-- Usuários podem ver produtos de suas empresas
CREATE POLICY "Usuários podem ver produtos de suas empresas" ON produtos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = produtos.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem inserir produtos em suas empresas
CREATE POLICY "Usuários podem inserir produtos em suas empresas" ON produtos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = produtos.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar produtos de suas empresas
CREATE POLICY "Usuários podem atualizar produtos de suas empresas" ON produtos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = produtos.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem deletar produtos de suas empresas
CREATE POLICY "Usuários podem deletar produtos de suas empresas" ON produtos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = produtos.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA faturas
-- =====================================================

-- Usuários podem ver faturas de suas empresas
CREATE POLICY "Usuários podem ver faturas de suas empresas" ON faturas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = faturas.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem inserir faturas em suas empresas
CREATE POLICY "Usuários podem inserir faturas em suas empresas" ON faturas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = faturas.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar faturas de suas empresas
CREATE POLICY "Usuários podem atualizar faturas de suas empresas" ON faturas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = faturas.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem deletar faturas de suas empresas
CREATE POLICY "Usuários podem deletar faturas de suas empresas" ON faturas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = faturas.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA itens_fatura
-- =====================================================

-- Usuários podem ver itens de faturas de suas empresas
CREATE POLICY "Usuários podem ver itens de faturas de suas empresas" ON itens_fatura
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faturas f
            JOIN empresas e ON f.empresa_id = e.id
            WHERE f.id = itens_fatura.fatura_id 
            AND e.user_id = auth.uid()
        )
    );

-- Usuários podem inserir itens em faturas de suas empresas
CREATE POLICY "Usuários podem inserir itens em faturas de suas empresas" ON itens_fatura
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM faturas f
            JOIN empresas e ON f.empresa_id = e.id
            WHERE f.id = itens_fatura.fatura_id 
            AND e.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar itens de faturas de suas empresas
CREATE POLICY "Usuários podem atualizar itens de faturas de suas empresas" ON itens_fatura
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM faturas f
            JOIN empresas e ON f.empresa_id = e.id
            WHERE f.id = itens_fatura.fatura_id 
            AND e.user_id = auth.uid()
        )
    );

-- Usuários podem deletar itens de faturas de suas empresas
CREATE POLICY "Usuários podem deletar itens de faturas de suas empresas" ON itens_fatura
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM faturas f
            JOIN empresas e ON f.empresa_id = e.id
            WHERE f.id = itens_fatura.fatura_id 
            AND e.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA timbrados
-- =====================================================

-- Usuários podem ver timbrados de suas empresas
CREATE POLICY "Usuários podem ver timbrados de suas empresas" ON timbrados
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = timbrados.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem inserir timbrados em suas empresas
CREATE POLICY "Usuários podem inserir timbrados em suas empresas" ON timbrados
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = timbrados.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar timbrados de suas empresas
CREATE POLICY "Usuários podem atualizar timbrados de suas empresas" ON timbrados
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = timbrados.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem deletar timbrados de suas empresas
CREATE POLICY "Usuários podem deletar timbrados de suas empresas" ON timbrados
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = timbrados.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA configuracoes
-- =====================================================

-- Usuários podem ver configurações de suas empresas
CREATE POLICY "Usuários podem ver configurações de suas empresas" ON configuracoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = configuracoes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem inserir configurações em suas empresas
CREATE POLICY "Usuários podem inserir configurações em suas empresas" ON configuracoes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = configuracoes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar configurações de suas empresas
CREATE POLICY "Usuários podem atualizar configurações de suas empresas" ON configuracoes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = configuracoes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- Usuários podem deletar configurações de suas empresas
CREATE POLICY "Usuários podem deletar configurações de suas empresas" ON configuracoes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM empresas 
            WHERE empresas.id = configuracoes.empresa_id 
            AND empresas.user_id = auth.uid()
        )
    );

-- =====================================================
-- VERIFICAÇÃO DE CRIAÇÃO
-- =====================================================
SELECT 'Índices e políticas RLS criados com sucesso!' as status; 