import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart3, Users, TrendingUp } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <div className="p-4 bg-primary rounded-3xl shadow-medium">
              <Leaf className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ConectaBoi Insight
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto my-[25px]">
              Sistema completo de gestão e monitoramento para confinamento
              bovino
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Controle total do seu confinamento com análise de desvios,
              controle de estoque e dashboard operacional em tempo real.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Entrar no Sistema
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/signup")}
            >
              Criar Conta
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Leitura de Cocho</h3>
            <p className="text-muted-foreground">
              Sistema inteligente para lançamento de leituras com gráficos de
              CMS e controle por drill-down em 5 níveis.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-4">
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Análise de Desvios</h3>
            <p className="text-muted-foreground">
              Monitoramento completo de desvios de carregamento e distribuição
              com estatísticas e relatórios detalhados.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
            <div className="p-3 bg-warning/10 rounded-xl w-fit mb-4">
              <Users className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Controle Operacional</h3>
            <p className="text-muted-foreground">
              Dashboard completo com informações sobre animais, consumo, estoque
              de insumos e relatórios para diretoria.
            </p>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="mb-16">
          <img
            src={heroDashboard}
            alt="ConectaBoi Insight Dashboard"
            className="w-full rounded-3xl shadow-strong"
          />
        </div>

        {/* Benefits Section */}
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-medium">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher o ConectaBoi Insight?
            </h2>
            <p className="text-lg text-muted-foreground">
              Tecnologia avançada para maximizar a eficiência do seu
              confinamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Análise Inteligente</h4>
                  <p className="text-muted-foreground text-sm">
                    Processamento automático de dados do Power Query para Python
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-secondary/10 rounded-lg mt-1">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Análise Inteligente</h4>
                  <p className="text-muted-foreground text-sm">
                    IA especializada para sugestões de melhoria na eficiência
                    biológica
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-warning/10 rounded-lg mt-1">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Controle Total</h4>
                  <p className="text-muted-foreground text-sm">
                    Gestão completa de estoque, qualidade e operações diárias
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-info/10 rounded-lg mt-1">
                  <Leaf className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Sustentabilidade</h4>
                  <p className="text-muted-foreground text-sm">
                    Otimização de recursos para máxima eficiência e
                    sustentabilidade
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
