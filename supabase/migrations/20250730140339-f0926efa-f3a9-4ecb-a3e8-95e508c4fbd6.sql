-- Habilitar RLS nas tabelas que estão com problemas de segurança
ALTER TABLE public.fato_resumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fato_carregamento ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.fato_trato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_curral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confinamentos ENABLE ROW LEVEL SECURITY;

-- Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.calcular_eficiencia_pazeiro(data_inicio date, data_fim date)
RETURNS TABLE(pazeiro text, total_carregamentos bigint, tempo_medio_carregamento numeric, eficiencia_rank integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fc.pazeiro,
        COUNT(*) as total_carregamentos,
        AVG(
            EXTRACT(EPOCH FROM (
                MAX(fc.hora_carregamento) - MIN(fc.hora_carregamento)
            )) / 60
        )::numeric(8,2) as tempo_medio_carregamento,
        RANK() OVER (
            ORDER BY AVG(
                EXTRACT(EPOCH FROM (
                    MAX(fc.hora_carregamento) - MIN(fc.hora_carregamento)
                )) / 60
            )
        )::int as eficiencia_rank
    FROM public.fato_carregamento fc
    WHERE fc.data BETWEEN data_inicio AND data_fim
        AND fc.pazeiro IS NOT NULL
    GROUP BY fc.pazeiro
    HAVING COUNT(*) >= 3  -- Mínimo 3 carregamentos para considerar
    ORDER BY tempo_medio_carregamento ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.detectar_problemas_operacionais(data_analise date)
RETURNS TABLE(tipo_problema text, descricao text, id_carregamento text, hora_problema time without time zone, severidade text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Problema 1: Tempo de carregamento muito longo (>30 min)
    RETURN QUERY
    WITH problemas AS (
        -- Carregamento lento
        SELECT 
            'CARREGAMENTO_LENTO'::text as tipo_problema,
            'Carregamento demorou mais de 30 minutos'::text as descricao,
            fc.id_carregamento,
            MIN(fc.hora_carregamento)::time as hora_problema,
            'ALTO'::text as severidade
        FROM public.fato_carregamento fc
        WHERE fc.data = data_analise
            AND fc.id_carregamento IS NOT NULL
        GROUP BY fc.id_carregamento
        HAVING EXTRACT(EPOCH FROM (MAX(fc.hora_carregamento) - MIN(fc.hora_carregamento))) / 60 > 30

        UNION ALL

        -- Não aguardou mistura
        SELECT 
            'NAO_AGUARDOU_MISTURA'::text,
            'Possível não aguardou tempo de mistura (5 min)'::text,
            ft.id_carregamento,
            ft.hora_trato::time,
            'MEDIO'::text
        FROM public.fato_trato ft
        INNER JOIN (
            SELECT 
                id_carregamento,
                MAX(hora_carregamento) as ultimo_ingrediente
            FROM public.fato_carregamento
            WHERE data = data_analise
            GROUP BY id_carregamento
        ) fc ON ft.id_carregamento = fc.id_carregamento
        WHERE ft.data = data_analise
            AND EXTRACT(EPOCH FROM (ft.hora_trato::time - fc.ultimo_ingrediente)) / 60 < 5

        UNION ALL

        -- Distribuição lenta
        SELECT 
            'DISTRIBUICAO_LENTA'::text,
            'Distribuição demorou mais de 60 minutos'::text,
            ft.id_carregamento,
            MIN(ft.hora_trato)::time,
            'ALTO'::text
        FROM public.fato_trato ft
        WHERE ft.data = data_analise
            AND ft.id_carregamento IS NOT NULL
        GROUP BY ft.id_carregamento
        HAVING EXTRACT(EPOCH FROM (MAX(ft.hora_trato) - MIN(ft.hora_trato))) / 60 > 60
    )
    SELECT * FROM problemas;
END;
$$;