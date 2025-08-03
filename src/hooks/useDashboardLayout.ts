import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NavigationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  groupId?: string;
}

interface CardGroup {
  id: string;
  name: string;
  cards: string[];
}

interface SerializedNavigationCard {
  id: string;
  title: string;
  description: string;
  route: string;
  color: string;
  groupId?: string;
}

const defaultNavigationCards: NavigationCard[] = [
  {
    id: "leitura-cocho",
    title: "Leitura de Cocho",
    description: "Lançamento das leituras diárias",
    icon: null, // Será definido no componente
    route: "/leitura-cocho",
    color: "bg-green-500",
  },
  {
    id: "controle-estoque",
    title: "Controle de Estoque",
    description: "Gestão de insumos e ingredientes",
    icon: null,
    route: "/estoque",
    color: "bg-purple-500",
  },
  {
    id: "painel-operacional",
    title: "Painel Operacional",
    description: "Dashboard geral do confinamento",
    icon: null,
    route: "/painel-operacional",
    color: "bg-orange-500",
  },
  {
    id: "analise-desvios",
    title: "Análise de Desvios",
    description: "Desvios de carregamento e trato",
    icon: null,
    route: "/desvios",
    color: "bg-red-500",
  },
  {
    id: "acompanhamento-tecnico",
    title: "Acompanhamento Técnico",
    description: "Controle de qualidade e dietas",
    icon: null,
    route: "/acompanhamento",
    color: "bg-blue-500",
  },
  {
    id: "controle-combustivel",
    title: "Controle de Combustível",
    description: "Gestão de combustível e custos",
    icon: null,
    route: "/combustivel",
    color: "bg-yellow-500",
  },
  {
    id: "gestao-usuarios",
    title: "Gestão de Usuários",
    description: "Cadastro e gerenciamento de usuários",
    icon: null,
    route: "/usuarios",
    color: "bg-indigo-500",
  },
  {
    id: "sincronizacao-mobile",
    title: "Sincronização Mobile",
    description: "Monitoramento de dispositivos móveis",
    icon: null,
    route: "/mobile",
    color: "bg-cyan-500",
  },
  {
    id: "dashboard-sistema",
    title: "Dashboard Sistema",
    description: "Monitoramento do sistema e métricas",
    icon: null,
    route: "/dashboard-sistema",
    color: "bg-gray-500",
  },
];

export const useDashboardLayout = () => {
  const [navigationCards, setNavigationCards] = useState<NavigationCard[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cardGroups, setCardGroups] = useState<CardGroup[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupCreationData, setGroupCreationData] = useState<{
    sourceCard: string;
    targetCard: string;
    startTime: number;
  } | null>(null);
  const { toast } = useToast();

  // Carregar layout salvo do localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboard-navigation-layout");
    const savedGroups = localStorage.getItem("dashboard-card-groups");

    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        // Merge com defaultNavigationCards para restaurar icons
        const restoredCards = parsedLayout
          .map((saved: SerializedNavigationCard) => {
            const defaultCard = defaultNavigationCards.find(
              (d) => d.id === saved.id
            );
            if (!defaultCard) {
              console.warn(`Card não encontrado: ${saved.id}`);
              return null;
            }
            return {
              ...defaultCard,
              ...saved,
              icon: defaultCard.icon,
            };
          })
          .filter(Boolean); // Remove cards null
        setNavigationCards(restoredCards);
      } catch (error) {
        console.error("Erro ao carregar layout salvo:", error);
        setNavigationCards(defaultNavigationCards);
      }
    } else {
      setNavigationCards(defaultNavigationCards);
    }

    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(savedGroups);
        setCardGroups(parsedGroups);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
        setCardGroups([]);
      }
    }
  }, []);

  // Função para salvar layout no localStorage
  const saveLayout = () => {
    try {
      // Filtrar apenas dados serializáveis (remover React components)
      const serializableCards = navigationCards.map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        route: card.route,
        color: card.color,
        groupId: card.groupId,
        // REMOVE: icon (React component)
      }));

      localStorage.setItem(
        "dashboard-navigation-layout",
        JSON.stringify(serializableCards)
      );
      localStorage.setItem("dashboard-card-groups", JSON.stringify(cardGroups));
      setHasUnsavedChanges(false);
      toast({
        title: "Layout Salvo!",
        description: "Sua configuração personalizada foi salva com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o layout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para resetar layout
  const resetLayout = () => {
    setNavigationCards(defaultNavigationCards);
    setCardGroups([]);
    localStorage.removeItem("dashboard-navigation-layout");
    localStorage.removeItem("dashboard-card-groups");
    setHasUnsavedChanges(false);
    toast({
      title: "Layout Resetado!",
      description: "A configuração foi restaurada para o padrão.",
      variant: "default",
    });
  };

  // Função para atualizar cards
  const updateCards = (newCards: NavigationCard[]) => {
    setNavigationCards(newCards);
    setHasUnsavedChanges(true);
  };

  // Função para iniciar criação de grupo
  const startGroupCreation = (sourceCardId: string, targetCardId: string) => {
    // Verificar se os cards são diferentes
    if (sourceCardId === targetCardId) {
      toast({
        title: "Erro",
        description: "Não é possível criar grupo com o mesmo card.",
        variant: "destructive",
      });
      return;
    }

    setGroupCreationData({
      sourceCard: sourceCardId,
      targetCard: targetCardId,
      startTime: Date.now(),
    });
  };

  // Função para cancelar criação de grupo
  const cancelGroupCreation = () => {
    setGroupCreationData(null);
  };

  // Função para criar grupo
  const createGroup = (groupName: string) => {
    if (!groupCreationData) return;

    const newGroup: CardGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      cards: [groupCreationData.sourceCard, groupCreationData.targetCard],
    };

    setCardGroups([...cardGroups, newGroup]);
    setGroupCreationData(null);
    setHasUnsavedChanges(true);

    toast({
      title: "Grupo Criado!",
      description: `Grupo "${groupName}" foi criado com sucesso.`,
      variant: "default",
    });
  };

  return {
    navigationCards,
    hasUnsavedChanges,
    cardGroups,
    isCreatingGroup,
    groupCreationData,
    saveLayout,
    resetLayout,
    updateCards,
    startGroupCreation,
    cancelGroupCreation,
    createGroup,
    defaultNavigationCards,
  };
};
