-- =====================================================
-- SISTEMA DE FACTURAÇÃO ELECTRÓNICA PARAGUAI
-- Criação de Funções e Triggers
-- =====================================================

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- FUNÇÃO PARA VALIDAR RUC PARAGUAI
-- =====================================================
CREATE OR REPLACE FUNCTION validar_ruc_paraguai(ruc TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    ruc_limpo TEXT;
    digitos INTEGER[];
    soma INTEGER := 0;
    resto INTEGER;
    digito_verificador INTEGER;
    i INTEGER;
BEGIN
    -- Remover hífen se existir
    ruc_limpo := REPLACE(ruc, '-', '');
    
    -- Verificar se tem 9 dígitos
    IF LENGTH(ruc_limpo) != 9 THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se são apenas números
    IF ruc_limpo !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Converter para array de dígitos
    digitos := ARRAY[]::INTEGER[];
    FOR i IN 1..8 LOOP
        digitos := array_append(digitos, CAST(SUBSTRING(ruc_limpo FROM i FOR 1) AS INTEGER));
    END LOOP;
    
    -- Calcular soma ponderada (algoritmo paraguaio)
    soma := digitos[1] * 3 + digitos[2] * 4 + digitos[3] * 5 + digitos[4] * 6 + 
            digitos[5] * 7 + digitos[6] * 2 + digitos[7] * 3 + digitos[8] * 4;
    
    -- Calcular resto
    resto := soma % 11;
    
    -- Calcular dígito verificador
    IF resto = 0 THEN
        digito_verificador := 0;
    ELSE
        digito_verificador := 11 - resto;
    END IF;
    
    -- Verificar se o dígito verificador calculado é igual ao último dígito
    RETURN digito_verificador = CAST(SUBSTRING(ruc_limpo FROM 9 FOR 1) AS INTEGER);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA GERAR CDC (CÓDIGO DE CONTROLE)
-- =====================================================
CREATE OR REPLACE FUNCTION gerar_cdc(
    numero_factura TEXT,
    ruc_empresa TEXT,
    ruc_cliente TEXT,
    total_geral DECIMAL,
    data_emissao DATE
)
RETURNS TEXT AS $$
DECLARE
    cdc_base TEXT;
    cdc_final TEXT;
    checksum TEXT;
BEGIN
    -- Formato base do CDC (44 dígitos)
    -- RUC Empresa (9) + RUC Cliente (9) + Número Factura (8) + 
    -- Data (8) + Total (10) = 44 dígitos
    
    cdc_base := 
        LPAD(REPLACE(ruc_empresa, '-', ''), 9, '0') ||
        LPAD(REPLACE(ruc_cliente, '-', ''), 9, '0') ||
        LPAD(numero_factura, 8, '0') ||
        TO_CHAR(data_emissao, 'YYYYMMDD') ||
        LPAD(CAST(total_geral * 100 AS INTEGER), 10, '0');
    
    -- Gerar checksum simples (últimos 2 dígitos)
    checksum := LPAD(CAST(ABS(cdc_base::BIGINT % 100) AS TEXT), 2, '0');
    
    cdc_final := cdc_base || checksum;
    
    RETURN cdc_final;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA GERAR PRÓXIMO NÚMERO DE FACTURA
-- =====================================================
CREATE OR REPLACE FUNCTION proximo_numero_factura(empresa_id UUID)
RETURNS TEXT AS $$
DECLARE
    ultimo_numero INTEGER;
    proximo_numero TEXT;
    ano_atual TEXT;
BEGIN
    -- Obter ano atual
    ano_atual := TO_CHAR(NOW(), 'YYYY');
    
    -- Buscar último número de factura da empresa no ano atual
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_factura FROM 9) AS INTEGER)), 0)
    INTO ultimo_numero
    FROM faturas 
    WHERE empresa_id = proximo_numero_factura.empresa_id
    AND numero_factura LIKE ano_atual || '%';
    
    -- Gerar próximo número
    proximo_numero := ano_atual || LPAD(CAST(ultimo_numero + 1 AS TEXT), 6, '0');
    
    RETURN proximo_numero;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA CALCULAR TOTAIS DA FACTURA
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_totais_fatura(fatura_id UUID)
RETURNS VOID AS $$
DECLARE
    subtotal_calc DECIMAL(15,2) := 0;
    iva_5_calc DECIMAL(15,2) := 0;
    iva_10_calc DECIMAL(15,2) := 0;
    total_iva_calc DECIMAL(15,2) := 0;
    total_geral_calc DECIMAL(15,2) := 0;
    desconto_total_calc DECIMAL(15,2) := 0;
