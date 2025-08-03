import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SyncDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Sincronização Mobile</h1>
                <p className="text-sm text-muted-foreground">
                  Monitoramento e gestão de dispositivos móveis
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">
              Status da Sincronização
            </h2>
            <p className="text-muted-foreground">
              Usuário: {user?.email || "Não identificado"}
            </p>
            <p className="text-muted-foreground">
              ID: {user?.id || "Não identificado"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SyncDashboard;
