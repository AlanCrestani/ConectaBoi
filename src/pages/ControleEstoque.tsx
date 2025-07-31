import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';

// Dados simulados para ingredientes
const ingredientesEstoque = [
  {
    id: 1,
    nome: 'Silagem de Milho',
    categoria: 'Volumoso',
    estoqueAtual: 2500,
    estoqueMinimo: 1000,
    estoqueMaximo: 5000,
    unidade: 'kg',
    custoUnitario: 0.45,
    fornecedor: 'Fazenda Santa Rita',
    dataVencimento: '2024-02-15',
    localizacao: 'Silo A1',
    status: 'adequado'
  },
  {
    id: 2,
    nome: 'Milho Grão Úmido',
    categoria: 'Concentrado',
    estoqueAtual: 800,
    estoqueMinimo: 1200,
    estoqueMaximo: 4000,
    unidade: 'kg',
    custoUnitario: 0.75,
    fornecedor: 'Cooperativa AgriSul',
    dataVencimento: '2024-01-30',
    localizacao: 'Silo B2',
    status: 'baixo'
  },
  {
    id: 3,
    nome: 'Farelo de Soja',
    categoria: 'Proteico',
    estoqueAtual: 1500,
    estoqueMinimo: 800,
    estoqueMaximo: 3000,
    unidade: 'kg',
    custoUnitario: 1.20,
    fornecedor: 'Indústria Grãos do Sul',
    dataVencimento: '2024-03-10',
    localizacao: 'Galpão C1',
    status: 'adequado'
  },
  {
    id: 4,
    nome: 'Ureia',
    categoria: 'Aditivo',
    estoqueAtual: 50,
    estoqueMinimo: 100,
    estoqueMaximo: 500,
    unidade: 'kg',
    custoUnitario: 2.80,
    fornecedor: 'Química Industrial Ltda',
    dataVencimento: '2024-12-15',
    localizacao: 'Depósito D1',
    status: 'crítico'
  },
  {
    id: 5,
    nome: 'Feno de Tifton',
    categoria: 'Volumoso',
    estoqueAtual: 3200,
    estoqueMinimo: 1500,
    estoqueMaximo: 6000,
    unidade: 'kg',
    custoUnitario: 0.35,
    fornecedor: 'Haras Verde Campo',
    dataVencimento: '2024-04-20',
    localizacao: 'Galpão A2',
    status: 'adequado'
  }
];

// Dados para movimentações recentes
const movimentacoesRecentes = [
  {
    id: 1,
    tipo: 'entrada',
    ingrediente: 'Silagem de Milho',
    quantidade: 500,
    data: '2024-01-20',
    responsavel: 'João Silva',
    observacao: 'Entrega programada'
  },
  {
    id: 2,
    tipo: 'saida',
    ingrediente: 'Farelo de Soja',
    quantidade: 200,
    data: '2024-01-19',
    responsavel: 'Maria Santos',
    observacao: 'Consumo diário'
  },
  {
    id: 3,
    tipo: 'entrada',
    ingrediente: 'Ureia',
    quantidade: 100,
    data: '2024-01-18',
    responsavel: 'Pedro Costa',
    observacao: 'Reposição de estoque'
  }
];

const ControleEstoque = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'crítico':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'baixo':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Baixo</Badge>;
      case 'adequado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Adequado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getTipoMovimentacaoBadge = (tipo: string) => {
    return tipo === 'entrada' 
      ? <Badge variant="outline" className="bg-green-100 text-green-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          Entrada
        </Badge>
      : <Badge variant="outline" className="bg-red-100 text-red-800">
          <TrendingDown className="h-3 w-3 mr-1" />
          Saída
        </Badge>;
  };

  const filtrarIngredientes = () => {
    return ingredientesEstoque.filter(item => {
      const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = filtroCategoria === 'todos' || item.categoria === filtroCategoria;
      const matchStatus = filtroStatus === 'todos' || item.status === filtroStatus;
      
      return matchBusca && matchCategoria && matchStatus;
    });
  };

  const calcularResumo = () => {
    const total = ingredientesEstoque.length;
    const criticos = ingredientesEstoque.filter(i => i.status === 'crítico').length;
    const baixos = ingredientesEstoque.filter(i => i.status === 'baixo').length;
    const valorTotal = ingredientesEstoque.reduce((acc, item) => 
      acc + (item.estoqueAtual * item.custoUnitario), 0
    );

    return { total, criticos, baixos, valorTotal };
  };

  const resumo = calcularResumo();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gestão completa dos ingredientes e insumos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Ingrediente
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ingredientes</p>
                <p className="text-2xl font-bold">{resumo.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">{resumo.criticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{resumo.baixos}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {resumo.valorTotal.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs defaultValue="estoque" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estoque">Estoque Atual</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar ingrediente..." 
                      className="pl-10"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas Categorias</SelectItem>
                    <SelectItem value="Volumoso">Volumoso</SelectItem>
                    <SelectItem value="Concentrado">Concentrado</SelectItem>
                    <SelectItem value="Proteico">Proteico</SelectItem>
                    <SelectItem value="Aditivo">Aditivo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="adequado">Adequado</SelectItem>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="crítico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredientes em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Estoque Mín/Máx</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrarIngredientes().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{item.estoqueAtual.toLocaleString()} {item.unidade}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Mín: {item.estoqueMinimo.toLocaleString()}</div>
                          <div>Máx: {item.estoqueMaximo.toLocaleString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>R$ {item.custoUnitario.toFixed(2)}</TableCell>
                      <TableCell>R$ {(item.estoqueAtual * item.custoUnitario).toFixed(2)}</TableCell>
                      <TableCell>{item.localizacao}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Movimentar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoesRecentes.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{getTipoMovimentacaoBadge(mov.tipo)}</TableCell>
                      <TableCell>{mov.ingrediente}</TableCell>
                      <TableCell>{mov.quantidade} kg</TableCell>
                      <TableCell>{new Date(mov.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{mov.responsavel}</TableCell>
                      <TableCell>{mov.observacao}</TableCell>
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
              <CardTitle>Relatórios de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Relatório de Estoque Atual
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Relatório de Movimentações
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Relatório de Alertas
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingDown className="h-6 w-6 mb-2" />
                  Relatório de Consumo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ControleEstoque;