import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Fuel,
  TrendingUp,
  Plus,
  Filter,
  DollarSign,
  Zap,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

// Tipos
interface LancamentoCombustivel {
  id: string;
  data: string;
  tipo_combustivel: string;
  quantidade_litros: number;
  preco_unitario: number;
  valor_total: number;
  equipamento: string;
  operador: string;
  observacoes?: string;
  confinamento_id: string;
  created_at: string;
  updated_at: string;
}

interface ResumoCombustivel {
  consumo_diario: number;
  custo_diario: number;
  consumo_mensal: number;
  custo_mensal: number;
  media_preco: number;
  equipamento_mais_consumo: string;
  total_lancamentos: number;
}

interface AlertaCombustivel {
  id: string;
  tipo_alerta: string;
  valor_limite: number;
  ativo: boolean;
}

const ControleCombustivel = () => {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<LancamentoCombustivel[]>([]);
  const [resumo, setResumo] = useState<ResumoCombustivel>({
    consumo_diario: 0,
    custo_diario: 0,
    consumo_mensal: 0,
    custo_mensal: 0,
    media_preco: 0,
    equipamento_mais_consumo: "",
    total_lancamentos: 0,
  });
  const [alertas, setAlertas] = useState<AlertaCombustivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroEquipamento, setFiltroEquipamento] = useState<string>("");
  const [filtroTipoCombustivel, setFiltroTipoCombustivel] =
    useState<string>("todos");

  // Carregar dados do banco
  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar lançamentos
      const { data: lancamentosData, error: lancamentosError } = await supabase
        .from("combustivel_lancamentos")
        .select("*")
        .order("data", { ascending: false })
        .limit(50);

      if (lancamentosError) {
        console.error("Erro ao carregar lançamentos:", lancamentosError);
        setError("Erro ao carregar dados de combustível");
        return;
      }

      setLancamentos(
        (lancamentosData as unknown as LancamentoCombustivel[]) || []
      );

      // Buscar alertas
      const { data: alertasData, error: alertasError } = await supabase
        .from("combustivel_alertas")
        .select("*");

      if (alertasError) {
        console.error("Erro ao carregar alertas:", alertasError);
      } else {
        setAlertas((alertasData as unknown as AlertaCombustivel[]) || []);
      }

      // Calcular resumo
      if (lancamentosData && lancamentosData.length > 0) {
        const hoje = new Date().toISOString().split("T")[0];
        const mesAtual =
          new Date().getFullYear() +
          "-" +
          String(new Date().getMonth() + 1).padStart(2, "0");

        const lancamentosHoje = (
          lancamentosData as unknown as LancamentoCombustivel[]
        ).filter((l) => l.data === hoje);
        const lancamentosMes = (
          lancamentosData as unknown as LancamentoCombustivel[]
        ).filter((l) => l.data.startsWith(mesAtual));

        const consumoDiario = lancamentosHoje.reduce(
          (sum, l) => sum + (l.quantidade_litros || 0),
          0
        );
        const custoDiario = lancamentosHoje.reduce(
          (sum, l) => sum + (l.valor_total || 0),
          0
        );
        const consumoMensal = lancamentosMes.reduce(
          (sum, l) => sum + (l.quantidade_litros || 0),
          0
        );
        const custoMensal = lancamentosMes.reduce(
          (sum, l) => sum + (l.valor_total || 0),
          0
        );

        // Calcular equipamento mais usado
        const equipamentos = (
          lancamentosData as unknown as LancamentoCombustivel[]
        ).reduce((acc, l) => {
          const equipamento = l.equipamento || "Desconhecido";
          acc[equipamento] =
            (acc[equipamento] || 0) + (l.quantidade_litros || 0);
          return acc;
        }, {} as Record<string, number>);

        const equipamentoMaisConsumo =
          Object.entries(equipamentos).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          "";

        // Calcular preço médio
        const precoMedio =
          (lancamentosData as unknown as LancamentoCombustivel[]).reduce(
            (sum, l) => sum + (l.preco_unitario || 0),
            0
          ) / lancamentosData.length;

        setResumo({
          consumo_diario: consumoDiario,
          custo_diario: custoDiario,
          consumo_mensal: consumoMensal,
          custo_mensal: custoMensal,
          media_preco: precoMedio,
          equipamento_mais_consumo: equipamentoMaisConsumo,
          total_lancamentos: lancamentosData.length,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados de combustível");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleNovoLancamento = () => {
    toast.info("Funcionalidade de novo lançamento será implementada");
  };

  const getStatusBadge = (valor: number, limite: number) => {
    if (valor <= limite * 0.8) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Normal
        </Badge>
      );
    } else if (valor <= limite) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Atenção
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Alto
        </Badge>
      );
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const lancamentosFiltrados = lancamentos.filter((lancamento) => {
    const matchData = !filtroData || lancamento.data.includes(filtroData);
    const matchEquipamento =
      !filtroEquipamento ||
      lancamento.equipamento
        .toLowerCase()
        .includes(filtroEquipamento.toLowerCase());
    const matchTipo =
      filtroTipoCombustivel === "todos" ||
      lancamento.tipo_combustivel
        .toLowerCase()
        .includes(filtroTipoCombustivel.toLowerCase());

    return matchData && matchEquipamento && matchTipo;
  });

  // Se há erro, mostrar mensagem de erro
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Erro ao Carregar Dados
          </h1>
          <p className="text-red-600">{error}</p>
          <Button onClick={carregarDados} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Controle de Combustível
          </h1>
          <p className="text-gray-600">
            Gerencie o consumo e custos de combustível
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={carregarDados} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleNovoLancamento}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consumo Diário
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.consumo_diario.toFixed(1)} L
            </div>
            <div className="text-xs text-muted-foreground">
              {getStatusBadge(resumo.consumo_diario, 1000)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Diário</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda(resumo.custo_diario)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getStatusBadge(resumo.custo_diario, 5000)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consumo Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.consumo_mensal.toFixed(1)} L
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {(resumo.consumo_mensal / 30).toFixed(1)} L/dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarMoeda(resumo.media_preco)}
            </div>
            <p className="text-xs text-muted-foreground">Por litro</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtro-data">Data</Label>
              <Input
                id="filtro-data"
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                placeholder="Filtrar por data"
              />
            </div>
            <div>
              <Label htmlFor="filtro-equipamento">Equipamento</Label>
              <Input
                id="filtro-equipamento"
                value={filtroEquipamento}
                onChange={(e) => setFiltroEquipamento(e.target.value)}
                placeholder="Filtrar por equipamento"
              />
            </div>
            <div>
              <Label htmlFor="filtro-tipo">Tipo de Combustível</Label>
              <Select
                value={filtroTipoCombustivel}
                onValueChange={setFiltroTipoCombustivel}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="Diesel S10">Diesel S10</SelectItem>
                  <SelectItem value="Gasolina">Gasolina</SelectItem>
                  <SelectItem value="Etanol">Etanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Principal */}
      <Tabs defaultValue="lancamentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos de Combustível</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total de {lancamentosFiltrados.length} lançamentos encontrados
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : lancamentosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum lançamento encontrado</p>
                  <p className="text-sm">
                    Tente ajustar os filtros ou adicionar novos lançamentos
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lancamentosFiltrados.map((lancamento) => (
                        <TableRow key={lancamento.id}>
                          <TableCell>{formatarData(lancamento.data)}</TableCell>
                          <TableCell className="font-medium">
                            {lancamento.equipamento}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {lancamento.tipo_combustivel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {lancamento.quantidade_litros.toFixed(1)} L
                          </TableCell>
                          <TableCell>
                            {formatarMoeda(lancamento.preco_unitario)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatarMoeda(lancamento.valor_total)}
                          </TableCell>
                          <TableCell>{lancamento.operador}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {lancamento.observacoes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alertas Configurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertas.length > 0 ? (
                <div className="space-y-4">
                  {alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium capitalize">
                          {alerta.tipo_alerta.replace("_", " ")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Limite: {formatarMoeda(alerta.valor_limite)}
                        </div>
                      </div>
                      <Badge variant={alerta.ativo ? "default" : "secondary"}>
                        {alerta.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum alerta configurado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Resumo por Equipamento</h3>
                  <div className="text-sm text-muted-foreground">
                    Equipamento mais utilizado:{" "}
                    <strong>{resumo.equipamento_mais_consumo}</strong>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Estatísticas</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      Total de lançamentos:{" "}
                      <strong>{resumo.total_lancamentos}</strong>
                    </div>
                    <div>
                      Custo mensal:{" "}
                      <strong>{formatarMoeda(resumo.custo_mensal)}</strong>
                    </div>
                    <div>
                      Consumo mensal:{" "}
                      <strong>{resumo.consumo_mensal.toFixed(1)} L</strong>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ControleCombustivel;
