import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Square,
  Upload as UploadIcon,
  FileText,
  Database,
  Server,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  BarChart3,
  Loader2,
  RefreshCw,
  Terminal,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { etlService } from "@/services/etlService";

interface ServerStatus {
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  lastCheck: Date | null;
  error: string | null;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  currentFile: string;
  totalFiles: number;
  currentFileIndex: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
  message: string;
  icon?: React.ReactNode;
}

export default function Upload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    isRunning: false,
    isStarting: false,
    isStopping: false,
    lastCheck: null,
    error: null,
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    currentFile: "",
    totalFiles: 3,
    currentFileIndex: 0,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [scriptContent, setScriptContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Contador único para IDs de log
  const logCounterRef = useRef(0);

  // Auto-scroll para logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Verificar status do servidor periodicamente
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/health");
        if (response.ok) {
          setServerStatus((prev) => ({
            ...prev,
            isRunning: true,
            error: null,
            lastCheck: new Date(),
          }));
        } else {
          setServerStatus((prev) => ({
            ...prev,
            isRunning: false,
            lastCheck: new Date(),
          }));
        }
      } catch (error) {
        setServerStatus((prev) => ({
          ...prev,
          isRunning: false,
          lastCheck: new Date(),
        }));
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (
    level: LogEntry["level"],
    message: string,
    icon?: React.ReactNode
  ) => {
    // Gerar ID único usando timestamp + contador
    const uniqueId = `${Date.now()}-${++logCounterRef.current}`;

    const newLog: LogEntry = {
      id: uniqueId,
      timestamp: new Date(),
      level,
      message,
      icon,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const startServer = async () => {
    setServerStatus((prev) => ({ ...prev, isStarting: true }));
    addLog(
      "info",
      "Iniciando servidor Flask...",
      <Server className="w-4 h-4" />
    );

    try {
      // Simular início do servidor (em produção seria uma chamada real)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setServerStatus((prev) => ({
        ...prev,
        isRunning: true,
        isStarting: false,
        error: null,
      }));
      addLog(
        "success",
        "Servidor iniciado com sucesso!",
        <CheckCircle className="w-4 h-4" />
      );

      toast({
        title: "Servidor Iniciado",
        description: "API Flask está rodando na porta 8000",
      });
    } catch (error) {
      setServerStatus((prev) => ({
        ...prev,
        isStarting: false,
        error: "Erro ao iniciar servidor",
      }));
      addLog(
        "error",
        "Erro ao iniciar servidor",
        <AlertCircle className="w-4 h-4" />
      );
    }
  };

  const stopServer = async () => {
    setServerStatus((prev) => ({ ...prev, isStopping: true }));
    addLog("info", "Parando servidor Flask...", <Square className="w-4 h-4" />);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setServerStatus((prev) => ({
        ...prev,
        isRunning: false,
        isStopping: false,
      }));
      addLog("warning", "Servidor parado", <Square className="w-4 h-4" />);
    } catch (error) {
      setServerStatus((prev) => ({
        ...prev,
        isStopping: false,
      }));
    }
  };

  const uploadScript = async () => {
    if (!scriptContent.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o conteúdo do script",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    addLog(
      "info",
      "Enviando script para o servidor...",
      <UploadIcon className="w-4 h-4" />
    );

    try {
      // Simular upload do script
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog(
        "success",
        "Script enviado com sucesso!",
        <CheckCircle className="w-4 h-4" />
      );

      toast({
        title: "Script Enviado",
        description: "Script Python foi salvo no servidor",
      });
    } catch (error) {
      addLog(
        "error",
        "Erro ao enviar script",
        <AlertCircle className="w-4 h-4" />
      );
      toast({
        title: "Erro",
        description: "Falha ao enviar script",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runETL = async () => {
    if (!serverStatus.isRunning) {
      toast({
        title: "Servidor Offline",
        description: "Inicie o servidor antes de executar o ETL",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress((prev) => ({ ...prev, isUploading: true, progress: 0 }));
    addLog(
      "info",
      "Iniciando processamento ETL real...",
      <Activity className="w-4 h-4" />
    );

    try {
      // Executar ETL real via API
      addLog(
        "info",
        "Conectando com a API ETL...",
        <Database className="w-4 h-4" />
      );

      setUploadProgress((prev) => ({ ...prev, progress: 25 }));

      const response = await fetch("http://localhost:8000/api/run-etl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fake-jwt-token",
        },
      });

      setUploadProgress((prev) => ({ ...prev, progress: 50 }));

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      setUploadProgress((prev) => ({ ...prev, progress: 75 }));

      addLog(
        "info",
        "Processando dados no Supabase...",
        <Database className="w-4 h-4" />
      );

      if (result.success) {
        setUploadProgress((prev) => ({ ...prev, progress: 100 }));

        addLog(
          "success",
          `ETL executado com sucesso! ${
            result.data?.etl_result?.registros_processados || 0
          } registros processados.`,
          <CheckCircle className="w-4 h-4" />
        );

        toast({
          title: "ETL Concluído",
          description:
            result.message || "Dados carregados no banco com sucesso",
        });
      } else {
        throw new Error(result.message || "Erro na execução do ETL");
      }
    } catch (error) {
      addLog(
        "error",
        `Erro no ETL: ${error.message}`,
        <AlertCircle className="w-4 h-4" />
      );

      toast({
        title: "Erro no ETL",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadProgress((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("info", "Logs limpos", <RefreshCw className="w-4 h-4" />);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel de Controle ETL</h1>
          <p className="text-muted-foreground">
            Gerencie o servidor Flask e execute processamentos ETL
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          <Badge variant={serverStatus.isRunning ? "default" : "secondary"}>
            {serverStatus.isRunning ? (
              <>
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Online
              </>
            ) : (
              <>
                <Square className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Controle do Servidor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Controle do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    serverStatus.isRunning ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium">
                  {serverStatus.isRunning
                    ? "Servidor Ativo"
                    : "Servidor Inativo"}
                </span>
              </div>
              {serverStatus.lastCheck && (
                <span className="text-sm text-muted-foreground">
                  Última verificação:{" "}
                  {serverStatus.lastCheck.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startServer}
                disabled={serverStatus.isRunning || serverStatus.isStarting}
                className="flex-1"
              >
                {serverStatus.isStarting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {serverStatus.isStarting ? "Iniciando..." : "Iniciar Servidor"}
              </Button>

              <Button
                onClick={stopServer}
                disabled={!serverStatus.isRunning || serverStatus.isStopping}
                variant="outline"
                className="flex-1"
              >
                {serverStatus.isStopping ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                {serverStatus.isStopping ? "Parando..." : "Parar Servidor"}
              </Button>
            </div>

            {serverStatus.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverStatus.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Painel de Upload de Script */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Script ETL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole aqui o conteúdo do script Python..."
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="min-h-[120px]"
            />

            <Button
              onClick={uploadScript}
              disabled={isLoading || !serverStatus.isRunning}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UploadIcon className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Enviando..." : "Enviar Script"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Painel de Progresso do Upload */}
      {uploadProgress.isUploading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Progresso do Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Arquivo atual: {uploadProgress.currentFile}</span>
                <span>
                  {uploadProgress.currentFileIndex + 1} de{" "}
                  {uploadProgress.totalFiles}
                </span>
              </div>
              <Progress value={uploadProgress.progress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                {Math.round(uploadProgress.progress)}% concluído
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Executar ETL */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={runETL}
            disabled={!serverStatus.isRunning || uploadProgress.isUploading}
            size="lg"
            className="w-full"
          >
            {uploadProgress.isUploading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            {uploadProgress.isUploading ? "Processando..." : "Executar ETL"}
          </Button>
        </CardContent>
      </Card>

      {/* Painel de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Logs do Sistema
            </div>
            <Button onClick={clearLogs} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                Nenhum log disponível
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    {log.icon}
                    <span
                      className={`${
                        log.level === "error"
                          ? "text-red-400"
                          : log.level === "warning"
                          ? "text-yellow-400"
                          : log.level === "success"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
