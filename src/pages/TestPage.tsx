import React from "react";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Teste de Funcionamento
        </h1>
        <p className="text-lg text-muted-foreground">
          Se você está vendo esta página, a aplicação está funcionando!
        </p>
        <div className="mt-8 p-4 bg-card rounded-lg">
          <p className="text-sm text-muted-foreground">
            Timestamp: {new Date().toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 