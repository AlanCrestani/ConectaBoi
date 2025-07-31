import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const planos = [
  {
    id: 'basic',
    nome: 'Basic',
    preco: 'R$ 99',
    periodo: '/mês',
    descricao: 'Ideal para pequenos confinamentos',
    animais: 'Até 1.000 animais',
    icon: TrendingUp,
    recursos: [
      'Dashboard completo',
      'Leitura de cocho',
      'Controle de estoque',
      'Relatórios básicos',
      'Suporte por email'
    ]
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 'R$ 199',
    periodo: '/mês',
    descricao: 'Para confinamentos em crescimento',
    animais: 'Até 5.000 animais',
    icon: Users,
    popular: true,
    recursos: [
      'Todos os recursos do Basic',
      'Análise de desvios avançada',
      'Acompanhamento técnico',
      'Relatórios personalizados',
      'Integração com sistemas',
      'Suporte prioritário'
    ]
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 'R$ 399',
    periodo: '/mês',
    descricao: 'Para grandes operações',
    animais: 'Animais ilimitados',
    icon: Crown,
    recursos: [
      'Todos os recursos do Premium',
      'IA e Machine Learning',
      'API personalizada',
      'Suporte 24/7',
      'Consultoria técnica',
      'Treinamento da equipe',
      'Multi-confinamentos'
    ]
  }
];

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nomeConfinamento, setNomeConfinamento] = useState('');
  const [planoSelecionado, setPlanoSelecionado] = useState('');

  const handleSubscription = async (planoId: string) => {
    if (!nomeConfinamento.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do seu confinamento.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setPlanoSelecionado(planoId);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { 
          plano: planoId,
          nomeConfinamento: nomeConfinamento.trim()
        }
      });

      if (error) throw error;

      // Redirecionar para o Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      }

    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Ocorreu um erro ao criar a assinatura. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setPlanoSelecionado('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecione o plano ideal para o seu confinamento e comece a otimizar sua gestão hoje mesmo.
          </p>
        </div>

        {/* Nome do Confinamento */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center">Dados do Confinamento</CardTitle>
            <CardDescription className="text-center">
              Informe o nome do seu confinamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Confinamento</Label>
              <Input
                id="nome"
                placeholder="Ex: Fazenda Santa Maria"
                value={nomeConfinamento}
                onChange={(e) => setNomeConfinamento(e.target.value)}
                className="text-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {planos.map((plano) => {
            const Icon = plano.icon;
            const isLoading = loading && planoSelecionado === plano.id;
            
            return (
              <Card 
                key={plano.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  plano.popular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {plano.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-primary text-primary-foreground text-sm text-center py-2 font-medium">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className={plano.popular ? 'pt-12' : ''}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-center text-2xl">
                    {plano.nome}
                  </CardTitle>
                  
                  <div className="text-center">
                    <span className="text-4xl font-bold">{plano.preco}</span>
                    <span className="text-muted-foreground">{plano.periodo}</span>
                  </div>
                  
                  <CardDescription className="text-center">
                    {plano.descricao}
                  </CardDescription>
                  
                  <Badge variant="secondary" className="mx-auto w-fit">
                    {plano.animais}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plano.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recurso}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plano.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscription(plano.id)}
                    disabled={loading || !nomeConfinamento.trim()}
                  >
                    {isLoading ? 'Processando...' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 30 dias de teste grátis
          </p>
          <p className="text-xs text-muted-foreground">
            Você pode cancelar sua assinatura a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;