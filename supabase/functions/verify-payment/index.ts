import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseService.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) throw new Error("Usuário não autenticado");

    const { session_id } = await req.json();

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Chave do Stripe não configurada");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar a sessão de pagamento
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === "paid" && session.metadata) {
      // Criar o confinamento
      const { data: confinamento, error: confinamentoError } = await supabaseService
        .from("confinamentos")
        .insert({
          nome: session.metadata.nome_confinamento,
          master_user_id: user.id,
          ativo: true,
          data_assinatura: new Date().toISOString()
        })
        .select()
        .single();

      if (confinamentoError) {
        throw new Error(`Erro ao criar confinamento: ${confinamentoError.message}`);
      }

      // Criar a assinatura
      const { error: assinaturaError } = await supabaseService
        .from("assinaturas")
        .insert({
          user_id: user.id,
          confinamento_id: confinamento.id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: "active",
          plano: session.metadata.plano,
          valor_mensal: session.amount_total ? (session.amount_total / 100) : 0,
          data_inicio: new Date().toISOString(),
        });

      if (assinaturaError) {
        throw new Error(`Erro ao criar assinatura: ${assinaturaError.message}`);
      }

      // Associar usuário ao confinamento
      const { error: userConfinamentoError } = await supabaseService
        .from("user_confinamentos")
        .insert({
          user_id: user.id,
          confinamento_id: confinamento.id
        });

      if (userConfinamentoError) {
        throw new Error(`Erro ao associar usuário: ${userConfinamentoError.message}`);
      }

      // Definir role como master
      const { error: roleError } = await supabaseService
        .from("user_roles")
        .insert({
          user_id: user.id,
          confinamento_id: confinamento.id,
          role: "master"
        });

      if (roleError) {
        throw new Error(`Erro ao definir role: ${roleError.message}`);
      }

      console.log("Pagamento verificado e confinamento criado:", confinamento.id);

      return new Response(JSON.stringify({ 
        success: true, 
        confinamento_id: confinamento.id,
        nome_confinamento: confinamento.nome
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: "Pagamento ainda não processado" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});