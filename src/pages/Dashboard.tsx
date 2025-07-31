import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import ETLButton from '@/components/ETLButton';
import { 
  BarChart3, 
  Upload, 
  FileText, 
  Settings, 
  LogOut, 
  Users, 
  TrendingUp,
  Package,
  Activity,
  Scale,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [animaisTotal, setAnimaisTotal] = useState<number>(0);
  const [cmsMedio, setCmsMedio] = useState<number>(0);
  const [diasMedios, setDiasMedios] = useState<number>(0);
  const [pesoMedioEstimado, setPesoMedioEstimado] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Buscar confinamentos do usuário
        const { data: userConfinamentos } = await supabase
          .from('user_confinamentos')
          .select('confinamento_id')
          .eq('user_id', user.id);

        if (!userConfinamentos?.length) return;

        // Buscar a data mais recente disponível
        const { data: dataRecente } = await supabase
          .from('fato_resumo')
          .select('data')
          .in('confinamento_id', userConfinamentos.map(uc => uc.confinamento_id))
          .order('data', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!dataRecente) return;

        // Buscar dados da data mais recente
        const { data: resumo } = await supabase
          .from('fato_resumo')
          .select('qtd_animais, cms_realizado_kg, dias_confinamento, peso_medio_estimado_kg')
          .eq('data', dataRecente.data)
          .in('confinamento_id', userConfinamentos.map(uc => uc.confinamento_id));

        if (resumo?.length) {
          const total = resumo.reduce((sum, item) => sum + (item.qtd_animais || 0), 0);
          setAnimaisTotal(total);

          // CMS Médio ponderado pela quantidade de animais
          const cmsTotal = resumo.reduce((sum, item) => 
            sum + ((item.cms_realizado_kg || 0) * (item.qtd_animais || 0)), 0);
          const cmsMedia = total > 0 ? cmsTotal / total : 0;
          setCmsMedio(cmsMedia);

          // Dias Médios ponderado pela quantidade de animais
          const diasTotal = resumo.reduce((sum, item) => 
            sum + ((item.dias_confinamento || 0) * (item.qtd_animais || 0)), 0);
          const diasMedia = total > 0 ? diasTotal / total : 0;
          setDiasMedios(diasMedia);

          // Peso Médio Estimado ponderado pela quantidade de animais
          const pesoTotal = resumo.reduce((sum, item) => 
            sum + ((item.peso_medio_estimado_kg || 0) * (item.qtd_animais || 0)), 0);
          const pesoMedia = total > 0 ? pesoTotal / total : 0;
          setPesoMedioEstimado(pesoMedia);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const dashboardCards = [
    {
      title: 'Upload de Dados',
      description: 'Fazer upload dos arquivos ETL',
      icon: Upload,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      route: '/upload'
    },
    {
      title: 'Leitura de Cocho',
      description: 'Lançamento das leituras diárias',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/leitura-cocho'
    },
    {
      title: 'Controle de Estoque',
      description: 'Gestão de insumos e ingredientes',
      icon: Package,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      route: '/controle-estoque'
    },
    {
      title: 'Painel Operacional',
      description: 'Dashboard geral do confinamento',
      icon: Activity,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      route: '/operacional'
    },
    {
      title: 'Análise de Desvios',
      description: 'Desvios de carregamento e trato',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      route: '/desvios'
    },
    {
      title: 'Acompanhamento Técnico',
      description: 'Controle de qualidade e dietas',
      icon: FileText,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      route: '/tecnico'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary rounded-lg">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ConectaBoi Insight</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão de Confinamento</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Bem-vindo, {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Animais Total</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : animaisTotal.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% desde ontem
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CMS Médio</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : `${cmsMedio.toFixed(1)} kg/cab`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Meta: 8.5 kg/cab
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dias Médios</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : `${Math.round(diasMedios)} dias`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Confinamento
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peso Médio Estimado</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : `${pesoMedioEstimado.toFixed(0)} kg`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Por cabeça
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-medium transition-all duration-200 hover:-translate-y-1"
                onClick={() => navigate(card.route)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${card.color} text-white`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ETLButton />
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col space-y-2"
                  onClick={() => navigate('/leitura-cocho')}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Leitura Cocho</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col space-y-2"
                  onClick={() => navigate('/operacional')}
                >
                  <Activity className="h-5 w-5" />
                  <span>Dashboard</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;