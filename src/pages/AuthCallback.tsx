import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const AuthCallbackPage = () => {
  const [status, setStatus] = useState("Processando autenticação...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("AuthCallbackPage: Iniciando processamento...");
        setStatus("Verificando autenticação...");

        // Aguardar um momento para o Supabase processar
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Processar callback
        const result = await authService.handleAuthCallback();

        if (result.success) {
          console.log("AuthCallbackPage: Sucesso!", result.user?.email);
          setStatus("Login realizado com sucesso! Redirecionando...");

          // Aguardar um momento antes de redirecionar
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          console.error("AuthCallbackPage: Erro:", result.error);
          setError(result.error);
          setStatus("Erro na autenticação");

          // Redirecionar para login após erro
          setTimeout(() => {
            navigate("/auth");
          }, 3000);
        }
      } catch (error) {
        console.error("AuthCallbackPage: Erro crítico:", error);
        setError(error.message);
        setStatus("Erro crítico na autenticação");

        // Redirecionar para login após erro
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          {!error ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Autenticação</h2>
              <p className="text-gray-600">{status}</p>
            </>
          ) : (
            <>
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">
                Erro na Autenticação
              </h2>
              <p className="text-gray-600 mb-2">{status}</p>
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecionando para login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
