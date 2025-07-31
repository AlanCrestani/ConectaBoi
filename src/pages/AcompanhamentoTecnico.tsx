import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Beaker,
  Microscope,
  FlaskConical,
  TrendingUp,
  Calendar,
  User,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Dados simulados para análises laboratoriais
const analisesLaboratoriais = [
  {
    id: 'LAB001',
    data: '2024-01-22',
    amostra: 'Silagem de Milho - Lote 001',
    tipo: 'Bromatológica',
    ms: 32.5,
    pb: 8.2,
    fdn: 45.8,
    fda: 23.1,
    ee: 3.4,
    mm: 4.2,
    status: 'aprovado',
    tecnico: 'Dr. Carlos Nutrição',
    observacoes: 'Valores dentro do padrão esperado'
  },
  {
    id: 'LAB002',
    data: '2024-01-21',
    amostra: 'Milho Grão - Lote 003',
    tipo: 'Micotoxinas',
    aflatoxina: 8.5,
    zearalenona: 120.0,
    fumonisina: 1800.0,
    status: 'atenção',
    tecnico: 'Dra. Ana Qualidade',
    observacoes: 'Aflatoxina próxima ao limite'
  },
  {
    id: 'LAB003',
    data: '2024-01-20',
    amostra: 'Farelo de Soja - Lote 002',
    tipo: 'Bromatológica',
    ms: 89.2,
    pb: 45.8,
    fdn: 12.5,
    fda: 8.2,
    ee: 1.8,
    mm: 6.5,
    status: 'reprovado',
    tecnico: 'Dr. Carlos Nutrição',
    observacoes: 'Proteína bruta abaixo do esperado'
  }
];

// Dados para formulações de dietas
const formulacoesDietas = [
  {
    id: 'DIET001',
    nome: 'Terminação A - Nelore',
    categoria: 'Terminação',
    dataFormulacao: '2024-01-15',
    status: 'ativa',
    nutricionista: 'Dr. Ricardo Silva',
    ingredientes: [
      { nome: 'Silagem de Milho', inclusao: 45.0, custoKg: 0.45 },
      { nome: 'Milho Grão Moído', inclusao: 35.0, custoKg: 0.75 },
      { nome: 'Farelo de Soja', inclusao: 15.0, custoKg: 1.20 },
      { nome: 'Núcleo Mineral', inclusao: 5.0, custoKg: 3.50 }
    ],
    composicaoNutricional: {
      ms: 75.5,
      pb: 14.2,
      fdn: 28.5,
      ndt: 76.8,
      custoTon: 685.50
    }
  },
  {
    id: 'DIET002',
    nome: 'Crescimento B - Angus',
    categoria: 'Crescimento',
    dataFormulacao: '2024-01-18',
    status: 'revisão',
    nutricionista: 'Dra. Mariana Costa',
    ingredientes: [
      { nome: 'Silagem de Milho', inclusao: 50.0, custoKg: 0.45 },
      { nome: 'Milho Grão Moído', inclusao: 25.0, custoKg: 0.75 },
      { nome: 'Farelo de Soja', inclusao: 20.0, custoKg: 1.20 },
      { nome: 'Núcleo Mineral', inclusao: 5.0, custoKg: 3.50 }
    ],
    composicaoNutricional: {
      ms: 72.3,
      pb: 16.8,
      fdn: 32.1,
      ndt: 74.2,
      custoTon: 612.50
    }
  }
];

// Dados para qualidade da água
const qualidadeAgua = [
  {
    id: 'AGUA001',
    data: '2024-01-22',
    local: 'Bebedouro Setor A',
    ph: 7.2,
    condutividade: 450,
    dureza: 180,
    nitratos: 8.5,
    coliformes: 0,
    status: 'aprovado'
  },
  {
    id: 'AGUA002',
    data: '2024-01-22',
    local: 'Bebedouro Setor B',
    ph: 6.8,
    condutividade: 520,
    dureza: 220,
    nitratos: 12.0,
    coliformes: 0,
    status: 'atenção'
  }
];

// Dados para performance nutricional
const performanceNutricional = [
  { periodo: 'Sem 1', ganhoMedio: 1.2, cmsObservado: 8.1, cmsEsperado: 8.3, eficiencia: 97.6 },
  { periodo: 'Sem 2', ganhoMedio: 1.4, cmsObservado: 8.4, cmsEsperado: 8.3, eficiencia: 101.2 },
  { periodo: 'Sem 3', ganhoMedio: 1.3, cmsObservado: 8.2, cmsEsperado: 8.4, eficiencia: 97.6 },
  { periodo: 'Sem 4', ganhoMedio: 1.5, cmsObservado: 8.6, cmsEsperado: 8.4, eficiencia: 102.4 }
];

