export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          confinamento_id: string;
          created_at: string;
          feedback_text: string | null;
          id: string;
          recommendation_data: Json | null;
          recommendation_type: string;
          user_agreed: boolean | null;
          user_id: string;
        };
        Insert: {
          confinamento_id: string;
          created_at?: string;
          feedback_text?: string | null;
          id?: string;
          recommendation_data?: Json | null;
          recommendation_type: string;
          user_agreed?: boolean | null;
          user_id: string;
        };
        Update: {
          confinamento_id?: string;
          created_at?: string;
          feedback_text?: string | null;
          id?: string;
          recommendation_data?: Json | null;
          recommendation_type?: string;
          user_agreed?: boolean | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_feedback_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
      assinaturas: {
        Row: {
          confinamento_id: string;
          created_at: string;
          data_fim: string | null;
          data_inicio: string | null;
          id: string;
          plano: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
          valor_mensal: number | null;
        };
        Insert: {
          confinamento_id: string;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string | null;
          id?: string;
          plano?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
          valor_mensal?: number | null;
        };
        Update: {
          confinamento_id?: string;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string | null;
          id?: string;
          plano?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
          valor_mensal?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "assinaturas_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: true;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
      confinamentos: {
        Row: {
          ativo: boolean;
          cnpj: string | null;
          created_at: string;
          data_assinatura: string | null;
          email: string | null;
          endereco: string | null;
          id: string;
          master_user_id: string | null;
          nome: string;
          razao_social: string | null;
          telefone: string | null;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          cnpj?: string | null;
          created_at?: string;
          data_assinatura?: string | null;
          email?: string | null;
          endereco?: string | null;
          id?: string;
          master_user_id?: string | null;
          nome: string;
          razao_social?: string | null;
          telefone?: string | null;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          cnpj?: string | null;
          created_at?: string;
          data_assinatura?: string | null;
          email?: string | null;
          endereco?: string | null;
          id?: string;
          master_user_id?: string | null;
          nome?: string;
          razao_social?: string | null;
          telefone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      dim_curral: {
        Row: {
          area_cocho_m: number | null;
          area_m2: number | null;
          confinamento_id: string;
          created_at: string | null;
          curral: string | null;
          id_curral: string;
          setor: string | null;
        };
        Insert: {
          area_cocho_m?: number | null;
          area_m2?: number | null;
          confinamento_id: string;
          created_at?: string | null;
          curral?: string | null;
          id_curral: string;
          setor?: string | null;
        };
        Update: {
          area_cocho_m?: number | null;
          area_m2?: number | null;
          confinamento_id?: string;
          created_at?: string | null;
          curral?: string | null;
          id_curral?: string;
          setor?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "dim_curral_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
      fato_carregamento: {
        Row: {
          carregamento: string | null;
          categoria_desvio: string | null;
          confinamento_id: string;
          created_at: string | null;
          data: string;
          desvio_abs_pc: number | null;
          desvio_kg: number | null;
          desvio_pc: number | null;
          dieta: string | null;
          hora_carregamento: string | null;
          id_carregamento: string | null;
          id_curral: string | null;
          ingrediente: string | null;
          pazeiro: string | null;
          previsto_kg: number | null;
          realizado_kg: number | null;
          status: string | null;
          tipo_dieta: string | null;
          tipo_ingrediente: string | null;
          unique_key: string | null;
          vagao: string | null;
        };
        Insert: {
          carregamento?: string | null;
          categoria_desvio?: string | null;
          confinamento_id: string;
          created_at?: string | null;
          data: string;
          desvio_abs_pc?: number | null;
          desvio_kg?: number | null;
          desvio_pc?: number | null;
          dieta?: string | null;
          hora_carregamento?: string | null;
          id_carregamento?: string | null;
          id_curral?: string | null;
          ingrediente?: string | null;
          pazeiro?: string | null;
          previsto_kg?: number | null;
          realizado_kg?: number | null;
          status?: string | null;
          tipo_dieta?: string | null;
          tipo_ingrediente?: string | null;
          unique_key?: string | null;
          vagao?: string | null;
        };
        Update: {
          carregamento?: string | null;
          categoria_desvio?: string | null;
          confinamento_id?: string;
          created_at?: string | null;
          data?: string;
          desvio_abs_pc?: number | null;
          desvio_kg?: number | null;
          desvio_pc?: number | null;
          dieta?: string | null;
          hora_carregamento?: string | null;
          id_carregamento?: string | null;
          id_curral?: string | null;
          ingrediente?: string | null;
          pazeiro?: string | null;
          previsto_kg?: number | null;
          realizado_kg?: number | null;
          status?: string | null;
          tipo_dieta?: string | null;
          tipo_ingrediente?: string | null;
          unique_key?: string | null;
          vagao?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fato_carregamento_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fato_carregamento_id_curral_fkey";
            columns: ["id_curral"];
            isOneToOne: false;
            referencedRelation: "dim_curral";
            referencedColumns: ["id_curral"];
          }
        ];
      };
      fato_resumo: {
        Row: {
          ajuste_kg: number | null;
          area_cocho_m: number | null;
          area_m2: number | null;
          cmn_previsto_kg: number | null;
          cmn_realizado_kg: number | null;
          cms_previsto_kg: number | null;
          cms_real_pc_pv: number | null;
          cms_realizado_kg: number | null;
          cocho_cab_m: number | null;
          confinamento_id: string;
          created_at: string | null;
          curral: string | null;
          data: string;
          data_entrada: string | null;
          dias_confinamento: number | null;
          eficiencia_cms: number | null;
          gmd_padrao: number | null;
          grupo_genetico: string | null;
          id_curral: string;
          leitura_cocho: string | null;
          leitura_noturna: string | null;
          lote: string | null;
          m2_cab: number | null;
          ms_dieta_meta_pc: number | null;
          ms_dieta_real_pc: number | null;
          peso_entrada_kg: number | null;
          peso_estimado_corrigido: number | null;
          peso_medio_estimado_kg: number | null;
          qtd_animais: number | null;
          setor: string | null;
          sexo: string | null;
          status_lote: string | null;
          unique_key: string | null;
        };
        Insert: {
          ajuste_kg?: number | null;
          area_cocho_m?: number | null;
          area_m2?: number | null;
          cmn_previsto_kg?: number | null;
          cmn_realizado_kg?: number | null;
          cms_previsto_kg?: number | null;
          cms_real_pc_pv?: number | null;
          cms_realizado_kg?: number | null;
          cocho_cab_m?: number | null;
          confinamento_id: string;
          created_at?: string | null;
          curral?: string | null;
          data: string;
          data_entrada?: string | null;
          dias_confinamento?: number | null;
          eficiencia_cms?: number | null;
          gmd_padrao?: number | null;
          grupo_genetico?: string | null;
          id_curral: string;
          leitura_cocho?: string | null;
          leitura_noturna?: string | null;
          lote?: string | null;
          m2_cab?: number | null;
          ms_dieta_meta_pc?: number | null;
          ms_dieta_real_pc?: number | null;
          peso_entrada_kg?: number | null;
          peso_estimado_corrigido?: number | null;
          peso_medio_estimado_kg?: number | null;
          qtd_animais?: number | null;
          setor?: string | null;
          sexo?: string | null;
          status_lote?: string | null;
          unique_key?: string | null;
        };
        Update: {
          ajuste_kg?: number | null;
          area_cocho_m?: number | null;
          area_m2?: number | null;
          cmn_previsto_kg?: number | null;
          cmn_realizado_kg?: number | null;
          cms_previsto_kg?: number | null;
          cms_real_pc_pv?: number | null;
          cms_realizado_kg?: number | null;
          cocho_cab_m?: number | null;
          confinamento_id?: string;
          created_at?: string | null;
          curral?: string | null;
          data?: string;
          data_entrada?: string | null;
          dias_confinamento?: number | null;
          eficiencia_cms?: number | null;
          gmd_padrao?: number | null;
          grupo_genetico?: string | null;
          id_curral?: string;
          leitura_cocho?: string | null;
          leitura_noturna?: string | null;
          lote?: string | null;
          m2_cab?: number | null;
          ms_dieta_meta_pc?: number | null;
          ms_dieta_real_pc?: number | null;
          peso_entrada_kg?: number | null;
          peso_estimado_corrigido?: number | null;
          peso_medio_estimado_kg?: number | null;
          qtd_animais?: number | null;
          setor?: string | null;
          sexo?: string | null;
          status_lote?: string | null;
          unique_key?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fato_resumo_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fato_resumo_id_curral_fkey";
            columns: ["id_curral"];
            isOneToOne: false;
            referencedRelation: "dim_curral";
            referencedColumns: ["id_curral"];
          }
        ];
      };
      fato_trato: {
        Row: {
          categoria_eficiencia: string | null;
          confinamento_id: string;
          created_at: string | null;
          data: string;
          desvio_abs_kg: number | null;
          desvio_kg: number | null;
          desvio_pc: number | null;
          dieta: string | null;
          eficiencia_trato: number | null;
          hora_trato: string | null;
          id_carregamento: string | null;
          id_curral: string;
          lote: string | null;
          previsto_kg: number | null;
          realizado_kg: number | null;
          status: string | null;
          tipo_dieta: string | null;
          tratador: string | null;
          trato: string | null;
          turno: string | null;
          unique_key: string | null;
          vagao: string | null;
        };
        Insert: {
          categoria_eficiencia?: string | null;
          confinamento_id: string;
          created_at?: string | null;
          data: string;
          desvio_abs_kg?: number | null;
          desvio_kg?: number | null;
          desvio_pc?: number | null;
          dieta?: string | null;
          eficiencia_trato?: number | null;
          hora_trato?: string | null;
          id_carregamento?: string | null;
          id_curral: string;
          lote?: string | null;
          previsto_kg?: number | null;
          realizado_kg?: number | null;
          status?: string | null;
          tipo_dieta?: string | null;
          tratador?: string | null;
          trato?: string | null;
          turno?: string | null;
          unique_key?: string | null;
          vagao?: string | null;
        };
        Update: {
          categoria_eficiencia?: string | null;
          confinamento_id?: string;
          created_at?: string | null;
          data?: string;
          desvio_abs_kg?: number | null;
          desvio_kg?: number | null;
          desvio_pc?: number | null;
          dieta?: string | null;
          eficiencia_trato?: number | null;
          hora_trato?: string | null;
          id_carregamento?: string | null;
          id_curral?: string;
          lote?: string | null;
          previsto_kg?: number | null;
          realizado_kg?: number | null;
          status?: string | null;
          tipo_dieta?: string | null;
          tratador?: string | null;
          trato?: string | null;
          turno?: string | null;
          unique_key?: string | null;
          vagao?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fato_trato_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fato_trato_id_curral_fkey";
            columns: ["id_curral"];
            isOneToOne: false;
            referencedRelation: "dim_curral";
            referencedColumns: ["id_curral"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          funcao: string | null;
          id: string;
          nome_completo: string | null;
          telefone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          funcao?: string | null;
          id?: string;
          nome_completo?: string | null;
          telefone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          funcao?: string | null;
          id?: string;
          nome_completo?: string | null;
          telefone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_confinamentos: {
        Row: {
          confinamento_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          confinamento_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          confinamento_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_confinamentos_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
      user_invites: {
        Row: {
          confinamento_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: Database["public"]["Enums"]["user_role"];
          status: string;
          token: string;
        };
        Insert: {
          confinamento_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          role?: Database["public"]["Enums"]["user_role"];
          status?: string;
          token: string;
        };
        Update: {
          confinamento_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: Database["public"]["Enums"]["user_role"];
          status?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_invites_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          confinamento_id: string;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          user_id: string;
        };
        Insert: {
          confinamento_id: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          user_id: string;
        };
        Update: {
          confinamento_id?: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
      combustivel_lancamentos: {
        Row: {
          id: string;
          confinamento_id: string;
          data: string;
          tipo_combustivel: string;
          quantidade_litros: number;
          preco_unitario: number;
          valor_total: number;
          equipamento: string;
          operador: string;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          mobile_synced_at: string | null;
          mobile_created_at: string | null;
        };
        Insert: {
          id?: string;
          confinamento_id: string;
          data: string;
          tipo_combustivel: string;
          quantidade_litros: number;
          preco_unitario: number;
          valor_total: number;
          equipamento: string;
          operador: string;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          mobile_synced_at?: string | null;
          mobile_created_at?: string | null;
        };
        Update: {
          id?: string;
          confinamento_id?: string;
          data?: string;
          tipo_combustivel?: string;
          quantidade_litros?: number;
          preco_unitario?: number;
          valor_total?: number;
          equipamento?: string;
          operador?: string;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          mobile_synced_at?: string | null;
          mobile_created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "combustivel_lancamentos_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "combustivel_lancamentos_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      combustivel_alertas: {
        Row: {
          id: string;
          confinamento_id: string;
          user_id: string;
          tipo_alerta: string;
          valor_limite: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          confinamento_id: string;
          user_id: string;
          tipo_alerta: string;
          valor_limite: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          confinamento_id?: string;
          user_id?: string;
          tipo_alerta?: string;
          valor_limite?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "combustivel_alertas_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "combustivel_alertas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      combustivel_equipamentos: {
        Row: {
          id: string;
          confinamento_id: string;
          nome: string;
          tipo: string;
          modelo: string | null;
          ano_fabricacao: number | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          confinamento_id: string;
          nome: string;
          tipo: string;
          modelo?: string | null;
          ano_fabricacao?: number | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          confinamento_id?: string;
          nome?: string;
          tipo?: string;
          modelo?: string | null;
          ano_fabricacao?: number | null;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "combustivel_equipamentos_confinamento_id_fkey";
            columns: ["confinamento_id"];
            isOneToOne: false;
            referencedRelation: "confinamentos";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calcular_eficiencia_pazeiro: {
        Args: { data_inicio: string; data_fim: string };
        Returns: {
          pazeiro: string;
          total_carregamentos: number;
          tempo_medio_carregamento: number;
          eficiencia_rank: number;
        }[];
      };
      detectar_problemas_operacionais: {
        Args: { data_analise: string };
        Returns: {
          tipo_problema: string;
          descricao: string;
          id_carregamento: string;
          hora_problema: string;
          severidade: string;
        }[];
      };
      get_tipo_dieta: {
        Args: { dieta_input: string };
        Returns: string;
      };
      get_user_confinamentos: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      is_master_of_confinamento: {
        Args: { confinamento_id: string };
        Returns: boolean;
      };
      populate_dim_date: {
        Args: { start_date: string; end_date: string };
        Returns: undefined;
      };
      user_has_access_to_confinamento: {
        Args: { confinamento_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "master" | "gerencial" | "supervisor" | "operacional";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      user_role: ["master", "gerencial", "supervisor", "operacional"],
    },
  },
} as const;
