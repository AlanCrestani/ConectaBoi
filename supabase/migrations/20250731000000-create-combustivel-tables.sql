-- Criar tabelas para controle de combustível
-- Migração: 20250731000000-create-combustivel-tables.sql

-- Tabela de usuários específica para controle de combustível
CREATE TABLE IF NOT EXISTS public.usuarios_combustivel (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  confinamento_nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela usuarios_combustivel
ALTER TABLE public.usuarios_combustivel ENABLE ROW LEVEL SECURITY;

-- Política RLS para usuarios_combustivel
CREATE POLICY "Usuários podem gerenciar próprio perfil" ON public.usuarios_combustivel
  FOR ALL USING (auth.uid() = id);

-- Tabela principal de lançamentos de combustível
CREATE TABLE public.combustivel_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo_combustivel TEXT NOT NULL, -- 'Diesel S10', 'Gasolina', 'Etanol'
  quantidade_litros DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  equipamento TEXT NOT NULL,
  operador TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  mobile_synced_at TIMESTAMPTZ,
  mobile_created_at TIMESTAMPTZ
);

-- Tabela de alertas de combustível
CREATE TABLE public.combustivel_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL, -- 'consumo_diario', 'custo_diario', 'preco_unitario'
  valor_limite DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de equipamentos
CREATE TABLE public.combustivel_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'Trator', 'Caminhão', 'Gerador', 'Outros'
  modelo TEXT,
  ano_fabricacao INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_usuarios_combustivel_email ON public.usuarios_combustivel(email);
CREATE INDEX idx_usuarios_combustivel_confinamento ON public.usuarios_combustivel(confinamento_nome);
CREATE INDEX idx_usuarios_combustivel_ativo ON public.usuarios_combustivel(ativo);

CREATE INDEX idx_combustivel_lancamentos_confinamento ON public.combustivel_lancamentos(confinamento_id);
CREATE INDEX idx_combustivel_lancamentos_data ON public.combustivel_lancamentos(data);
CREATE INDEX idx_combustivel_lancamentos_tipo ON public.combustivel_lancamentos(tipo_combustivel);
CREATE INDEX idx_combustivel_lancamentos_equipamento ON public.combustivel_lancamentos(equipamento);

CREATE INDEX idx_combustivel_alertas_confinamento ON public.combustivel_alertas(confinamento_id);
CREATE INDEX idx_combustivel_alertas_user ON public.combustivel_alertas(user_id);
CREATE INDEX idx_combustivel_alertas_tipo ON public.combustivel_alertas(tipo_alerta);

CREATE INDEX idx_combustivel_equipamentos_confinamento ON public.combustivel_equipamentos(confinamento_id);
CREATE INDEX idx_combustivel_equipamentos_tipo ON public.combustivel_equipamentos(tipo);

-- Habilitar RLS nas tabelas
ALTER TABLE public.combustivel_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combustivel_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combustivel_equipamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para combustivel_lancamentos
CREATE POLICY "Usuários podem ver lançamentos do seu confinamento" 
ON public.combustivel_lancamentos 
FOR SELECT 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem inserir lançamentos no seu confinamento" 
ON public.combustivel_lancamentos 
FOR INSERT 
WITH CHECK (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem atualizar lançamentos do seu confinamento" 
ON public.combustivel_lancamentos 
FOR UPDATE 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem deletar lançamentos do seu confinamento" 
ON public.combustivel_lancamentos 
FOR DELETE 
USING (public.user_has_access_to_confinamento(confinamento_id));

-- Políticas RLS para combustivel_alertas
CREATE POLICY "Usuários podem ver alertas do seu confinamento" 
ON public.combustivel_alertas 
FOR SELECT 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem inserir alertas no seu confinamento" 
ON public.combustivel_alertas 
FOR INSERT 
WITH CHECK (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem atualizar alertas do seu confinamento" 
ON public.combustivel_alertas 
FOR UPDATE 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem deletar alertas do seu confinamento" 
ON public.combustivel_alertas 
FOR DELETE 
USING (public.user_has_access_to_confinamento(confinamento_id));

-- Políticas RLS para combustivel_equipamentos
CREATE POLICY "Usuários podem ver equipamentos do seu confinamento" 
ON public.combustivel_equipamentos 
FOR SELECT 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem inserir equipamentos no seu confinamento" 
ON public.combustivel_equipamentos 
FOR INSERT 
WITH CHECK (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem atualizar equipamentos do seu confinamento" 
ON public.combustivel_equipamentos 
FOR UPDATE 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem deletar equipamentos do seu confinamento" 
ON public.combustivel_equipamentos 
FOR DELETE 
USING (public.user_has_access_to_confinamento(confinamento_id));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_combustivel_ultimo_acesso
    BEFORE UPDATE ON public.usuarios_combustivel
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_combustivel_lancamentos_updated_at
    BEFORE UPDATE ON public.combustivel_lancamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_combustivel_alertas_updated_at
    BEFORE UPDATE ON public.combustivel_alertas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_combustivel_equipamentos_updated_at
    BEFORE UPDATE ON public.combustivel_equipamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular resumo de combustível por período
CREATE OR REPLACE FUNCTION public.get_combustivel_resumo(
  p_confinamento_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE (
  total_litros DECIMAL(10,2),
  total_valor DECIMAL(10,2),
  media_preco DECIMAL(10,2),
  total_lancamentos BIGINT,
  consumo_medio_diario DECIMAL(10,2),
  custo_medio_diario DECIMAL(10,2)
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(cl.quantidade_litros), 0) as total_litros,
    COALESCE(SUM(cl.valor_total), 0) as total_valor,
    CASE 
      WHEN SUM(cl.quantidade_litros) > 0 
      THEN SUM(cl.valor_total) / SUM(cl.quantidade_litros)
      ELSE 0 
    END as media_preco,
    COUNT(*) as total_lancamentos,
    CASE 
      WHEN (p_data_fim - p_data_inicio + 1) > 0 
      THEN SUM(cl.quantidade_litros) / (p_data_fim - p_data_inicio + 1)
      ELSE 0 
    END as consumo_medio_diario,
    CASE 
      WHEN (p_data_fim - p_data_inicio + 1) > 0 
      THEN SUM(cl.valor_total) / (p_data_fim - p_data_inicio + 1)
      ELSE 0 
    END as custo_medio_diario
  FROM public.combustivel_lancamentos cl
  WHERE cl.confinamento_id = p_confinamento_id
    AND cl.data BETWEEN p_data_inicio AND p_data_fim;
END;
$$; 