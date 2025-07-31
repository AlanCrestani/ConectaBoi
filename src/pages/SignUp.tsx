import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, User, Mail, Phone, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados do usuário
    email: "",
    password: "",
    confirmPassword: "",
    nomeCompleto: "",
    telefone: "",

    // Dados do confinamento
    nomeConfinamento: "",
    razaoSocial: "",
    cnpj: "",
    endereco: "",
    telefoneConfinamento: "",
    emailConfinamento: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.nomeCompleto
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.nomeConfinamento || !formData.razaoSocial || !formData.cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios do confinamento.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep1() || !validateStep2()) return;

    setIsLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // 2. Criar perfil do usuário
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        nome_completo: formData.nomeCompleto,
        telefone: formData.telefone,
        funcao: "master",
      });

      if (profileError) throw profileError;

      // 3. Criar confinamento
      const { data: confinamentoData, error: confinamentoError } =
        await supabase
          .from("confinamentos")
          .insert({
            nome: formData.nomeConfinamento,
            razao_social: formData.razaoSocial,
            cnpj: formData.cnpj,
            endereco: formData.endereco,
            telefone: formData.telefoneConfinamento,
            email: formData.emailConfinamento,
            master_user_id: authData.user.id,
          })
          .select()
          .single();

      if (confinamentoError) throw confinamentoError;

      // 4. Criar assinatura (simulada por enquanto)
      const { error: assinaturaError } = await supabase
        .from("assinaturas")
        .insert({
          user_id: authData.user.id,
          confinamento_id: confinamentoData.id,
          status: "active",
          plano: "basic",
          valor_mensal: 99.9,
          data_inicio: new Date().toISOString(),
          data_fim: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 dias
        });

      if (assinaturaError) throw assinaturaError;

      // 5. Criar role do usuário
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        confinamento_id: confinamentoData.id,
        role: "master",
      });

      if (roleError) throw roleError;

      toast({
        title: "Conta criada com sucesso!",
        description: "Seu confinamento foi criado e você é o usuário master.",
      });

      // Redirecionar para o dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            {step === 1 && "Dados do usuário master"}
            {step === 2 && "Dados do confinamento"}
            {step === 3 && "Revisão e confirmação"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step > stepNumber ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Dados do usuário */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={(e) =>
                      handleInputChange("nomeCompleto", e.target.value)
                    }
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      handleInputChange("telefone", e.target.value)
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dados do confinamento */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeConfinamento">Nome do Confinamento *</Label>
                <Input
                  id="nomeConfinamento"
                  value={formData.nomeConfinamento}
                  onChange={(e) =>
                    handleInputChange("nomeConfinamento", e.target.value)
                  }
                  placeholder="Ex: Confinamento São João"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={(e) =>
                    handleInputChange("razaoSocial", e.target.value)
                  }
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) =>
                    handleInputChange("endereco", e.target.value)
                  }
                  placeholder="Endereço completo"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefoneConfinamento">Telefone</Label>
                  <Input
                    id="telefoneConfinamento"
                    value={formData.telefoneConfinamento}
                    onChange={(e) =>
                      handleInputChange("telefoneConfinamento", e.target.value)
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailConfinamento">Email</Label>
                  <Input
                    id="emailConfinamento"
                    type="email"
                    value={formData.emailConfinamento}
                    onChange={(e) =>
                      handleInputChange("emailConfinamento", e.target.value)
                    }
                    placeholder="confinamento@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Revisão */}
          {step === 3 && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Revise os dados antes de criar sua conta. Você será o usuário
                  master do confinamento.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados do Usuário
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nome:</strong> {formData.nomeCompleto}
                    </p>
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>Telefone:</strong>{" "}
                      {formData.telefone || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Dados do Confinamento
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nome:</strong> {formData.nomeConfinamento}
                    </p>
                    <p>
                      <strong>Razão Social:</strong> {formData.razaoSocial}
                    </p>
                    <p>
                      <strong>CNPJ:</strong> {formData.cnpj}
                    </p>
                    <p>
                      <strong>Endereço:</strong>{" "}
                      {formData.endereco || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={step === 1}
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              {step < 3 ? (
                <Button onClick={handleNextStep}>Próximo</Button>
              ) : (
                <Button onClick={handleSignUp} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/auth")}
              >
                Faça login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
