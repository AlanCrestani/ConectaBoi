import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Mensagem {
  id: string;
  tipo: "ia" | "usuario";
  conteudo: string;
  timestamp: Date;
  analise?: {
    confianca: number;
    recomendacao: string;
    motivo: string;
  };
  feedback?: "positivo" | "negativo" | null;
}

interface ChatIAProps {
  dadosCocho: any;
  onFeedback: (mensagemId: string, feedback: "positivo" | "negativo") => void;
}

const ChatIA: React.FC<ChatIAProps> = ({ dadosCocho, onFeedback }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [analisandoIA, setAnalisandoIA] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Contador único para IDs de mensagem
  const messageCounterRef = useRef(0);

  // Simular análise inicial da IA
  useEffect(() => {
    if (dadosCocho) {
      setTimeout(() => {
        gerarAnaliseIA();
      }, 1000);
    }
  }, [dadosCocho]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  const gerarAnaliseIA = () => {
    setAnalisandoIA(true);

    // Simular tempo de processamento
    setTimeout(() => {
      const analise = {
        confianca: Math.floor(Math.random() * 30) + 70, // 70-100%
        recomendacao: Math.random() > 0.5 ? "aumentar" : "diminuir",
        motivo: "",
      };

      // Gerar motivo baseado na recomendação
      if (analise.recomendacao === "aumentar") {
        analise.motivo =
          "Observei que o cocho está muito limpo (nota 2-3) e o histórico dos últimos 4 dias mostra consumo abaixo do esperado. Recomendo aumentar em 0,3 kg/cab para otimizar o consumo.";
      } else {
        analise.motivo =
          "Detectei sobras significativas no cocho (nota -1) e o padrão de consumo indica que os animais estão satisfeitos. Sugiro reduzir em 0,2 kg/cab para evitar desperdícios.";
      }

      const novaMensagemIA: Mensagem = {
        id: `${Date.now()}-${++messageCounterRef.current}`,
        tipo: "ia",
        conteudo: `Baseando-me na análise dos dados do curral, ${analise.motivo}`,
        timestamp: new Date(),
        analise,
        feedback: null,
      };

      setMensagens((prev) => [...prev, novaMensagemIA]);
      setAnalisandoIA(false);
    }, 2000);
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;

    const mensagemUsuario: Mensagem = {
      id: `${Date.now()}-${++messageCounterRef.current}`,
      tipo: "usuario",
      conteudo: novaMensagem,
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, mensagemUsuario]);
    setNovaMensagem("");

    // Simular resposta da IA
    setTimeout(() => {
      const respostaIA: Mensagem = {
        id: `${Date.now()}-${++messageCounterRef.current}`,
        tipo: "ia",
        conteudo:
          "Entendo sua pergunta. Com base nos dados atuais, posso fornecer mais detalhes sobre a análise. O que especificamente gostaria de saber?",
        timestamp: new Date(),
      };
      setMensagens((prev) => [...prev, respostaIA]);
    }, 1000);
  };

  const handleFeedback = (
    mensagemId: string,
    feedback: "positivo" | "negativo"
  ) => {
    setMensagens((prev) =>
      prev.map((msg) => (msg.id === mensagemId ? { ...msg, feedback } : msg))
    );

    onFeedback(mensagemId, feedback);

    toast.success(
      feedback === "positivo"
        ? "Feedback positivo registrado!"
        : "Feedback negativo registrado!"
    );
  };

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 85) return "bg-green-100 text-green-800";
    if (confianca >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Assistente IA - Análise de Cocho
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 overflow-hidden">
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4">
            {analisandoIA && (
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Analisando dados...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex items-start gap-3 ${
                  mensagem.tipo === "usuario" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    mensagem.tipo === "ia" ? "bg-primary/10" : "bg-secondary/10"
                  }`}
                >
                  {mensagem.tipo === "ia" ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>

                <div
                  className={`flex-1 ${
                    mensagem.tipo === "usuario" ? "text-right" : ""
                  }`}
                >
                  <Card
                    className={
                      mensagem.tipo === "usuario"
                        ? "bg-primary/5"
                        : "bg-muted/50"
                    }
                  >
                    <CardContent className="p-3">
                      <p className="text-sm leading-relaxed">
                        {mensagem.conteudo}
                      </p>

                      {mensagem.analise && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getConfiancaColor(
                                mensagem.analise.confianca
                              )}
                            >
                              Confiança: {mensagem.analise.confianca}%
                            </Badge>
                            <Badge variant="secondary">
                              {mensagem.analise.recomendacao === "aumentar"
                                ? "↗️ Aumentar"
                                : "↘️ Diminuir"}
                            </Badge>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant={
                                mensagem.feedback === "positivo"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                handleFeedback(mensagem.id, "positivo")
                              }
                              className="flex items-center gap-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Concordo
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                mensagem.feedback === "negativo"
                                  ? "destructive"
                                  : "outline"
                              }
                              onClick={() =>
                                handleFeedback(mensagem.id, "negativo")
                              }
                              className="flex items-center gap-1"
                            >
                              <ThumbsDown className="h-3 w-3" />
                              Discordo
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">
                        {mensagem.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="mt-3 flex gap-2">
          <Textarea
            placeholder="Faça uma pergunta sobre a análise..."
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
              }
            }}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button onClick={enviarMensagem} size="sm" className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatIA;
