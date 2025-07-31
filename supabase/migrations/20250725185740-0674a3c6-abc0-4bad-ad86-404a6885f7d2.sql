-- Criar tabela de confinamentos (clientes)
CREATE TABLE public.confinamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de associação usuário-confinamento
CREATE TABLE public.user_confinamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, confinamento_id)
);

-- Criar enum para papéis de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'operador', 'viewer');

-- Criar tabela de papéis de usuário por confinamento
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'operador',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, confinamento_id)
);

-- Criar tabela para feedback da IA
CREATE TABLE public.ai_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  recommendation_data JSONB,
  user_agreed BOOLEAN,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir o confinamento atual (Ganadera 7 Montes)
INSERT INTO public.confinamentos (id, nome, razao_social, ativo)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Ganadera 7 Montes',
  'Ganadera 7 Montes Ltda',
  true
);

-- Adicionar confinamento_id às tabelas existentes
ALTER TABLE public.dim_curral 
ADD COLUMN confinamento_id UUID REFERENCES public.confinamentos(id) ON DELETE CASCADE;

ALTER TABLE public.fato_carregamento 
ADD COLUMN confinamento_id UUID REFERENCES public.confinamentos(id) ON DELETE CASCADE;

ALTER TABLE public.fato_resumo 
ADD COLUMN confinamento_id UUID REFERENCES public.confinamentos(id) ON DELETE CASCADE;

ALTER TABLE public.fato_trato 
ADD COLUMN confinamento_id UUID REFERENCES public.confinamentos(id) ON DELETE CASCADE;

-- Renomear campo confinamento para setor nas tabelas
ALTER TABLE public.dim_curral 
RENAME COLUMN confinamento TO setor;

ALTER TABLE public.fato_resumo 
RENAME COLUMN confinamento TO setor;

-- Atualizar dados existentes com o confinamento_id
UPDATE public.dim_curral 
SET confinamento_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.fato_carregamento 
SET confinamento_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.fato_resumo 
SET confinamento_id = '00000000-0000-0000-0000-000000000001';

UPDATE public.fato_trato 
SET confinamento_id = '00000000-0000-0000-0000-000000000001';

-- Tornar confinamento_id obrigatório após migração
ALTER TABLE public.dim_curral 
ALTER COLUMN confinamento_id SET NOT NULL;

ALTER TABLE public.fato_carregamento 
ALTER COLUMN confinamento_id SET NOT NULL;

ALTER TABLE public.fato_resumo 
ALTER COLUMN confinamento_id SET NOT NULL;

ALTER TABLE public.fato_trato 
ALTER COLUMN confinamento_id SET NOT NULL;

-- Criar índices para performance
CREATE INDEX idx_dim_curral_confinamento ON public.dim_curral(confinamento_id);
CREATE INDEX idx_fato_carregamento_confinamento ON public.fato_carregamento(confinamento_id);
CREATE INDEX idx_fato_resumo_confinamento ON public.fato_resumo(confinamento_id);
CREATE INDEX idx_fato_trato_confinamento ON public.fato_trato(confinamento_id);

-- Criar funções de segurança para RLS
CREATE OR REPLACE FUNCTION public.user_has_access_to_confinamento(confinamento_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_confinamentos 
    WHERE user_id = auth.uid() AND public.user_confinamentos.confinamento_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_confinamentos()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY 
  SELECT confinamento_id FROM public.user_confinamentos 
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role(confinamento_id UUID)
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_roles 
    WHERE user_id = auth.uid() AND public.user_roles.confinamento_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.confinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_confinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas existentes
ALTER TABLE public.dim_curral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fato_carregamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fato_resumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fato_trato ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para confinamentos
CREATE POLICY "Usuários podem ver confinamentos que têm acesso" 
ON public.confinamentos FOR SELECT 
USING (id IN (SELECT public.get_user_confinamentos()));

-- Políticas RLS para user_confinamentos
CREATE POLICY "Usuários podem ver suas próprias associações" 
ON public.user_confinamentos FOR SELECT 
USING (user_id = auth.uid());

-- Políticas RLS para user_roles
CREATE POLICY "Usuários podem ver seus próprios papéis" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid());

-- Políticas RLS para ai_feedback
CREATE POLICY "Usuários podem inserir feedback" 
ON public.ai_feedback FOR INSERT 
WITH CHECK (user_id = auth.uid() AND public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Usuários podem ver seu próprio feedback" 
ON public.ai_feedback FOR SELECT 
USING (user_id = auth.uid() AND public.user_has_access_to_confinamento(confinamento_id));

-- Políticas RLS para tabelas de dados
CREATE POLICY "Acesso baseado no confinamento - dim_curral" 
ON public.dim_curral FOR ALL 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Acesso baseado no confinamento - fato_carregamento" 
ON public.fato_carregamento FOR ALL 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Acesso baseado no confinamento - fato_resumo" 
ON public.fato_resumo FOR ALL 
USING (public.user_has_access_to_confinamento(confinamento_id));

CREATE POLICY "Acesso baseado no confinamento - fato_trato" 
ON public.fato_trato FOR ALL 
USING (public.user_has_access_to_confinamento(confinamento_id));

-- Criar trigger para updated_at nas novas tabelas
CREATE TRIGGER update_confinamentos_updated_at
BEFORE UPDATE ON public.confinamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Associar usuário atual ao confinamento como admin (usando user_id da tabela profiles)
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Buscar o user_id do usuário atual na tabela profiles
    SELECT user_id INTO current_user_id FROM public.profiles LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Associar ao confinamento
        INSERT INTO public.user_confinamentos (user_id, confinamento_id)
        VALUES (current_user_id, '00000000-0000-0000-0000-000000000001')
        ON CONFLICT (user_id, confinamento_id) DO NOTHING;
        
        -- Definir como admin
        INSERT INTO public.user_roles (user_id, confinamento_id, role)
        VALUES (current_user_id, '00000000-0000-0000-0000-000000000001', 'admin')
        ON CONFLICT (user_id, confinamento_id) DO UPDATE SET role = 'admin';
    END IF;
END $$;