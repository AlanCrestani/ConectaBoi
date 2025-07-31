-- Corrigir função get_tipo_dieta com search_path seguro
CREATE OR REPLACE FUNCTION public.get_tipo_dieta(dieta_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO ''
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

-- Corrigir função populate_tipo_dieta com search_path seguro
CREATE OR REPLACE FUNCTION public.populate_tipo_dieta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.dieta IS NOT NULL THEN
    NEW.tipo_dieta = public.get_tipo_dieta(NEW.dieta);
  END IF;
  RETURN NEW;
END;
$$;