const AcompanhamentoTecnico = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [novaAnalise, setNovaAnalise] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Aprovado
        </Badge>;
      case 'reprovado':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Reprovado
        </Badge>;
      case 'atenção':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Atenção
        </Badge>;
      case 'ativa':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'revisão':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Em Revisão</Badge>;
      case 'inativa':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativa</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const calcularResumos = () => {
    const totalAnalises = analisesLaboratoriais.length;
    const aprovadas = analisesLaboratoriais.filter(a => a.status === 'aprovado').length;
    const dietasAtivas = formulacoesDietas.filter(d => d.status === 'ativa').length;
    const custoMedio = formulacoesDietas.reduce((acc, diet) => acc + diet.composicaoNutricional.custoTon, 0) / formulacoesDietas.length;
    
    return {
      totalAnalises,
      aprovadas,
      dietasAtivas,
      custoMedio,
      eficienciaAnalises: ((aprovadas / totalAnalises) * 100).toFixed(1)
    };
  };

  const resumos = calcularResumos();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento Técnico</h1>
          <p className="text-muted-foreground">Controle de qualidade, dietas e análises laboratoriais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Análises Realizadas</p>
                <p className="text-2xl font-bold">{resumos.totalAnalises}</p>
                <p className="text-xs text-green-600">Taxa aprovação: {resumos.eficienciaAnalises}%</p>
              </div>
              <Microscope className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dietas Ativas</p>
                <p className="text-2xl font-bold">{resumos.dietasAtivas}</p>
                <p className="text-xs text-blue-600">Em produção</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Médio Dieta</p>
                <p className="text-2xl font-bold">R$ {resumos.custoMedio.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">por tonelada</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ganho Médio</p>
                <p className="text-2xl font-bold">1.35 kg</p>
                <p className="text-xs text-green-600">por dia</p>
              </div>
              <Beaker className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Nutricional - Últimas 4 Semanas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceNutricional}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis yAxisId="left" label={{ value: 'Ganho (kg/dia)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'CMS (kg/cab)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="ganhoMedio" fill="hsl(var(--primary))" name="Ganho Médio (kg/dia)" />
              <Line yAxisId="right" type="monotone" dataKey="cmsObservado" stroke="hsl(142, 76%, 36%)" name="CMS Observado" />
              <Line yAxisId="right" type="monotone" dataKey="cmsEsperado" stroke="hsl(var(--destructive))" strokeDasharray="5 5" name="CMS Esperado" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs Principal */}
      <Tabs defaultValue="analises" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analises">Análises Laboratoriais</TabsTrigger>
          <TabsTrigger value="dietas">Formulação de Dietas</TabsTrigger>
          <TabsTrigger value="agua">Qualidade da Água</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios Técnicos</TabsTrigger>
        </TabsList>

        <TabsContent value="analises" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por amostra, lote, tipo..." 
                      className="pl-10"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo de Análise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="Bromatológica">Bromatológica</SelectItem>
                    <SelectItem value="Micotoxinas">Micotoxinas</SelectItem>
                    <SelectItem value="Minerais">Minerais</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="atenção">Atenção</SelectItem>
                    <SelectItem value="reprovado">Reprovado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Análises */}
          <Card>
            <CardHeader>
              <CardTitle>Análises Laboratoriais</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Amostra</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Resultados</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analisesLaboratoriais.map((analise) => (
                    <TableRow key={analise.id}>
                      <TableCell className="font-medium">{analise.id}</TableCell>
                      <TableCell>{new Date(analise.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{analise.amostra}</TableCell>
                      <TableCell>{analise.tipo}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {analise.tipo === 'Bromatológica' ? (
                            <>
                              <div>MS: {analise.ms}%</div>
                              <div>PB: {analise.pb}%</div>
                              <div>FDN: {analise.fdn}%</div>
                            </>
                          ) : (
                            <>
                              <div>Aflatoxina: {analise.aflatoxina} ppb</div>
                              <div>Zearalenona: {analise.zearalenona} ppb</div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(analise.status)}</TableCell>
                      <TableCell>{analise.tecnico}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dietas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {formulacoesDietas.map((dieta) => (
              <Card key={dieta.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dieta.nome}</CardTitle>
                    {getStatusBadge(dieta.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Categoria: {dieta.categoria}</div>
                    <div>Nutricionista: {dieta.nutricionista}</div>
                    <div>Formulação: {new Date(dieta.dataFormulacao).toLocaleDateString('pt-BR')}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Composição Nutricional */}
                  <div>
                    <h4 className="font-medium mb-2">Composição Nutricional</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>MS: {dieta.composicaoNutricional.ms}%</div>
                      <div>PB: {dieta.composicaoNutricional.pb}%</div>
                      <div>FDN: {dieta.composicaoNutricional.fdn}%</div>
                      <div>NDT: {dieta.composicaoNutricional.ndt}%</div>
                    </div>
                    <div className="mt-2 text-lg font-bold text-primary">
                      Custo: R$ {dieta.composicaoNutricional.custoTon.toFixed(2)}/ton
                    </div>
                  </div>

                  {/* Ingredientes */}
                  <div>
                    <h4 className="font-medium mb-2">Ingredientes</h4>
                    <div className="space-y-1">
                      {dieta.ingredientes.map((ing, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{ing.nome}</span>
                          <span>{ing.inclusao}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agua" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises de Qualidade da Água</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>pH</TableHead>
                    <TableHead>Condutividade</TableHead>
                    <TableHead>Dureza</TableHead>
                    <TableHead>Nitratos</TableHead>
                    <TableHead>Coliformes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualidadeAgua.map((agua) => (
                    <TableRow key={agua.id}>
                      <TableCell>{new Date(agua.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{agua.local}</TableCell>
                      <TableCell>{agua.ph}</TableCell>
                      <TableCell>{agua.condutividade} μS/cm</TableCell>
                      <TableCell>{agua.dureza} mg/L</TableCell>
                      <TableCell>{agua.nitratos} mg/L</TableCell>
                      <TableCell>{agua.coliformes} UFC/100ml</TableCell>
                      <TableCell>{getStatusBadge(agua.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <FlaskConical className="h-6 w-6 mb-2" />
                  <span>Relatório de Análises</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Formulações Ativas</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Performance Nutricional</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Beaker className="h-6 w-6 mb-2" />
                  <span>Qualidade da Água</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Cronograma Análises</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <User className="h-6 w-6 mb-2" />
                  <span>Relatório por Técnico</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcompanhamentoTecnico;