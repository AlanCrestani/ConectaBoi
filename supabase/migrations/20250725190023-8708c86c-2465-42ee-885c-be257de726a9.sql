-- Corrigir avisos de segurança - adicionar SET search_path às funções
CREATE OR REPLACE FUNCTION public.user_has_access_to_confinamento(confinamento_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_confinamentos 
    WHERE user_id = auth.uid() AND public.user_confinamentos.confinamento_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_user_confinamentos()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY 
  SELECT confinamento_id FROM public.user_confinamentos 
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_user_role(confinamento_id UUID)
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_roles 
    WHERE user_id = auth.uid() AND public.user_roles.confinamento_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';