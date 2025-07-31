import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Play,
  Upload,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Code,
  Database,
} from "lucide-react";
import {
  etlService,
  ETLResult,
  TenantInfo,
  ETLStatus,
} from "../services/etlService";

const ETLManagement = () => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [etlStatus, setEtlStatus] = useState<ETLStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptContent, setScriptContent] = useState("");
  const [requirementsContent, setRequirementsContent] = useState("");
  const [lastETLResult, setLastETLResult] = useState<ETLResult | null>(null);

  useEffect(() => {
    loadTenantInfo();
    loadETLStatus();
  }, []);

  const loadTenantInfo = async () => {
    try {
      const info = await etlService.getTenantInfo();
      setTenantInfo(info);
    } catch (error) {
      console.error("Erro ao carregar informações do tenant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar informações do tenant",
        variant: "destructive",
      });
    }
  };

  const loadETLStatus = async () => {
    try {
      const status = await etlService.getETLStatus();
      setEtlStatus(status);
    } catch (error) {
      console.error("Erro ao carregar status ETL:", error);
    }
  };

  const handleRunETL = async () => {
    setIsLoading(true);
    try {
      const result = await etlService.runETL();
      setLastETLResult(result);

      if (result.success) {
        toast({
          title: "ETL Executado",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro no ETL",
          description: result.message,
          variant: "destructive",
        });
      }

      // Recarregar status
      await loadETLStatus();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar ETL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadScript = async () => {
    if (!scriptContent.trim()) {
      toast({
        title: "Erro",
        description: "Conteúdo do script é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await etlService.uploadScript({
        script: scriptContent,
        requirements: requirementsContent || undefined,
      });

      if (result.success) {
        toast({
          title: "Script Salvo",
          description: result.message,
        });
        setScriptContent("");
        setRequirementsContent("");
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do script",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "master":
        return "bg-purple-500";
      case "gerencial":
        return "bg-blue-500";
      case "supervisor":
        return "bg-green-500";
      case "operacional":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento ETL</h1>
          <p className="text-muted-foreground">
            Sistema Multi-Tenant para Processamento de Dados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {tenantInfo && (
            <>
              <Badge variant="outline">{tenantInfo.tenant_id}</Badge>
              <Badge className={getRoleBadgeColor(tenantInfo.user_role)}>
                {tenantInfo.user_role}
              </Badge>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="execute">Executar ETL</TabsTrigger>
          <TabsTrigger value="upload">Upload Script</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tenant</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenantInfo?.tenant_id || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  ID do Confinamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {tenantInfo?.user_role || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Nível de Acesso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Execuções</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {etlStatus?.logs?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de Execuções
                </p>
              </CardContent>
            </Card>
          </div>

          {lastETLResult && (
            <Card>
              <CardHeader>
                <CardTitle>Última Execução</CardTitle>
                <CardDescription>
                  Resultado da última execução do ETL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {lastETLResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {lastETLResult.success ? "Sucesso" : "Erro"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lastETLResult.message}
                  </p>
                  {lastETLResult.data && (
                    <pre className="text-xs bg-muted p-2 rounded">
                      {JSON.stringify(lastETLResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executar ETL</CardTitle>
              <CardDescription>
                Execute o ETL personalizado para este confinamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Tenant ID</Label>
                  <Input
                    value={tenantInfo?.tenant_id || ""}
                    disabled
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleRunETL}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Executar ETL
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Script</CardTitle>
              <CardDescription>
                Faça upload de um script ETL personalizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="script">Script Python</Label>
                  <Textarea
                    id="script"
                    placeholder="Cole aqui o código Python do seu ETL..."
                    value={scriptContent}
                    onChange={(e) => setScriptContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements (opcional)</Label>
                  <Textarea
                    id="requirements"
                    placeholder="pandas>=2.0.0&#10;numpy>=1.24.0&#10;requests>=2.31.0"
                    value={requirementsContent}
                    onChange={(e) => setRequirementsContent(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleUploadScript}
                  disabled={isLoading || !scriptContent.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Salvar Script
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status das Execuções</CardTitle>
              <CardDescription>
                Histórico das últimas execuções do ETL
              </CardDescription>
            </CardHeader>
            <CardContent>
              {etlStatus?.logs && etlStatus.logs.length > 0 ? (
                <div className="space-y-4">
                  {etlStatus.logs.map((log, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">
                            {log.success ? "Sucesso" : "Erro"}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {log.output && (
                        <div className="text-sm bg-muted p-2 rounded">
                          <strong>Output:</strong>
                          <pre className="whitespace-pre-wrap">
                            {log.output}
                          </pre>
                        </div>
                      )}

                      {log.error && (
                        <div className="text-sm bg-red-50 p-2 rounded text-red-700">
                          <strong>Erro:</strong>
                          <pre className="whitespace-pre-wrap">{log.error}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma execução encontrada</p>
                  <p className="text-sm">Execute um ETL para ver o histórico</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ETLManagement;
