import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authService } from "./services/authService";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import DashboardSistema from "./pages/DashboardSistema";

import LeituraCocho from "./pages/LeituraCocho";
import ControleEstoque from "./pages/ControleEstoque";
import PainelOperacional from "./pages/PainelOperacional";
import AnaliseDesvios from "./pages/AnaliseDesvios";
import AcompanhamentoTecnico from "./pages/AcompanhamentoTecnico";
import Subscription from "./pages/Subscription";

import UserManagement from "./pages/UserManagement";
import UserProfile from "./pages/UserProfile";
import ControleCombustivel from "./pages/ControleCombustivel";
import SyncDashboard from "./pages/SyncDashboard";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.initialize();
        setIsInitialized(true);
        console.log("App: AuthService inicializado");
      } catch (error) {
        console.error("App: Erro ao inicializar auth:", error);
        setIsInitialized(true); // Continuar mesmo com erro
      }
    };

    initializeAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-sistema"
                element={
                  <ProtectedRoute>
                    <DashboardSistema />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leitura-cocho"
                element={
                  <ProtectedRoute>
                    <LeituraCocho />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/controle-estoque"
                element={
                  <ProtectedRoute>
                    <ControleEstoque />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operacional"
                element={
                  <ProtectedRoute>
                    <PainelOperacional />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/desvios"
                element={
                  <ProtectedRoute>
                    <AnaliseDesvios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tecnico"
                element={
                  <ProtectedRoute>
                    <AcompanhamentoTecnico />
                  </ProtectedRoute>
                }
              />
              <Route path="/subscription" element={<Subscription />} />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/combustivel"
                element={
                  <ProtectedRoute>
                    <ControleCombustivel />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sync"
                element={
                  <ProtectedRoute>
                    <SyncDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/test" element={<TestPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
