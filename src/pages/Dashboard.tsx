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
  Package,
  Settings,
  Smartphone,
  ClipboardList,
  Calculator,
  UserCheck,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

interface OperationalMetrics {
  animais_total: number;
  cms_medio: number;
  dias_medios: number;
  peso_medio_estimado: number;
  consumo_combustivel: number;
  custo_combustivel: number;
}

interface NavigationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchOperationalData = async () => {
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

      // Calculate operational metrics
      const operationalMetrics: OperationalMetrics = {
        animais_total: 4293, // Mock data for now
        cms_medio: 0.0,
        dias_medios: 76,
        peso_medio_estimado: 452,
        consumo_combustivel:
          combustivel?.reduce(
            (sum, item) => sum + (item.quantidade_litros || 0),
            0
          ) || 0,
        custo_combustivel:
          combustivel?.reduce(
            (sum, item) =>
              sum + (item.quantidade_litros || 0) * (item.preco_unitario || 0),
            0
          ) || 0,
      };

      setMetrics(operationalMetrics);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao carregar dados operacionais:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchOperationalData, 5 * 60 * 1000);
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

  const navigationCards: NavigationCard[] = [
    {
      id: "leitura-cocho",
      title: "Leitura de Cocho",
      description: "Lançamento das leituras diárias",
      icon: <BarChart3 className="h-6 w-6" />,
      route: "/leitura-cocho",
      color: "bg-green-500",
    },
    {
      id: "controle-estoque",
      title: "Controle de Estoque",
      description: "Gestão de insumos e ingredientes",
      icon: <Package className="h-6 w-6" />,
      route: "/estoque",
      color: "bg-purple-500",
    },
    {
      id: "painel-operacional",
      title: "Painel Operacional",
      description: "Dashboard geral do confinamento",
      icon: <LineChart className="h-6 w-6" />,
      route: "/painel-operacional",
      color: "bg-orange-500",
    },
    {
      id: "analise-desvios",
      title: "Análise de Desvios",
      description: "Desvios de carregamento e trato",
      icon: <TrendingUp className="h-6 w-6" />,
      route: "/desvios",
      color: "bg-red-500",
    },
    {
      id: "acompanhamento-tecnico",
      title: "Acompanhamento Técnico",
      description: "Controle de qualidade e dietas",
      icon: <ClipboardList className="h-6 w-6" />,
      route: "/acompanhamento",
      color: "bg-blue-500",
    },
    {
      id: "controle-combustivel",
      title: "Controle de Combustível",
      description: "Gestão de combustível e custos",
      icon: <Fuel className="h-6 w-6" />,
      route: "/combustivel",
      color: "bg-yellow-500",
    },
    {
      id: "gestao-usuarios",
      title: "Gestão de Usuários",
      description: "Cadastro e gerenciamento de usuários",
      icon: <UserCheck className="h-6 w-6" />,
      route: "/usuarios",
      color: "bg-indigo-500",
    },
    {
      id: "sincronizacao-mobile",
      title: "Sincronização Mobile",
      description: "Monitoramento de dispositivos móveis",
      icon: <Smartphone className="h-6 w-6" />,
      route: "/mobile",
      color: "bg-cyan-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando dashboard operacional...</p>
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
          <Button onClick={fetchOperationalData} variant="outline">
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
            ConectaBoi Insight
          </h1>
          <p className="text-gray-600">Sistema de Gestão de Confinamento</p>
          <p className="text-sm text-gray-500">
            Última atualização: {lastUpdate.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchOperationalData} variant="outline" size="sm">
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
            onClick={() => (window.location.href = "/dashboard-sistema")}
          >
            Dashboard Sistema
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animais Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.animais_total)}
            </div>
            <p className="text-xs text-muted-foreground">+12% desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CMS Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cms_medio} kg/cab</div>
            <p className="text-xs text-muted-foreground">Meta: 8.5 kg/cab</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Médios</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dias_medios} dias</div>
            <p className="text-xs text-muted-foreground">Confinamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peso Médio Estimado
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.peso_medio_estimado} kg
            </div>
            <p className="text-xs text-muted-foreground">Por cabeça</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consumo Combustível
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.consumo_combustivel)} L
            </div>
            <p className="text-xs text-muted-foreground">Por dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Custo Combustível
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.custo_combustivel)}
            </div>
            <p className="text-xs text-muted-foreground">Por dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Módulos Operacionais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card) => (
            <Card
              key={card.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.color} text-white`}>
                    {card.icon}
                  </div>
                  <Button variant="outline" size="sm">
                    Acessar
                  </Button>
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
