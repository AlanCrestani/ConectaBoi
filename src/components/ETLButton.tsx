import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { etlService, ETLResult } from "../services/etlService";

const ETLButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buttonText, setButtonText] = useState("Executar ETL");

  const executeETL = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setProgress(0);
    setButtonText("Executando ETL...");

    try {
      console.log("🚀 Executando ETL via API Multi-Tenant...");

      // Simular progresso de 0% a 100%
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Executar ETL via nova API
      const result: ETLResult = await etlService.runETL();

      // Limpar intervalo de progresso
      clearInterval(progressInterval);

      console.log("📊 Resultado ETL:", result);

      if (result.success) {
        // Completar progresso para 100%
        setProgress(100);
        setButtonText("ETL Concluído!");

        toast({
          title: "ETL Executado com sucesso!",
          description: result.message || "Processamento ETL concluído.",
        });

        // Aguardar 3 segundos antes de voltar ao estado normal
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
          setButtonText("Executar ETL");
        }, 3000);
      } else {
        throw new Error(result.message || "Erro na execução do ETL");
      }
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      setButtonText("Executar ETL");

      toast({
        title: "Erro no ETL",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getButtonStyle = () => {
    if (!isProcessing) {
      return "bg-background hover:bg-accent";
    }

    if (progress === 100) {
      return "bg-green-500 hover:bg-green-500 text-white";
    }

    return `bg-gradient-to-r from-yellow-200 to-yellow-700`;
  };

  const getProgressStyle = () => {
    if (!isProcessing) return { width: "0%" };

    if (progress === 100) {
      return {
        width: "100%",
        background: "rgb(34, 197, 94)", // green-500
      };
    }

    return {
      width: `${progress}%`,
      background:
        "linear-gradient(to right, rgb(254, 240, 138), rgb(161, 98, 7))",
    };
  };

  return (
    <Button
      variant="outline"
      className={`h-16 flex flex-col space-y-2 relative overflow-hidden transition-all duration-300 ${
        isProcessing ? "pointer-events-none" : ""
      }`}
      style={
        !isProcessing
          ? {}
          : {
              background: progress === 100 ? "rgb(34, 197, 94)" : "transparent",
              color: progress === 100 ? "white" : "inherit",
            }
      }
      onClick={executeETL}
      disabled={isProcessing}
    >
      {/* Barra de progresso de fundo */}
      {isProcessing && (
        <div
          className="absolute inset-0 transition-all duration-200 ease-out"
          style={getProgressStyle()}
        />
      )}

      {/* Conteúdo do botão */}
      <div className="relative z-10 flex flex-col items-center space-y-2">
        <Play className={`h-5 w-5 ${isProcessing ? "animate-pulse" : ""}`} />
        <span className="text-sm font-medium">{buttonText}</span>
        {isProcessing && progress < 100 && (
          <span className="text-xs opacity-80">{progress}%</span>
        )}
      </div>
    </Button>
  );
};

export default ETLButton;
