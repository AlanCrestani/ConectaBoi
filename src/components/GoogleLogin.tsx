"use client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLogin() {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Erro no login:", error.message);
        // Aqui você pode adicionar um toast ou notificação de erro
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <FcGoogle className="w-5 h-5" />
      Entrar com Google
    </Button>
  );
}
