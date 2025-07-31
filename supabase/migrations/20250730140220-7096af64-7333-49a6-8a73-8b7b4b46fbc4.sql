-- Primeiro, vamos recriar a estrutura completa de roles

-- Atualizar enum de roles para incluir os novos níveis
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('master', 'gerencial', 'supervisor', 'operacional');

-- Recriar a coluna role na tabela user_roles
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS role;
ALTER TABLE public.user_roles ADD COLUMN role user_role NOT NULL DEFAULT 'operacional';

-- Criar tabela de assinaturas para controlar pagamentos
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, canceled, expired
  plano TEXT NOT NULL DEFAULT 'basic', -- basic, premium, enterprise
  valor_mensal DECIMAL(10,2),
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(confinamento_id) -- Um confinamento pode ter apenas uma assinatura ativa
);

-- Adicionar campo master_user_id na tabela confinamentos para identificar o dono
ALTER TABLE public.confinamentos 
ADD COLUMN IF NOT EXISTS master_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Adicionar campo data_assinatura para rastrear quando foi criado
ALTER TABLE public.confinamentos 
ADD COLUMN IF NOT EXISTS data_assinatura TIMESTAMPTZ DEFAULT now();

-- Habilitar RLS na tabela assinaturas
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para assinaturas
CREATE POLICY "Masters podem ver suas assinaturas" 
ON public.assinaturas 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Masters podem inserir suas assinaturas" 
ON public.assinaturas 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Masters podem atualizar suas assinaturas" 
ON public.assinaturas 
FOR UPDATE 
USING (user_id = auth.uid());

-- Função para verificar se usuário é master do confinamento
CREATE OR REPLACE FUNCTION public.is_master_of_confinamento(confinamento_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.confinamentos 
    WHERE id = confinamento_id AND master_user_id = auth.uid()
  );
END;
$$;

-- Tabela para convites de usuários
CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operacional',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(confinamento_id, email)
);

-- Habilitar RLS na tabela user_invites
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Políticas para convites
CREATE POLICY "Masters e gerenciais podem ver convites do seu confinamento" 
ON public.user_invites 
FOR SELECT 
USING (
  confinamento_id IN (
    SELECT uc.confinamento_id FROM public.user_confinamentos uc
    JOIN public.user_roles ur ON uc.user_id = ur.user_id AND uc.confinamento_id = ur.confinamento_id
    WHERE uc.user_id = auth.uid() AND ur.role IN ('master', 'gerencial')
  )
);

CREATE POLICY "Masters e gerenciais podem criar convites" 
ON public.user_invites 
FOR INSERT 
WITH CHECK (
  invited_by = auth.uid() AND
  confinamento_id IN (
    SELECT uc.confinamento_id FROM public.user_confinamentos uc
    JOIN public.user_roles ur ON uc.user_id = ur.user_id AND uc.confinamento_id = ur.confinamento_id
    WHERE uc.user_id = auth.uid() AND ur.role IN ('master', 'gerencial')
  )
);

-- Trigger para atualizar updated_at nas assinaturas
CREATE TRIGGER update_assinaturas_updated_at
BEFORE UPDATE ON public.assinaturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();