import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import LeituraCocho from "./pages/LeituraCocho";
import ControleEstoque from "./pages/ControleEstoque";
import PainelOperacional from "./pages/PainelOperacional";
import AnaliseDesvios from "./pages/AnaliseDesvios";
import AcompanhamentoTecnico from "./pages/AcompanhamentoTecnico";
import Subscription from "./pages/Subscription";
import ETLManagement from "./pages/ETLManagement";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
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
              path="/etl"
              element={
                <ProtectedRoute>
                  <ETLManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
