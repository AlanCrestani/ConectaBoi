import { supabase } from "../integrations/supabase/client";

class AuthService {
  private _isLoggedIn = false;
  private _currentUser: any = null;

  // Inicializar estado de autenticação
  async initialize() {
    try {
      // Verificar sessão existente
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session && !error) {
        this._isLoggedIn = true;
        this._currentUser = session.user;
        console.log("Sessão existente encontrada:", session.user.email);
      }

      // Listener para mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);

        if (event === "SIGNED_IN" && session) {
          this._isLoggedIn = true;
          this._currentUser = session.user;
          console.log("Usuário logado:", session.user.email);
        } else if (event === "SIGNED_OUT") {
          this._isLoggedIn = false;
          this._currentUser = null;
          console.log("Usuário deslogado");
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar auth:", error);
    }
  }

  async signInWithGoogle() {
    try {
      console.log("Iniciando login com Google...");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Erro no login Google:", error);
        throw error;
      }

      console.log("Redirecionamento OAuth iniciado");
      return { success: true };
    } catch (error) {
      console.error("Erro no signInWithGoogle:", error);
      return { success: false, error: error.message };
    }
  }

  async handleAuthCallback() {
    try {
      console.log("Processando callback OAuth...");

      // Supabase automaticamente detecta e processa o callback
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro no callback:", error);
        throw error;
      }

      if (session) {
        console.log("Callback processado com sucesso:", session.user.email);
        this._isLoggedIn = true;
        this._currentUser = session.user;
        return { success: true, user: session.user };
      } else {
        throw new Error("Nenhuma sessão encontrada após callback");
      }
    } catch (error) {
      console.error("Erro no handleAuthCallback:", error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this._isLoggedIn = false;
      this._currentUser = null;

      return { success: true };
    } catch (error) {
      console.error("Erro no logout:", error);
      return { success: false, error: error.message };
    }
  }

  get isLoggedIn() {
    return this._isLoggedIn;
  }

  get currentUser() {
    return this._currentUser;
  }
}

export const authService = new AuthService();

// Inicializar automaticamente
authService.initialize();
