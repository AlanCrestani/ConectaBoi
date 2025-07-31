// Serviço para integração com a API ETL Multi-Tenant
// ConectaBoi Insight

const API_BASE_URL = "http://localhost:8000/api";

export interface ETLResult {
  success: boolean;
  message: string;
  data?: any;
  tenant_id?: string;
  executed_by?: string;
}

export interface TenantInfo {
  tenant_id: string;
  config: any;
  user_role: string;
  user_id: string;
}

export interface ETLStatus {
  tenant_id: string;
  logs: any[];
}

export interface ScriptUpload {
  script: string;
  requirements?: string;
}

class ETLService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("supabase.auth.token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || "fake-jwt-token"}`,
    };
  }

  // Health check da API
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error("Erro no health check:", error);
      throw error;
    }
  }

  // Obter informações do tenant atual
  async getTenantInfo(): Promise<TenantInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/tenant-info`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao obter informações do tenant:", error);
      throw error;
    }
  }

  // Executar ETL
  async runETL(): Promise<ETLResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/run-etl`, {
        method: "POST",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao executar ETL:", error);
      throw error;
    }
  }

  // Upload de script personalizado
  async uploadScript(scriptData: ScriptUpload): Promise<ETLResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload-script`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(scriptData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao fazer upload do script:", error);
      throw error;
    }
  }

  // Obter status das execuções ETL
  async getETLStatus(): Promise<ETLStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/etl-status`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao obter status ETL:", error);
      throw error;
    }
  }

  // Criar novo tenant
  async createTenant(tenantId: string, config?: any): Promise<ETLResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/create-tenant`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          tenant_id: tenantId,
          config: config || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar tenant:", error);
      throw error;
    }
  }

  // Login (simulado)
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }
}

export const etlService = new ETLService();
