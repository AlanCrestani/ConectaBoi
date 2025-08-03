import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Fuel,
  Activity,
  AlertTriangle,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

interface DashboardMetrics {
  confinamentos: {
    total: number;
    ativos: number;
    inativos: number;
  };
  combustivel: {
    total_litros_mes: number;
    custo_total_mes: number;
    media_diaria: number;
    alertas: number;
  };
  animais: {
    total: number;
    peso_medio: number;
    eficiencia_conversao: number;
  };
  mobile: {
    dispositivos_ativos: number;
    ultima_sincronizacao: string;
    dados_pendentes: number;
  };
  performance: {
    uptime: number;
    response_time_avg: number;
    error_rate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

const DashboardSistema = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch confinamentos data
      const { data: confinamentos, error: confError } = await supabase
        .from("confinamentos")
        .select("*");

      if (confError) throw confError;

      // Fetch combustivel data
      const { data: combustivel, error: combError } = await supabase
        .from("combustivel_lancamentos")
        .select("*")
        .gte(
          "data",
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString()
        );

      if (combError) throw combError;

      // Fetch animais data (mock for now)
      const animaisData = {
        total: 1500,
        peso_medio: 450,
        eficiencia_conversao: 85,
      };

      // Calculate metrics
      const dashboardMetrics: DashboardMetrics = {
        confinamentos: {
          total: confinamentos?.length || 0,
          ativos: confinamentos?.filter((c) => c.ativo === true).length || 0,
          inativos: confinamentos?.filter((c) => c.ativo === false).length || 0,
        },
        combustivel: {
          total_litros_mes:
            combustivel?.reduce(
              (sum, item) => sum + (item.quantidade_litros || 0),
              0
            ) || 0,
          custo_total_mes:
            combustivel?.reduce(
              (sum, item) =>
                sum +
                (item.quantidade_litros || 0) * (item.preco_unitario || 0),
              0
            ) || 0,
          media_diaria: combustivel?.length
            ? combustivel.reduce(
                (sum, item) => sum + (item.quantidade_litros || 0),
                0
              ) / combustivel.length
            : 0,
          alertas: 3, // Mock data
        },
        animais: animaisData,
        mobile: {
          dispositivos_ativos: 12,
          ultima_sincronizacao: new Date().toISOString(),
          dados_pendentes: 5,
        },
        performance: {
          uptime: 99.9,
          response_time_avg: 245,
          error_rate: 0.1,
        },
      };

      setMetrics(dashboardMetrics);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const getStatusColor = (value: number, threshold: number) => {
    return value >= threshold ? "bg-green-500" : "bg-yellow-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando dashboard do sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erro no Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard do Sistema
          </h1>
          <p className="text-gray-600">
            Última atualização: {lastUpdate.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Dashboard Operacional
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confinamentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.confinamentos.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.confinamentos.ativos} ativos,{" "}
              {metrics.confinamentos.inativos} inativos
            </p>
            <Progress
              value={
                (metrics.confinamentos.ativos / metrics.confinamentos.total) *
                100
              }
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Combustível (Mês)
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.combustivel.total_litros_mes)} L
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics.combustivel.custo_total_mes)}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500">
                +12% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animais</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.animais.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              Peso médio: {metrics.animais.peso_medio} kg
            </p>
            <div className="flex items-center mt-2">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                  metrics.animais.eficiencia_conversao,
                  80
                )}`}
              />
              <span className="text-xs text-muted-foreground">
                Eficiência: {metrics.animais.eficiencia_conversao}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Sync</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.mobile.dispositivos_ativos}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.mobile.dados_pendentes} dados pendentes
            </p>
            <Badge
              variant={
                metrics.mobile.dados_pendentes > 0 ? "destructive" : "default"
              }
              className="mt-2"
            >
              {metrics.mobile.dados_pendentes > 0
                ? "Sincronização pendente"
                : "Sincronizado"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="combustivel">Combustível</TabsTrigger>
          <TabsTrigger value="animais">Animais</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Ativos</CardTitle>
                <CardDescription>
                  Problemas que requerem atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm">
                        Consumo de combustível acima da média
                      </span>
                    </div>
                    <Badge variant="secondary">Alto</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">
                        Dispositivo mobile offline há 2 horas
                      </span>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance do Sistema</CardTitle>
                <CardDescription>Métricas de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uptime</span>
                      <span>{metrics.performance.uptime}%</span>
                    </div>
                    <Progress
                      value={metrics.performance.uptime}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tempo de Resposta</span>
                      <span>{metrics.performance.response_time_avg}ms</span>
                    </div>
                    <Progress
                      value={
                        (metrics.performance.response_time_avg / 1000) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Erro</span>
                      <span>{metrics.performance.error_rate}%</span>
                    </div>
                    <Progress
                      value={metrics.performance.error_rate * 10}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="combustivel" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consumo Mensal</CardTitle>
                <CardDescription>Litros de combustível</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatNumber(metrics.combustivel.total_litros_mes)} L
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Média diária: {formatNumber(metrics.combustivel.media_diaria)}{" "}
                  L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custo Total</CardTitle>
                <CardDescription>Gastos com combustível</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(metrics.combustivel.custo_total_mes)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Custo médio por litro:{" "}
                  {formatCurrency(
                    metrics.combustivel.custo_total_mes /
                      metrics.combustivel.total_litros_mes
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas</CardTitle>
                <CardDescription>Problemas detectados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {metrics.combustivel.alertas}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Requerem atenção imediata
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="animais" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Animais</CardTitle>
                <CardDescription>Animais em confinamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatNumber(metrics.animais.total)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Distribuídos em {metrics.confinamentos.ativos} confinamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peso Médio</CardTitle>
                <CardDescription>Peso médio dos animais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {metrics.animais.peso_medio} kg
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Meta: 500 kg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiência de Conversão</CardTitle>
                <CardDescription>Performance alimentar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {metrics.animais.eficiencia_conversao}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">Meta: 85%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Ativos</CardTitle>
                <CardDescription>Dispositivos conectados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.mobile.dispositivos_ativos}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Em operação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Última Sincronização</CardTitle>
                <CardDescription>Status da sincronização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-green-600">
                  {new Date(metrics.mobile.ultima_sincronizacao).toLocaleString(
                    "pt-BR"
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Todos os dispositivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados Pendentes</CardTitle>
                <CardDescription>Aguardando sincronização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {metrics.mobile.dados_pendentes}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Requerem atenção
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
                <CardDescription>Disponibilidade do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {metrics.performance.uptime}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Meta: 99.9%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Resposta</CardTitle>
                <CardDescription>Latência média</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.performance.response_time_avg}ms
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Meta: {"<"} 500ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Erro</CardTitle>
                <CardDescription>Erros por requisição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {metrics.performance.error_rate}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Meta: {"<"} 0.1%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardSistema;
