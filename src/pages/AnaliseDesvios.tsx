import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CalendarIcon,
  Search,
  Filter,
  Download,
  RefreshCw,
  Target,
  Truck,
  Scale,
  Users,
  MapPin,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Cores para gráficos
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

interface DesvioCarregamento {
  data: string;
  hora_carregamento: string;
  id_carregamento: string;
  vagao: string;
  dieta: string;
  tipo_dieta: string;
  ingrediente: string;
  previsto_kg: number;
  realizado_kg: number;
  desvio_kg: number;
  desvio_pc: number;
  pazeiro: string;
  status: string;
}

interface DesvioTrato {
  data: string;
  hora_trato: string;
  id_carregamento: string;
  id_curral: string;
  dieta: string;
  tipo_dieta: string;
  previsto_kg: number;
  realizado_kg: number;
  desvio_kg: number;
  desvio_pc: number;
  tratador: string;
  vagao: string;
  lote: string;
  trato: string;
}

const AnaliseDesvios = () => {
  const [dataInicio, setDataInicio] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [desviosCarregamento, setDesviosCarregamento] = useState<DesvioCarregamento[]>([]);
  const [desviosTrato, setDesviosTrato] = useState<DesvioTrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [agrupamento, setAgrupamento] = useState('tipo_dieta');

  const buscarDados = async () => {
    setLoading(true);
    try {
      // Buscar dados de carregamento
      const { data: carregamentoData, error: carregamentoError } = await supabase
        .from('fato_carregamento')
        .select('*')
        .gte('data', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data', format(dataFim, 'yyyy-MM-dd'))
        .not('desvio_kg', 'is', null)
        .order('data', { ascending: false });

      if (carregamentoError) throw carregamentoError;

      // Buscar dados de trato
      const { data: tratoData, error: tratoError } = await supabase
        .from('fato_trato')
        .select('*')
        .gte('data', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data', format(dataFim, 'yyyy-MM-dd'))
        .not('desvio_kg', 'is', null)
        .order('data', { ascending: false });

      if (tratoError) throw tratoError;

      setDesviosCarregamento(carregamentoData || []);
      setDesviosTrato(tratoData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados de desvios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [dataInicio, dataFim]);

  const calcularEstatisticas = () => {
    const totalCarregamento = desviosCarregamento.length;
    const totalTrato = desviosTrato.length;
    
    const desvioMedioCarregamento = desviosCarregamento.length > 0 
      ? desviosCarregamento.reduce((sum, item) => sum + Math.abs(item.desvio_pc || 0), 0) / desviosCarregamento.length
      : 0;
    
    const desvioMedioTrato = desviosTrato.length > 0
      ? desviosTrato.reduce((sum, item) => sum + Math.abs(item.desvio_pc || 0), 0) / desviosTrato.length
      : 0;

    const alertasCriticos = [
      ...desviosCarregamento.filter(item => Math.abs(item.desvio_pc || 0) > 10),
      ...desviosTrato.filter(item => Math.abs(item.desvio_pc || 0) > 10)
    ].length;

    return {
      totalCarregamento,
      totalTrato,
      desvioMedioCarregamento,
      desvioMedioTrato,
      alertasCriticos
    };
  };

  const agruparDados = () => {
    let dadosAgrupados: any[] = [];

    switch (agrupamento) {
      case 'tipo_dieta':
        const gruposPorTipoDieta = [...desviosCarregamento, ...desviosTrato].reduce((acc, item) => {
          const key = item.tipo_dieta || 'Não Informado';
          if (!acc[key]) {
            acc[key] = { nome: key, total: 0, desvioMedio: 0, somaDesvios: 0 };
          }
          acc[key].total++;
          acc[key].somaDesvios += Math.abs(item.desvio_pc || 0);
          acc[key].desvioMedio = acc[key].somaDesvios / acc[key].total;
          return acc;
        }, {});
        dadosAgrupados = Object.values(gruposPorTipoDieta);
        break;

      case 'ingrediente':
        const gruposPorIngrediente = desviosCarregamento.reduce((acc, item) => {
          const key = item.ingrediente || 'Não Informado';
          if (!acc[key]) {
            acc[key] = { nome: key, total: 0, desvioMedio: 0, somaDesvios: 0 };
          }
          acc[key].total++;
          acc[key].somaDesvios += Math.abs(item.desvio_pc || 0);
          acc[key].desvioMedio = acc[key].somaDesvios / acc[key].total;
          return acc;
        }, {});
        dadosAgrupados = Object.values(gruposPorIngrediente);
        break;

      case 'tratador':
        const gruposPorTratador = desviosTrato.reduce((acc, item) => {
          const key = item.tratador || 'Não Informado';
          if (!acc[key]) {
            acc[key] = { nome: key, total: 0, desvioMedio: 0, somaDesvios: 0 };
          }
          acc[key].total++;
          acc[key].somaDesvios += Math.abs(item.desvio_pc || 0);
          acc[key].desvioMedio = acc[key].somaDesvios / acc[key].total;
          return acc;
        }, {});
        dadosAgrupados = Object.values(gruposPorTratador);
        break;

      case 'pazeiro':
        const gruposPorPazeiro = desviosCarregamento.reduce((acc, item) => {
          const key = item.pazeiro || 'Não Informado';
          if (!acc[key]) {
            acc[key] = { nome: key, total: 0, desvioMedio: 0, somaDesvios: 0 };
          }
          acc[key].total++;
          acc[key].somaDesvios += Math.abs(item.desvio_pc || 0);
          acc[key].desvioMedio = acc[key].somaDesvios / acc[key].total;
          return acc;
        }, {});
        dadosAgrupados = Object.values(gruposPorPazeiro);
        break;

      case 'curral':
        const gruposPorCurral = desviosTrato.reduce((acc, item) => {
          const key = item.id_curral || 'Não Informado';
          if (!acc[key]) {
            acc[key] = { nome: key, total: 0, desvioMedio: 0, somaDesvios: 0 };
          }
          acc[key].total++;
          acc[key].somaDesvios += Math.abs(item.desvio_pc || 0);
          acc[key].desvioMedio = acc[key].somaDesvios / acc[key].total;
          return acc;
        }, {});
        dadosAgrupados = Object.values(gruposPorCurral);
        break;

      case 'data':
        const gruposPorData = [...desviosCarregamento, ...desviosTrato].reduce((acc, item) => {
          const key = item.data;
          if (!acc[key]) {
            acc[key] = { nome: key, total: 0, desvioMedio: 0, somaDesvios: 0 };
          }
          acc[key].total++;
          acc[key].somaDesvios += Math.abs(item.desvio_pc || 0);
          acc[key].desvioMedio = acc[key].somaDesvios / acc[key].total;
          return acc;
        }, {});
        dadosAgrupados = Object.values(gruposPorData);
        break;
    }

    return dadosAgrupados.sort((a, b) => b.desvioMedio - a.desvioMedio);
  };

  const getDesvioColor = (desvio: number) => {
    const absDesvio = Math.abs(desvio);
    if (absDesvio <= 2) return 'text-green-600';
    if (absDesvio <= 5) return 'text-yellow-600';
    if (absDesvio <= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const estatisticas = calcularEstatisticas();
  const dadosAgrupados = agruparDados();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise de Desvios</h1>
          <p className="text-muted-foreground">Monitoramento de desvios de carregamento e distribuição</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={buscarDados}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros de Data */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Data Início:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Data Fim:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => date && setDataFim(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Agrupar por:</label>
              <Select value={agrupamento} onValueChange={setAgrupamento}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tipo_dieta">Tipo de Dieta</SelectItem>
                  <SelectItem value="ingrediente">Ingrediente</SelectItem>
                  <SelectItem value="tratador">Tratador</SelectItem>
                  <SelectItem value="pazeiro">Pazeiro</SelectItem>
                  <SelectItem value="curral">Curral</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desvios Carregamento</p>
                <p className="text-2xl font-bold">{estatisticas.totalCarregamento}</p>
                <p className="text-xs text-blue-600">
                  Desvio médio: {estatisticas.desvioMedioCarregamento.toFixed(1)}%
                </p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desvios Distribuição</p>
                <p className="text-2xl font-bold">{estatisticas.totalTrato}</p>
                <p className="text-xs text-green-600">
                  Desvio médio: {estatisticas.desvioMedioTrato.toFixed(1)}%
                </p>
              </div>
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desvio Médio Geral</p>
                <p className="text-2xl font-bold">
                  {((estatisticas.desvioMedioCarregamento + estatisticas.desvioMedioTrato) / 2).toFixed(1)}%
                </p>
                <p className="text-xs text-yellow-600">Meta: &lt; 5.0%</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.alertasCriticos}</p>
                <p className="text-xs text-red-600">Acima de 10%</p>
              </div>
              <Target className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Análise por Agrupamento */}
      <Card>
        <CardHeader>
          <CardTitle>
            Análise por {agrupamento === 'tipo_dieta' ? 'Tipo de Dieta' : 
                        agrupamento === 'ingrediente' ? 'Ingrediente' :
                        agrupamento === 'tratador' ? 'Tratador' :
                        agrupamento === 'pazeiro' ? 'Pazeiro' :
                        agrupamento === 'curral' ? 'Curral' : 'Data'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosAgrupados.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nome" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                fontSize={12}
              />
              <YAxis label={{ value: 'Desvio Médio (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="desvioMedio" fill="hsl(var(--primary))" name="Desvio Médio (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs Principais */}
      <Tabs defaultValue="carregamento" className="space-y-4">
        <TabsList>
          <TabsTrigger value="carregamento">Desvios Carregamento</TabsTrigger>
          <TabsTrigger value="distribuicao">Desvios Distribuição</TabsTrigger>
          <TabsTrigger value="ranking">Ranking por Agrupamento</TabsTrigger>
        </TabsList>

        <TabsContent value="carregamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desvios de Carregamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Carregamento</TableHead>
                      <TableHead>Vagão</TableHead>
                      <TableHead>Dieta</TableHead>
                      <TableHead>Ingrediente</TableHead>
                      <TableHead>Previsto (kg)</TableHead>
                      <TableHead>Realizado (kg)</TableHead>
                      <TableHead>Desvio</TableHead>
                      <TableHead>Pazeiro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {desviosCarregamento.slice(0, 50).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(item.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{item.hora_carregamento}</TableCell>
                        <TableCell className="font-medium">{item.id_carregamento}</TableCell>
                        <TableCell>{item.vagao}</TableCell>
                        <TableCell>{item.tipo_dieta}</TableCell>
                        <TableCell>{item.ingrediente}</TableCell>
                        <TableCell>{item.previsto_kg?.toFixed(1) || '-'}</TableCell>
                        <TableCell>{item.realizado_kg?.toFixed(1) || '-'}</TableCell>
                        <TableCell>
                          <div className={`font-medium ${getDesvioColor(item.desvio_pc || 0)}`}>
                            <div>{(item.desvio_kg || 0) > 0 ? '+' : ''}{(item.desvio_kg || 0).toFixed(1)} kg</div>
                            <div className="text-xs">
                              ({(item.desvio_pc || 0) > 0 ? '+' : ''}{(item.desvio_pc || 0).toFixed(1)}%)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.pazeiro || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribuicao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desvios de Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Curral</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Trato</TableHead>
                      <TableHead>Dieta</TableHead>
                      <TableHead>Previsto (kg)</TableHead>
                      <TableHead>Realizado (kg)</TableHead>
                      <TableHead>Desvio</TableHead>
                      <TableHead>Tratador</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {desviosTrato.slice(0, 50).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(item.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{item.hora_trato}</TableCell>
                        <TableCell className="font-medium">{item.id_curral}</TableCell>
                        <TableCell>{item.lote}</TableCell>
                        <TableCell>{item.trato}</TableCell>
                        <TableCell>{item.tipo_dieta}</TableCell>
                        <TableCell>{item.previsto_kg?.toFixed(1) || '-'}</TableCell>
                        <TableCell>{item.realizado_kg?.toFixed(1) || '-'}</TableCell>
                        <TableCell>
                          <div className={`font-medium ${getDesvioColor(item.desvio_pc || 0)}`}>
                            <div>{(item.desvio_kg || 0) > 0 ? '+' : ''}{(item.desvio_kg || 0).toFixed(1)} kg</div>
                            <div className="text-xs">
                              ({(item.desvio_pc || 0) > 0 ? '+' : ''}{(item.desvio_pc || 0).toFixed(1)}%)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.tratador || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Ranking por {agrupamento === 'tipo_dieta' ? 'Tipo de Dieta' : 
                            agrupamento === 'ingrediente' ? 'Ingrediente' :
                            agrupamento === 'tratador' ? 'Tratador' :
                            agrupamento === 'pazeiro' ? 'Pazeiro' :
                            agrupamento === 'curral' ? 'Curral' : 'Data'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>
                      {agrupamento === 'tipo_dieta' ? 'Tipo de Dieta' : 
                       agrupamento === 'ingrediente' ? 'Ingrediente' :
                       agrupamento === 'tratador' ? 'Tratador' :
                       agrupamento === 'pazeiro' ? 'Pazeiro' :
                       agrupamento === 'curral' ? 'Curral' : 'Data'}
                    </TableHead>
                    <TableHead>Desvio Médio (%)</TableHead>
                    <TableHead>Total de Ocorrências</TableHead>
                    <TableHead>Classificação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosAgrupados.map((item, index) => (
                    <TableRow key={item.nome}>
                      <TableCell className="font-medium">{index + 1}º</TableCell>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell className={getDesvioColor(item.desvioMedio)}>
                        {item.desvioMedio.toFixed(1)}%
                      </TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>
                        {item.desvioMedio > 10 && <Badge variant="destructive">Crítico</Badge>}
                        {item.desvioMedio > 5 && item.desvioMedio <= 10 && <Badge className="bg-yellow-100 text-yellow-800">Alto</Badge>}
                        {item.desvioMedio <= 5 && <Badge className="bg-green-100 text-green-800">Normal</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnaliseDesvios;