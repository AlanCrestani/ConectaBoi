-- Adicionar coluna tipo_dieta na tabela fato_trato
ALTER TABLE public.fato_trato 
ADD COLUMN tipo_dieta TEXT;

-- Função para mapear dieta para tipo_dieta
CREATE OR REPLACE FUNCTION public.get_tipo_dieta(dieta_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE LEFT(UPPER(dieta_input), 3)
    WHEN 'ADA' THEN RETURN 'ADAPTACAO';
    WHEN 'CRE' THEN RETURN 'CRESCIMENTO';
    WHEN 'TER' THEN RETURN 'TERMINACAO';
    ELSE RETURN 'OUTROS';
  END CASE;
END;
$$;

-- Atualizar dados existentes
UPDATE public.fato_trato 
SET tipo_dieta = get_tipo_dieta(dieta)
WHERE dieta IS NOT NULL;

-- Criar trigger para popular automaticamente novos registros
CREATE OR REPLACE FUNCTION public.populate_tipo_dieta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.dieta IS NOT NULL THEN
    NEW.tipo_dieta = get_tipo_dieta(NEW.dieta);
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER trigger_populate_tipo_dieta
  BEFORE INSERT OR UPDATE ON public.fato_trato
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_tipo_dieta();