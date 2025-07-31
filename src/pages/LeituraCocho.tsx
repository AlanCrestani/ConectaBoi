import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Save, Settings, ArrowLeft, ArrowRight, Eye, EyeOff, Tag, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Cell, Line, LineChart, LabelList } from 'recharts';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Tipos
interface DadosGrafico {
  nome: string;
  previsto: number;
  realizado: number;
  tipo: 'total' | 'dieta' | 'curral' | 'historico' | 'trato' | 'ingrediente';
  corRealizado?: string;
  id_curral?: string;
  data?: string;
  trato?: string;
  id_carregamento?: string;
  mediaMovel?: number;
}
interface DrillDownState {
  nivel: 1 | 2 | 3 | 4 | 5 | 6;
  dietaSelecionada?: string;
  curralSelecionado?: string;
  dataSelecionadaHistorico?: string;
  tratoSelecionado?: string;
}

// Gerar dados históricos para o gráfico CMS (7 dias + hoje)
const generateHistoricoData = () => {
  const hoje = new Date();
  const historico = [];
  for (let i = 7; i >= 1; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    historico.push({
      data: data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      }),
      previsto: 8.2 + (Math.random() - 0.5) * 0.8,
      realizado: 8.1 + (Math.random() - 0.5) * 0.9,
      leituraCocho: Math.floor(Math.random() * 7) - 2,
      leituraNoturna: ['verde', 'amarelo', 'vermelho'][Math.floor(Math.random() * 3)]
    });
  }

  // Dia atual (só leitura de cocho)
  historico.push({
    data: hoje.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }),
    previsto: historico[6]?.realizado || 8.2,
    realizado: null,
    leituraCocho: 0,
    leituraNoturna: 'verde'
  });
  return historico;
};
const LeituraCocho = () => {
  // Estados principais
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    nivel: 1
  });
  const [curralAtual, setCurralAtual] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(0); // Nova paginação para nível 3
  const [leituraCocho, setLeituraCocho] = useState(0);
  const [ajusteManual, setAjusteManual] = useState('');
  const [historicoCMS, setHistoricoCMS] = useState(generateHistoricoData());
  const [configuracoes, setConfiguracoes] = useState({
    curvaMeta: false,
    curvaMedia: false,
    tooltip: true,
    rotulos: true
  });
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  // Estados dos dados
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);
  const [dadosGraficoCompletos, setDadosGraficoCompletos] = useState<DadosGrafico[]>([]); // Dados completos para paginação
  const [isLoading, setIsLoading] = useState(false);
  const [curraisDisponiveis, setCurraisDisponiveis] = useState<{
    id: string;
    nome: string;
  }[]>([]);
  const [dadosCurralSelecionado, setDadosCurralSelecionado] = useState<{
    cabecas: number;
    diasCocho: number;
    consumoMedio4Dias: number;
  } | null>(null);

  // Função para determinar cor baseada na diferença percentual
  const calcularCor = (previsto: number, realizado: number): string => {
    if (previsto === 0) return '#22c55e';
    const diferenca = Math.abs((realizado - previsto) / previsto * 100);
    if (diferenca <= 3) return '#22c55e'; // Verde
    if (diferenca <= 6) return '#eab308'; // Amarelo
    if (diferenca <= 10) return '#ef4444'; // Vermelho
    return '#000000'; // Preto
  };

  // Função para buscar dados do nível 1 (total geral)
  const fetchDadosNivel1 = async () => {
    setIsLoading(true);
    try {
      // Buscar a data mais recente disponível
      const {
        data: dataRecente
      } = await supabase.from('fato_trato').select('data').order('data', {
        ascending: false
      }).limit(1).maybeSingle();
      if (!dataRecente) {
        console.log('Nenhum dado encontrado');
        setDadosGrafico([]);
        return;
      }

      // Usar a data mais recente encontrada
      const dataParaBusca = dataRecente.data;
      const {
        data: fatoTrato,
        error
      } = await supabase.from('fato_trato').select('previsto_kg, realizado_kg').eq('data', dataParaBusca);
      if (error) {
        console.error('Erro ao buscar dados nível 1:', error);
        return;
      }
      if (fatoTrato && fatoTrato.length > 0) {
        const totais = fatoTrato.reduce((acc, item) => ({
          previsto: acc.previsto + (item.previsto_kg || 0),
          realizado: acc.realizado + (item.realizado_kg || 0)
        }), {
          previsto: 0,
          realizado: 0
        });
        setDadosGrafico([{
          nome: 'Total',
          previsto: totais.previsto,
          realizado: totais.realizado,
          tipo: 'total',
          corRealizado: calcularCor(totais.previsto, totais.realizado)
        }]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados nível 1:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados do nível 2 (por tipo de dieta)
  const fetchDadosNivel2 = async () => {
    setIsLoading(true);
    try {
      const {
        data: fatoTrato,
        error
      } = await supabase.from('fato_trato').select('previsto_kg, realizado_kg, tipo_dieta').eq('data', dataSelecionada).not('tipo_dieta', 'is', null);
      if (error) {
        console.error('Erro ao buscar dados nível 2:', error);
        return;
      }
      if (fatoTrato && fatoTrato.length > 0) {
        const agrupado = fatoTrato.reduce((acc, item) => {
          const tipo = item.tipo_dieta || 'OUTROS';
          if (!acc[tipo]) {
            acc[tipo] = {
              previsto: 0,
              realizado: 0
            };
          }
          acc[tipo].previsto += item.previsto_kg || 0;
          acc[tipo].realizado += item.realizado_kg || 0;
          return acc;
        }, {} as Record<string, {
          previsto: number;
          realizado: number;
        }>);
        const ordemTipos = ['ADAPTACAO', 'CRESCIMENTO', 'TERMINACAO'];
        const dadosFormatados = ordemTipos.filter(tipo => agrupado[tipo]).map(tipo => {
          const dados = agrupado[tipo];
          return {
            nome: tipo,
            previsto: dados.previsto,
            realizado: dados.realizado,
            tipo: 'dieta' as const,
            corRealizado: calcularCor(dados.previsto, dados.realizado)
          };
        });
        setDadosGrafico(dadosFormatados);
      }
    } catch (error) {
      console.error('Erro ao buscar dados nível 2:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados do nível 3 (por curral da dieta selecionada)
  const fetchDadosNivel3 = async (dietaSelecionada: string) => {
    setIsLoading(true);
    try {
      const {
        data: fatoTrato,
        error: errorTrato
      } = await supabase.from('fato_trato').select('previsto_kg, realizado_kg, id_curral').eq('data', dataSelecionada).eq('tipo_dieta', dietaSelecionada).not('id_curral', 'is', null);
      if (errorTrato) {
        console.error('Erro ao buscar dados nível 3:', errorTrato);
        return;
      }
      if (fatoTrato && fatoTrato.length > 0) {
        const agrupadoPorCurral = fatoTrato.reduce((acc, item) => {
          const idCurral = item.id_curral;
          if (!acc[idCurral]) {
            acc[idCurral] = {
              previsto: 0,
              realizado: 0
            };
          }
          acc[idCurral].previsto += item.previsto_kg || 0;
          acc[idCurral].realizado += item.realizado_kg || 0;
          return acc;
        }, {} as Record<string, {
          previsto: number;
          realizado: number;
        }>);

        // Buscar nomes dos currais
        const {
          data: fatoResumo,
          error: errorResumo
        } = await supabase.from('fato_resumo').select('id_curral, curral').eq('data', dataSelecionada).in('id_curral', Object.keys(agrupadoPorCurral));
        if (errorResumo) {
          console.error('Erro ao buscar nomes dos currais:', errorResumo);
          return;
        }
        const mapCurrais = fatoResumo?.reduce((acc, item) => {
          acc[item.id_curral] = item.curral;
          return acc;
        }, {} as Record<string, string>) || {};
        const dadosFormatados = Object.entries(agrupadoPorCurral).map(([idCurral, dados]) => ({
          nome: mapCurrais[idCurral] || idCurral,
          previsto: dados.previsto,
          realizado: dados.realizado,
          tipo: 'curral' as const,
          corRealizado: calcularCor(dados.previsto, dados.realizado),
          id_curral: idCurral
        })).sort((a, b) => a.nome.localeCompare(b.nome));

        // Guardar dados completos para paginação
        setDadosGraficoCompletos(dadosFormatados);

        // Aplicar paginação (8 currais por página)
        const itensPorPagina = 8;
        const inicio = paginaAtual * itensPorPagina;
        const dadosPaginados = dadosFormatados.slice(inicio, inicio + itensPorPagina);
        setDadosGrafico(dadosPaginados);

        // Atualizar lista de currais disponíveis
        const currais = dadosFormatados.map((item, index) => ({
          id: item.id_curral || index.toString(),
          nome: item.nome
        }));
        setCurraisDisponiveis(currais);
      }
    } catch (error) {
      console.error('Erro ao buscar dados nível 3:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados do nível 4 (histórico CMS do curral)
  const fetchDadosNivel4 = async (curralSelecionado: string) => {
    setIsLoading(true);
    try {
      // Criar array com as 8 datas (7 dias anteriores + data atual)
      const datas = [];
      for (let i = 7; i >= 0; i--) {
        const data = new Date(dataSelecionada);
        data.setDate(data.getDate() - i);
        datas.push(data.toISOString().split('T')[0]);
      }
      const {
        data: fatoResumo,
        error
      } = await supabase.from('fato_resumo').select('data, cms_previsto_kg, cms_realizado_kg').eq('id_curral', curralSelecionado).in('data', datas).order('data', {
        ascending: true
      });
      if (error) {
        console.error('Erro ao buscar dados nível 4:', error);
        return;
      }

      // Criar mapa dos dados recebidos
      const dadosMap = fatoResumo?.reduce((acc, item) => {
        acc[item.data] = {
          previsto: item.cms_previsto_kg || 0,
          realizado: item.cms_realizado_kg || 0
        };
        return acc;
      }, {} as Record<string, {
        previsto: number;
        realizado: number;
      }>) || {};

      // Criar dados formatados com todas as 8 datas
      const dadosFormatados = datas.map((data, index) => {
        const dataObj = new Date(data);
        const dadosData = dadosMap[data] || {
          previsto: 0,
          realizado: 0
        };

        // Calcular média móvel dos últimos 4 dias (desde o primeiro dia)
        let mediaMovel: number | undefined;
        const diasDisponiveis = Math.min(index + 1, 4);
        const inicioCalculo = Math.max(0, index - 3);
        const diasParaCalculo = datas.slice(inicioCalculo, index + 1);
        const valores = diasParaCalculo.map(d => dadosMap[d]?.realizado || 0);
        const soma = valores.reduce((acc, val) => acc + val, 0);
        mediaMovel = soma / diasDisponiveis;
        return {
          nome: dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          }),
          previsto: dadosData.previsto,
          realizado: dadosData.realizado,
          tipo: 'historico' as const,
          corRealizado: calcularCor(dadosData.previsto, dadosData.realizado),
          data: data,
          mediaMovel: mediaMovel
        };
      });
      setDadosGrafico(dadosFormatados);
    } catch (error) {
      console.error('Erro ao buscar dados nível 4:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados do nível 5 (tratos de uma data específica)
  const fetchDadosNivel5 = async (curralSelecionado: string, dataHistorico: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando tratos para:', {
        curralSelecionado,
        dataHistorico
      });
      const {
        data: fatoTrato,
        error
      } = await supabase.from('fato_trato').select('previsto_kg, realizado_kg, trato, id_carregamento').eq('id_curral', curralSelecionado).eq('data', dataHistorico).order('trato', {
        ascending: true
      });
      console.log('Dados encontrados:', fatoTrato);
      if (error) {
        console.error('Erro ao buscar dados nível 5:', error);
        return;
      }
      if (fatoTrato && fatoTrato.length > 0) {
        const dadosFormatados = fatoTrato.map(item => ({
          nome: `Trato ${item.trato || 'N/A'}`,
          previsto: item.previsto_kg || 0,
          realizado: item.realizado_kg || 0,
          tipo: 'trato' as const,
          corRealizado: calcularCor(item.previsto_kg || 0, item.realizado_kg || 0),
          trato: item.trato,
          id_carregamento: item.id_carregamento
        }));
        console.log('Dados formatados:', dadosFormatados);
        setDadosGrafico(dadosFormatados);
      } else {
        console.log('Nenhum trato encontrado para esta data/curral');
        setDadosGrafico([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados nível 5:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados do nível 6 (ingredientes de um trato específico)
  const fetchDadosNivel6 = async (curralSelecionado: string, dataHistorico: string, tratoSelecionado: string, idCarregamento: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando ingredientes para:', {
        curralSelecionado,
        dataHistorico,
        tratoSelecionado,
        idCarregamento
      });
      const {
        data: fatoCarregamento,
        error
      } = await supabase.from('fato_carregamento').select('previsto_kg, realizado_kg, ingrediente').eq('id_carregamento', idCarregamento).order('ingrediente', {
        ascending: true
      });
      console.log('Ingredientes encontrados:', fatoCarregamento);
      if (error) {
        console.error('Erro ao buscar dados nível 6:', error);
        return;
      }
      if (fatoCarregamento && fatoCarregamento.length > 0) {
        // Agrupar por ingrediente
        const agrupadoPorIngrediente = fatoCarregamento.reduce((acc, item) => {
          const ingrediente = item.ingrediente || 'Ingrediente N/A';
          if (!acc[ingrediente]) {
            acc[ingrediente] = {
              previsto: 0,
              realizado: 0
            };
          }
          acc[ingrediente].previsto += item.previsto_kg || 0;
          acc[ingrediente].realizado += item.realizado_kg || 0;
          return acc;
        }, {} as Record<string, {
          previsto: number;
          realizado: number;
        }>);
        const dadosFormatados = Object.entries(agrupadoPorIngrediente).map(([ingrediente, dados]) => ({
          nome: ingrediente,
          previsto: dados.previsto,
          realizado: dados.realizado,
          tipo: 'ingrediente' as const,
          corRealizado: calcularCor(dados.previsto, dados.realizado)
        }));
        console.log('Ingredientes formatados:', dadosFormatados);
        setDadosGrafico(dadosFormatados);
      } else {
        console.log('Nenhum ingrediente encontrado para este trato');
        setDadosGrafico([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados nível 6:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados específicos do curral selecionado
  const fetchDadosCurralSelecionado = async (curralSelecionado: string) => {
    try {
      const { data: fatoResumo, error } = await supabase
        .from('fato_resumo')
        .select('qtd_animais, dias_confinamento, cms_realizado_kg')
        .eq('id_curral', curralSelecionado)
        .eq('data', dataSelecionada)
        .single();
      
      if (error) {
        console.error('Erro ao buscar dados do curral:', error);
        return;
      }

      if (fatoResumo) {
        // Buscar dados dos últimos 4 dias para calcular a média do CMS
        const datas4Dias = [];
        for (let i = 3; i >= 0; i--) {
          const data = new Date(dataSelecionada);
          data.setDate(data.getDate() - i);
          datas4Dias.push(data.toISOString().split('T')[0]);
        }

        const { data: historico4Dias } = await supabase
          .from('fato_resumo')
          .select('cms_realizado_kg')
          .eq('id_curral', curralSelecionado)
          .in('data', datas4Dias);

        const mediaConsumo4Dias = historico4Dias && historico4Dias.length > 0
          ? historico4Dias.reduce((acc, item) => acc + (item.cms_realizado_kg || 0), 0) / historico4Dias.length
          : 0;

        setDadosCurralSelecionado({
          cabecas: fatoResumo.qtd_animais || 0,
          diasCocho: fatoResumo.dias_confinamento || 0,
          consumoMedio4Dias: Number(mediaConsumo4Dias.toFixed(1))
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do curral selecionado:', error);
    }
  };

  // Effect para carregar dados baseado no nível atual
  useEffect(() => {
    switch (drillDown.nivel) {
      case 1:
        fetchDadosNivel1();
        break;
      case 2:
        fetchDadosNivel2();
        break;
      case 3:
        if (drillDown.dietaSelecionada) {
          fetchDadosNivel3(drillDown.dietaSelecionada);
        }
        break;
      case 4:
        if (drillDown.curralSelecionado) {
          fetchDadosNivel4(drillDown.curralSelecionado);
          fetchDadosCurralSelecionado(drillDown.curralSelecionado);
        }
        break;
      case 5:
        if (drillDown.curralSelecionado && drillDown.dataSelecionadaHistorico) {
          fetchDadosNivel5(drillDown.curralSelecionado, drillDown.dataSelecionadaHistorico);
        }
        break;
      case 6:
        if (drillDown.curralSelecionado && drillDown.dataSelecionadaHistorico && drillDown.tratoSelecionado) {
          // Buscar o id_carregamento do trato selecionado através da consulta
          const fetchIdCarregamento = async () => {
            const {
              data: tratoData
            } = await supabase.from('fato_trato').select('id_carregamento').eq('id_curral', drillDown.curralSelecionado).eq('data', drillDown.dataSelecionadaHistorico).eq('trato', drillDown.tratoSelecionado).single();
            if (tratoData?.id_carregamento) {
              fetchDadosNivel6(drillDown.curralSelecionado, drillDown.dataSelecionadaHistorico, drillDown.tratoSelecionado, tratoData.id_carregamento);
            }
          };
          fetchIdCarregamento();
        }
        break;
    }
  }, [drillDown.nivel, drillDown.dietaSelecionada, drillDown.curralSelecionado, drillDown.dataSelecionadaHistorico, drillDown.tratoSelecionado, paginaAtual, dataSelecionada]);

  // Função para gerar breadcrumb
  const getBreadcrumb = () => {
    const dataFormatada = new Date(dataSelecionada).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const breadcrumbs = [dataFormatada, 'Geral'];
    if (drillDown.nivel >= 2 && drillDown.dietaSelecionada) {
      breadcrumbs.push(`Dieta ${drillDown.dietaSelecionada.toLowerCase().replace(/^\w/, c => c.toUpperCase())}`);
    }
    if (drillDown.nivel >= 3) {
      const nomeCurral = dadosGraficoCompletos.find(c => c.id_curral === drillDown.curralSelecionado)?.nome || 'Currais';
      breadcrumbs.push(drillDown.nivel === 3 ? 'Currais' : nomeCurral);
    }
    if (drillDown.nivel >= 4) {
      breadcrumbs.push('Histórico de consumo');
    }
    if (drillDown.nivel >= 5) {
      breadcrumbs.push('Desvio de trato');
    }
    if (drillDown.nivel >= 6) {
      breadcrumbs.push('Desvio de carregamento');
    }
    return breadcrumbs;
  };

  // Função para lidar com clique nas barras (drill down)
  const handleBarClick = (data: any, barraClicada: 'previsto' | 'realizado') => {
    if (barraClicada === 'realizado') {
      // Barra realizada avança nível
      if (drillDown.nivel === 1) {
        setDrillDown({
          nivel: 2
        });
      } else if (drillDown.nivel === 2 && data.tipo === 'dieta') {
        setDrillDown({
          nivel: 3,
          dietaSelecionada: data.nome
        });
        setPaginaAtual(0);
      } else if (drillDown.nivel === 3 && data.tipo === 'curral') {
        setDrillDown({
          nivel: 4,
          dietaSelecionada: drillDown.dietaSelecionada,
          curralSelecionado: data.id_curral
        });
      } else if (drillDown.nivel === 4 && data.tipo === 'historico') {
        setDrillDown({
          nivel: 5,
          dietaSelecionada: drillDown.dietaSelecionada,
          curralSelecionado: drillDown.curralSelecionado,
          dataSelecionadaHistorico: data.data
        });
      } else if (drillDown.nivel === 5 && data.tipo === 'trato') {
        setDrillDown({
          nivel: 6,
          dietaSelecionada: drillDown.dietaSelecionada,
          curralSelecionado: drillDown.curralSelecionado,
          dataSelecionadaHistorico: drillDown.dataSelecionadaHistorico,
          tratoSelecionado: data.trato
        });
      }
    } else if (barraClicada === 'previsto') {
      // Barra prevista volta nível
      if (drillDown.nivel === 2) {
        setDrillDown({
          nivel: 1
        });
      } else if (drillDown.nivel === 3) {
        setDrillDown({
          nivel: 2
        });
        setPaginaAtual(0);
      } else if (drillDown.nivel === 4) {
        setDrillDown({
          nivel: 3,
          dietaSelecionada: drillDown.dietaSelecionada
        });
      } else if (drillDown.nivel === 5) {
        setDrillDown({
          nivel: 4,
          dietaSelecionada: drillDown.dietaSelecionada,
          curralSelecionado: drillDown.curralSelecionado
        });
      } else if (drillDown.nivel === 6) {
        setDrillDown({
          nivel: 5,
          dietaSelecionada: drillDown.dietaSelecionada,
          curralSelecionado: drillDown.curralSelecionado,
          dataSelecionadaHistorico: drillDown.dataSelecionadaHistorico
        });
      }
    }
  };

  // Função para navegação no breadcrumb
  const handleBreadcrumbClick = (nivel: number) => {
    if (nivel === 1) {
      setDrillDown({
        nivel: 1
      });
    } else if (nivel === 2 && drillDown.dietaSelecionada) {
      setDrillDown({
        nivel: 2
      });
    } else if (nivel === 3 && drillDown.dietaSelecionada) {
      setDrillDown({
        nivel: 3,
        dietaSelecionada: drillDown.dietaSelecionada
      });
    } else if (nivel === 4 && drillDown.dietaSelecionada && drillDown.curralSelecionado) {
      setDrillDown({
        nivel: 4,
        dietaSelecionada: drillDown.dietaSelecionada,
        curralSelecionado: drillDown.curralSelecionado
      });
    }
    setPaginaAtual(0);
  };

  // Função para obter cor da barra
  const getBarColor = (entry: any, dataKey: string) => {
    if (dataKey === 'realizado' && entry.corRealizado) {
      return entry.corRealizado;
    }
    return dataKey === 'previsto' ? '#3b82f6' : '#22c55e';
  };

  // Função para leitura de cocho
  const handleNotaClick = (nota: number) => {
    setLeituraCocho(nota);
    const novoHistorico = [...historicoCMS];
    const ajusteValues: Record<string, number> = {
      '-2': 0.6,
      '-1': 0.4,
      '0': 0.2,
      '1': 0,
      '2': -0.2,
      '3': -0.4,
      '4': -0.6
    };
    novoHistorico[7].previsto = (novoHistorico[6]?.realizado || 8.2) + (ajusteValues[nota.toString()] || 0);
    setHistoricoCMS(novoHistorico);
  };
  const handleAjusteManual = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const valor = parseFloat(ajusteManual);
      if (!isNaN(valor)) {
        const novoHistorico = [...historicoCMS];
        novoHistorico[7].previsto = valor;
        setHistoricoCMS(novoHistorico);
        toast.success('Ajuste manual aplicado!');
      }
    }
  };
  const handleSalvarLeitura = () => {
    toast.success('Leitura salva com sucesso!');
    if (curraisDisponiveis.length > 0 && curralAtual < curraisDisponiveis.length - 1) {
      setCurralAtual(curralAtual + 1);
      setLeituraCocho(0);
      setAjusteManual('');
    } else {
      toast.info('Todas as leituras foram concluídas!');
    }
  };
  const handleFeedbackIA = (mensagemId: string, feedback: 'positivo' | 'negativo') => {
    console.log('Feedback IA registrado:', {
      mensagemId,
      feedback
    });
  };

  // Informações do lote
  const loteInfo = {
    numero: 'L001',
    cabecas: 145,
    diasCocho: 67,
    consumoMedio4Dias: 8.4,
    pesoEntrada: 420,
    pesoAtual: 485,
    raca: 'Nelore',
    sexo: 'Macho'
  };

  // Componente customizado para rótulos da média móvel com caixa
  const CustomLabel = (props: any) => {
    const { x, y, value } = props;
    if (!value) return null;
    
    const text = value.toFixed(1);
    const padding = 6;
    const textWidth = text.length * 7 + padding * 2; // Aproximação da largura do texto
    const textHeight = 18 + padding * 2;
    
    return (
      <g>
        <rect
          x={x - textWidth / 2}
          y={y - textHeight - 8}
          width={textWidth}
          height={textHeight}
          rx={4}
          ry={4}
          fill="rgba(107, 114, 128, 0.3)"
          stroke="rgba(107, 114, 128, 0.7)"
          strokeWidth={0.5}
        />
        <text
          x={x}
          y={y - textHeight / 2 - 8}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: '12px',
            fill: '#ef4444',
            fontWeight: 'bold',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {text}
        </text>
      </g>
    );
  };
  const notasLeitura = [{
    nota: -2,
    ajuste: '+0.6'
  }, {
    nota: -1,
    ajuste: '+0.4'
  }, {
    nota: 0,
    ajuste: '+0.2'
  }, {
    nota: 1,
    ajuste: '0.0'
  }, {
    nota: 2,
    ajuste: '-0.2'
  }, {
    nota: 3,
    ajuste: '-0.4'
  }, {
    nota: 4,
    ajuste: '-0.6'
  }];
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length && configuracoes.tooltip) {
      return <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => <p key={index} style={{
          color: entry.color
        }}>
              {`${entry.dataKey}: ${entry.value?.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })} kg`}
            </p>)}
        </div>;
    }
    return null;
  };
  const getTituloGrafico = () => {
    switch (drillDown.nivel) {
      case 1:
        return 'Visão Geral - Previsto x Realizado';
      case 2:
        return 'Por Tipo de Dieta - Previsto x Realizado';
      case 3:
        return `Currais da Dieta ${drillDown.dietaSelecionada} - Previsto x Realizado`;
      case 4:
        const nomeCurral = dadosGraficoCompletos.find(c => c.id_curral === drillDown.curralSelecionado)?.nome || 'Curral';
        return `Histórico CMS - ${nomeCurral} (8 dias)`;
      case 5:
        const nomeCurral5 = dadosGraficoCompletos.find(c => c.id_curral === drillDown.curralSelecionado)?.nome || 'Curral';
        const dataFormatada = drillDown.dataSelecionadaHistorico ? new Date(drillDown.dataSelecionadaHistorico).toLocaleDateString('pt-BR') : 'Data';
        return `Tratos - ${nomeCurral5} - ${dataFormatada}`;
      case 6:
        const nomeCurral6 = dadosGraficoCompletos.find(c => c.id_curral === drillDown.curralSelecionado)?.nome || 'Curral';
        return `Ingredientes - Trato ${drillDown.tratoSelecionado} - ${nomeCurral6}`;
      default:
        return 'Análise de Dados';
    }
  };

  // Funções auxiliares para paginação no nível 3
  const itensPorPagina = 8;
  const totalPaginas = Math.ceil(dadosGraficoCompletos.length / itensPorPagina);
  const paginaAnterior = () => setPaginaAtual(Math.max(0, paginaAtual - 1));
  const proximaPagina = () => setPaginaAtual(Math.min(totalPaginas - 1, paginaAtual + 1));
  return <div className="container mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Leitura de Cocho</h1>
          <p className="text-sm text-muted-foreground">Sistema inteligente para lançamento de leituras</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filtro de Data */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={dataSelecionada} onValueChange={setDataSelecionada}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({
                length: 8
              }, (_, i) => {
                const data = new Date();
                data.setDate(data.getDate() - i);
                const dataStr = data.toISOString().split('T')[0];
                const dataFormatada = data.toLocaleDateString('pt-BR');
                return <SelectItem key={dataStr} value={dataStr}>
                      {i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : dataFormatada}
                    </SelectItem>;
              })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Configurações */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Label htmlFor="curva-meta" className="text-xs">Meta</Label>
              <Switch id="curva-meta" checked={configuracoes.curvaMeta} onCheckedChange={checked => setConfiguracoes({
              ...configuracoes,
              curvaMeta: checked
            })} />
            </div>
            <div className="flex items-center space-x-1">
              <Label htmlFor="curva-media" className="text-xs">Média</Label>
              <Switch id="curva-media" checked={configuracoes.curvaMedia} onCheckedChange={checked => setConfiguracoes({
              ...configuracoes,
              curvaMedia: checked
            })} />
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <Switch checked={configuracoes.tooltip} onCheckedChange={checked => setConfiguracoes({
              ...configuracoes,
              tooltip: checked
            })} />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          {getBreadcrumb().map((item, index) => <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === getBreadcrumb().length - 1 ? <BreadcrumbPage>{item}</BreadcrumbPage> : <BreadcrumbLink onClick={() => handleBreadcrumbClick(index + 1)} className="cursor-pointer">
                    {item}
                  </BreadcrumbLink>}
              </BreadcrumbItem>
            </React.Fragment>)}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Cards de Informações do Lote - apenas no nível 4 */}
      {drillDown.nivel === 4 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{dadosGraficoCompletos.find(c => c.id_curral === drillDown.curralSelecionado)?.nome || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Curral</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{dadosCurralSelecionado?.cabecas ?? loteInfo.cabecas}</div>
                <div className="text-xs text-muted-foreground">Cabeças</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{dadosCurralSelecionado?.diasCocho ?? loteInfo.diasCocho}</div>
                <div className="text-xs text-muted-foreground">Dias Cocho</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{dadosCurralSelecionado?.consumoMedio4Dias ?? loteInfo.consumoMedio4Dias}</div>
                <div className="text-xs text-muted-foreground">CMS Médio 4d</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Layout Principal */}
      <div className="flex-1 grid grid-cols-12 gap-4">
        {/* Gráfico Principal */}
        <div className="col-span-8">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getTituloGrafico()}</CardTitle>
                <div className="flex items-center space-x-3">
                  {/* Controles de paginação para nível 3 */}
                  {drillDown.nivel === 3 && totalPaginas > 1 && <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={paginaAnterior} disabled={paginaAtual === 0}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium px-2">
                        {paginaAtual + 1} de {totalPaginas}
                      </span>
                      <Button variant="outline" size="sm" onClick={proximaPagina} disabled={paginaAtual === totalPaginas - 1}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <span className="text-xs text-muted-foreground">
                        {dadosGraficoCompletos.length} currais total
                      </span>
                    </div>}
                  
                  {/* Navegação entre currais para nível 4 */}
                  {drillDown.nivel === 4 && dadosGraficoCompletos.length > 0 && <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                    const curralIndex = dadosGraficoCompletos.findIndex(c => c.id_curral === drillDown.curralSelecionado);
                    if (curralIndex > 0) {
                      setDrillDown({
                        ...drillDown,
                        curralSelecionado: dadosGraficoCompletos[curralIndex - 1].id_curral
                      });
                    }
                  }} disabled={dadosGraficoCompletos.findIndex(c => c.id_curral === drillDown.curralSelecionado) === 0}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium px-2">
                        {dadosGraficoCompletos.find(c => c.id_curral === drillDown.curralSelecionado)?.nome || 'Curral'}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({dadosGraficoCompletos.findIndex(c => c.id_curral === drillDown.curralSelecionado) + 1} de {dadosGraficoCompletos.length})
                        </span>
                      </span>
                      <Button variant="outline" size="sm" onClick={() => {
                    const curralIndex = dadosGraficoCompletos.findIndex(c => c.id_curral === drillDown.curralSelecionado);
                    if (curralIndex < dadosGraficoCompletos.length - 1) {
                      setDrillDown({
                        ...drillDown,
                        curralSelecionado: dadosGraficoCompletos[curralIndex + 1].id_curral
                      });
                    }
                  }} disabled={dadosGraficoCompletos.findIndex(c => c.id_curral === drillDown.curralSelecionado) === dadosGraficoCompletos.length - 1}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>}
                  
                  {/* Controles de navegação entre currais para o nível 3 */}
                  {drillDown.nivel === 3 && curraisDisponiveis.length > 0}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex items-center justify-center h-64">
                  <div className="text-lg">Carregando dados...</div>
                </div> : <ResponsiveContainer width="100%" height={300}>
                   {drillDown.nivel === 4 && configuracoes.curvaMedia ? <ComposedChart data={dadosGrafico} margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="nome" tick={{
                  fontSize: 12
                }} angle={-45} textAnchor="end" height={60} />
                       <YAxis tick={{
                  fontSize: 12
                }} />
                       <Tooltip content={<CustomTooltip />} />
                       <Bar dataKey="previsto" fill="#3b82f6" onClick={(data, index) => handleBarClick(dadosGrafico[index], 'previsto')} style={{
                  cursor: 'pointer'
                }} />
                       <Bar dataKey="realizado" onClick={(data, index) => handleBarClick(dadosGrafico[index], 'realizado')} style={{
                  cursor: 'pointer'
                }}>
                         {dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={getBarColor(entry, 'realizado')} />)}
                       </Bar>
                       <Line type="monotone" dataKey="mediaMovel" stroke="#ef4444" strokeWidth={2} dot={{
                  fill: '#ef4444',
                  strokeWidth: 2,
                  r: 4
                }} connectNulls={false}>
                         {configuracoes.rotulos && (
                           <LabelList 
                             dataKey="mediaMovel" 
                             content={<CustomLabel />}
                           />
                         )}
                       </Line>
                     </ComposedChart> : <BarChart data={dadosGrafico} margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="nome" tick={{
                  fontSize: 12
                }} angle={-45} textAnchor="end" height={60} />
                       <YAxis tick={{
                  fontSize: 12
                }} />
                       <Tooltip content={<CustomTooltip />} />
                       <Bar dataKey="previsto" fill="#3b82f6" onClick={(data, index) => handleBarClick(dadosGrafico[index], 'previsto')} style={{
                  cursor: 'pointer'
                }} />
                       <Bar dataKey="realizado" onClick={(data, index) => handleBarClick(dadosGrafico[index], 'realizado')} style={{
                  cursor: 'pointer'
                }}>
                         {dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={getBarColor(entry, 'realizado')} />)}
                       </Bar>
                     </BarChart>}
                 </ResponsiveContainer>}
              
              {/* Estatísticas */}
              {dadosGrafico.length > 0 && <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">MS Prevista Total</p>
                      <p className="font-semibold">
                        {dadosGrafico.reduce((acc, item) => acc + item.previsto, 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MS Realizada Total</p>
                      <p className="font-semibold">
                        {dadosGrafico.reduce((acc, item) => acc + item.realizado, 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })} kg
                      </p>
                    </div>
                  </div>
                </div>}
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="col-span-4 space-y-4">
          {/* Leitura de Cocho - apenas no nível 3 */}
          {drillDown.nivel === 4 && <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Leitura de Cocho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Nota da Leitura</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {notasLeitura.map(item => <Button key={item.nota} variant={leituraCocho === item.nota ? "default" : "outline"} size="sm" onClick={() => handleNotaClick(item.nota)} className="h-12 flex flex-col">
                          <span className="font-bold">{item.nota}</span>
                          <span className="text-xs">{item.ajuste}</span>
                        </Button>)}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ajuste-manual" className="text-sm font-medium">Ajuste Manual (kg/cab)</Label>
                    <Input id="ajuste-manual" type="number" step="0.1" value={ajusteManual} onChange={e => setAjusteManual(e.target.value)} onKeyDown={handleAjusteManual} placeholder="Digite e pressione Enter" className="mt-1" />
                  </div>

                  <Button onClick={handleSalvarLeitura} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Leitura
                  </Button>
                </div>
              </CardContent>
            </Card>}


          {/* Assistente silenciado */}
        </div>
      </div>
    </div>;
};
export default LeituraCocho;