BEGIN
    -- Calcular subtotal e IVA dos itens
    SELECT 
        COALESCE(SUM(valor_total), 0),
        COALESCE(SUM(CASE WHEN iva_percent = 5 THEN valor_iva ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN iva_percent = 10 THEN valor_iva ELSE 0 END), 0),
        COALESCE(SUM(valor_desconto), 0)
    INTO subtotal_calc, iva_5_calc, iva_10_calc, desconto_total_calc
    FROM itens_fatura 
    WHERE fatura_id = calcular_totais_fatura.fatura_id;
    
    -- Calcular totais
    total_iva_calc := iva_5_calc + iva_10_calc;
    total_geral_calc := subtotal_calc + total_iva_calc - desconto_total_calc;
    
    -- Atualizar fatura
    UPDATE faturas SET
        subtotal = subtotal_calc,
        iva_5_percent = iva_5_calc,
        iva_10_percent = iva_10_calc,
        total_iva = total_iva_calc,
        desconto_total = desconto_total_calc,
        total_geral = total_geral_calc,
        updated_at = NOW()
    WHERE id = fatura_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER PARA CALCULAR TOTAIS AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_calcular_totais()
RETURNS TRIGGER AS $$
BEGIN
    -- Chamar função de cálculo de totais
    PERFORM calcular_totais_fatura(NEW.fatura_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faturas_updated_at 
    BEFORE UPDATE ON faturas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timbrados_updated_at 
    BEFORE UPDATE ON timbrados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at 
    BEFORE UPDATE ON configuracoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS PARA CALCULAR TOTAIS AUTOMATICAMENTE
-- =====================================================
CREATE TRIGGER trigger_calcular_totais_insert
    AFTER INSERT ON itens_fatura
    FOR EACH ROW EXECUTE FUNCTION trigger_calcular_totais();

CREATE TRIGGER trigger_calcular_totais_update
    AFTER UPDATE ON itens_fatura
    FOR EACH ROW EXECUTE FUNCTION trigger_calcular_totais();

CREATE TRIGGER trigger_calcular_totais_delete
    AFTER DELETE ON itens_fatura
    FOR EACH ROW EXECUTE FUNCTION trigger_calcular_totais();

-- =====================================================
-- FUNÇÃO PARA RELATÓRIO DE VENDAS MENSAIS
-- =====================================================
CREATE OR REPLACE FUNCTION relatorio_vendas_mensal(
    empresa_id UUID,
    ano INTEGER,
    mes INTEGER
)
RETURNS TABLE(
    data_fatura DATE,
    numero_factura TEXT,
    cliente_nome TEXT,
    subtotal DECIMAL(15,2),
    total_iva DECIMAL(15,2),
    total_geral DECIMAL(15,2),
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.data_emissao::DATE as data_fatura,
        f.numero_factura,
        c.nome as cliente_nome,
        f.subtotal,
        f.total_iva,
        f.total_geral,
        f.status
    FROM faturas f
    JOIN clientes c ON f.cliente_id = c.id
    WHERE f.empresa_id = relatorio_vendas_mensal.empresa_id
    AND EXTRACT(YEAR FROM f.data_emissao) = ano
    AND EXTRACT(MONTH FROM f.data_emissao) = mes
    ORDER BY f.data_emissao DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA VALIDAR TIMBRADO
-- =====================================================
CREATE OR REPLACE FUNCTION validar_timbrado(
    numero_timbrado TEXT,
    empresa_id UUID,
    data_emissao DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    timbrado_valido BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM timbrados 
        WHERE numero_timbrado = validar_timbrado.numero_timbrado
        AND empresa_id = validar_timbrado.empresa_id
        AND ativo = TRUE
        AND data_emissao BETWEEN data_inicio_vigencia AND data_fim_vigencia
    ) INTO timbrado_valido;
    
    RETURN timbrado_valido;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICAÇÃO DE CRIAÇÃO
-- =====================================================
SELECT 'Funções e triggers criados com sucesso!' as status; 