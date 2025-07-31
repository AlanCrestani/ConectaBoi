import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Activity,
  Package,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';

// Dados simulados
const resumoGeral = {
  totalAnimais: 2450,
  lotesAtivos: 8,
  cmsMedia: 8.2,
  metaCms: 8.5,
  eficiencia: 94.2,
  diasMedios: 85,
  pesoMedio: 485,
  ganhoMedio: 1.4
};

const dadosProducao = [
  { dia: '15/01', previsto: 20.5, realizado: 19.8, eficiencia: 96.6 },
  { dia: '16/01', previsto: 20.5, realizado: 20.1, eficiencia: 98.0 },
  { dia: '17/01', previsto: 20.5, realizado: 19.2, eficiencia: 93.7 },
  { dia: '18/01', previsto: 20.5, realizado: 20.8, eficiencia: 101.5 },
  { dia: '19/01', previsto: 20.5, realizado: 20.3, eficiencia: 99.0 },
  { dia: '20/01', previsto: 20.5, realizado: 19.9, eficiencia: 97.1 },
  { dia: '21/01', previsto: 20.5, realizado: 20.6, eficiencia: 100.5 }
];

const consumoPorLote = [
  { lote: 'L001', animais: 145, cms: 8.4, meta: 8.5, status: 'adequado' },
  { lote: 'L002', animais: 132, cms: 7.8, meta: 8.2, status: 'baixo' },
  { lote: 'L003', animais: 158, cms: 8.7, meta: 8.6, status: 'adequado' },
  { lote: 'L004', animais: 142, cms: 8.9, meta: 8.5, status: 'alto' },
  { lote: 'L005', animais: 165, cms: 8.3, meta: 8.4, status: 'adequado' },
  { lote: 'L006', animais: 128, cms: 7.5, meta: 8.1, status: 'crítico' },
  { lote: 'L007', animais: 155, cms: 8.6, meta: 8.5, status: 'adequado' },
  { lote: 'L008', animais: 139, cms: 8.2, meta: 8.3, status: 'adequado' }
];

const distribuicaoDietas = [
  { nome: 'Adaptação', quantidade: 420, cor: '#8884d8' },
  { nome: 'Crescimento', quantidade: 750, cor: '#82ca9d' },
  { nome: 'Terminação', quantidade: 1280, cor: '#ffc658' }
];

const alertas = [
  { tipo: 'crítico', mensagem: 'Lote L006 com CMS 12% abaixo da meta', tempo: '5 min atrás' },
  { tipo: 'aviso', mensagem: 'Estoque de ureia com 3 dias restantes', tempo: '15 min atrás' },
  { tipo: 'info', mensagem: 'Carregamento L003 finalizado com sucesso', tempo: '25 min atrás' },
  { tipo: 'aviso', mensagem: 'Desvio de 8% no 3º trato do curral C045', tempo: '35 min atrás' }
];

const climaAtual = {
  temperatura: 28,
  umidade: 65,
  vento: 12,
  condicao: 'Parcialmente nublado'
};

const PainelOperacional = () => {
  const [filtroData, setFiltroData] = useState('hoje');
  const [filtroLote, setFiltroLote] = useState('todos');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'crítico':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'baixo':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Baixo</Badge>;
      case 'alto':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Alto</Badge>;
      case 'adequado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Adequado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getAlertaBadge = (tipo: string) => {
    switch (tipo) {
      case 'crítico':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'aviso':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      case 'info':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Operacional</h1>
          <p className="text-muted-foreground">Visão geral em tempo real do confinamento</p>
        </div>
        <div className="flex gap-2">
          <Select value={filtroData} onValueChange={setFiltroData}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Animais</p>
                <p className="text-2xl font-bold">{resumoGeral.totalAnimais.toLocaleString()}</p>
                <p className="text-xs text-green-600">+2.3% vs ontem</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CMS Médio</p>
                <p className="text-2xl font-bold">{resumoGeral.cmsMedia} kg/cab</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  Meta: {resumoGeral.metaCms} kg/cab
                  <Progress value={(resumoGeral.cmsMedia / resumoGeral.metaCms) * 100} className="ml-2 w-16 h-2" />
                </div>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold">{resumoGeral.eficiencia}%</p>
                <p className="text-xs text-green-600">+1.2% esta semana</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peso Médio</p>
                <p className="text-2xl font-bold">{resumoGeral.pesoMedio} kg</p>
                <p className="text-xs text-blue-600">+{resumoGeral.ganhoMedio} kg/dia</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primeira linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Produção */}
        <Card>
          <CardHeader>
            <CardTitle>Consumo MS - Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dadosProducao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="previsto" fill="hsl(var(--primary))" name="Previsto (ton)" />
                <Bar dataKey="realizado" fill="hsl(142, 76%, 36%)" name="Realizado (ton)" />
                <Line type="monotone" dataKey="eficiencia" stroke="hsl(var(--secondary))" name="Eficiência %" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Dietas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Dieta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoDietas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {distribuicaoDietas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs defaultValue="lotes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lotes">Controle por Lotes</TabsTrigger>
          <TabsTrigger value="alertas">Alertas e Avisos</TabsTrigger>
          <TabsTrigger value="clima">Condições Climáticas</TabsTrigger>
        </TabsList>

        <TabsContent value="lotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumo por Lote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consumoPorLote.map((lote) => (
                  <div key={lote.lote} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="font-semibold">{lote.lote}</div>
                      <div className="text-sm text-muted-foreground">{lote.animais} animais</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{lote.cms} kg/cab</div>
                        <div className="text-sm text-muted-foreground">Meta: {lote.meta} kg/cab</div>
                      </div>
                      <Progress 
                        value={(lote.cms / lote.meta) * 100} 
                        className="w-24"
                      />
                      {getStatusBadge(lote.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertas.map((alerta, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getAlertaBadge(alerta.tipo)}
                      <div>
                        <div className="font-medium">{alerta.mensagem}</div>
                        <div className="text-sm text-muted-foreground">{alerta.tempo}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clima" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Condições Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="h-8 w-8 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold">{climaAtual.temperatura}°C</div>
                      <div className="text-sm text-muted-foreground">Temperatura</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Droplets className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{climaAtual.umidade}%</div>
                      <div className="text-sm text-muted-foreground">Umidade</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wind className="h-8 w-8 text-gray-500" />
                    <div>
                      <div className="text-2xl font-bold">{climaAtual.vento} km/h</div>
                      <div className="text-sm text-muted-foreground">Vento</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sun className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">{climaAtual.condicao}</div>
                      <div className="text-sm text-muted-foreground">Condição</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsão do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hoje</span>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">28°C / 18°C</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Amanhã</span>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">25°C / 16°C</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quinta</span>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">30°C / 19°C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PainelOperacional;