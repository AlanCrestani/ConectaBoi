import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UserPlus,
  Users,
  Mail,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  nome_completo: string;
  email: string;
  funcao: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  confinamento_id: string;
  role: string;
  user: {
    email: string;
    profiles: {
      nome_completo: string;
    };
  };
}

interface UserInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  invited_by: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [confinamentoId, setConfinamentoId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "operacional",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }
      setCurrentUser(user);

      // Obter confinamento do usuário
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("confinamento_id")
        .eq("user_id", user.id)
        .single();

      if (userRoles) {
        setConfinamentoId(userRoles.confinamento_id);
        await loadUsersAndRoles(userRoles.confinamento_id);
        await loadInvites(userRoles.confinamento_id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersAndRoles = async (confId: string) => {
    try {
      // Carregar roles dos usuários
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select(
          `
          id,
          user_id,
          confinamento_id,
          role,
          user:user_id (
            email,
            profiles (
              nome_completo
            )
          )
        `
        )
        .eq("confinamento_id", confId);

      if (rolesError) throw rolesError;
      setUserRoles(roles || []);

      // Carregar perfis dos usuários
      const userIds = roles?.map((r) => r.user_id) || [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;
        setUsers(profiles || []);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const loadInvites = async (confId: string) => {
    try {
      const { data: invitesData, error: invitesError } = await supabase
        .from("user_invites")
        .select("*")
        .eq("confinamento_id", confId)
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;
      setInvites(invitesData || []);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e selecione o nível de acesso",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      // Gerar token único
      const token =
        Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { error: inviteError } = await supabase
        .from("user_invites")
        .insert({
          confinamento_id: confinamentoId,
          invited_by: currentUser.id,
          email: inviteForm.email,
          role: inviteForm.role,
          token: token,
          status: "pending",
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${inviteForm.email}`,
      });

      // Limpar formulário
      setInviteForm({ email: "", role: "operacional" });

      // Recarregar convites
      await loadInvites(confinamentoId!);
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("user_invites")
        .delete()
        .eq("id", inviteId);

      if (error) throw error;

      toast({
        title: "Convite removido",
        description: "Convite foi removido com sucesso",
      });

      await loadInvites(confinamentoId!);
    } catch (error) {
      console.error("Erro ao remover convite:", error);
      toast({
        title: "Erro ao remover convite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId)
        .eq("confinamento_id", confinamentoId);

      if (error) throw error;

      toast({
        title: "Nível atualizado",
        description: "Nível de acesso atualizado com sucesso",
      });

      await loadUsersAndRoles(confinamentoId!);
    } catch (error) {
      console.error("Erro ao atualizar nível:", error);
      toast({
        title: "Erro ao atualizar nível",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "master":
        return "bg-red-500";
      case "gerencial":
        return "bg-blue-500";
      case "supervisor":
        return "bg-green-500";
      case "operacional":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "master":
        return "Master";
      case "gerencial":
        return "Gerencial";
      case "supervisor":
        return "Supervisor";
      case "operacional":
        return "Operacional";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie usuários e convites do seu confinamento
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Usuários Ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários Ativos
              </CardTitle>
              <CardDescription>
                Usuários que já têm acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRoles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  userRoles.map((userRole) => (
                    <div
                      key={userRole.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {userRole.user.profiles?.nome_completo ||
                              "Nome não informado"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {userRole.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(userRole.role)}>
                          {getRoleLabel(userRole.role)}
                        </Badge>
                        {userRole.role !== "master" && (
                          <Select
                            value={userRole.role}
                            onValueChange={(value) =>
                              handleUpdateUserRole(userRole.user_id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gerencial">
                                Gerencial
                              </SelectItem>
                              <SelectItem value="supervisor">
                                Supervisor
                              </SelectItem>
                              <SelectItem value="operacional">
                                Operacional
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Convites Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Convites Pendentes
              </CardTitle>
              <CardDescription>
                Convites enviados aguardando aceitação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invites.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum convite pendente
                  </p>
                ) : (
                  invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Enviado em{" "}
                            {new Date(invite.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(invite.role)}>
                          {getRoleLabel(invite.role)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvite(invite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Convidar Novo Usuário */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Convidar Novo Usuário
            </CardTitle>
            <CardDescription>
              Envie um convite para um novo usuário acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) =>
                    setInviteForm((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gerencial">Gerencial</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleInviteUser}
                  disabled={isInviting || !inviteForm.email}
                  className="w-full"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre Níveis */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Níveis de Acesso
            </CardTitle>
            <CardDescription>
              Entenda as permissões de cada nível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge className="bg-red-500 mb-2">Master</Badge>
                <p className="text-sm text-muted-foreground">
                  Acesso total ao sistema, incluindo gerenciamento de usuários e
                  configurações.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="bg-blue-500 mb-2">Gerencial</Badge>
                <p className="text-sm text-muted-foreground">
                  Acesso total da aplicação, exceto configurações de usuários.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="bg-green-500 mb-2">Supervisor</Badge>
                <p className="text-sm text-muted-foreground">
                  Acesso a todas as áreas técnicas, exceto financeiro.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="bg-gray-500 mb-2">Operacional</Badge>
                <p className="text-sm text-muted-foreground">
                  Acesso básico para operações do dia a dia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserManagementPage;
