import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  UserPlus,
  Building,
  Mail,
  Phone,
  User,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Usuario {
  id: string;
  email: string;
  nome: string;
  avatar_url?: string;
  confinamento_nome: string;
  cargo: string;
  telefone?: string;
  ativo: boolean;
  data_cadastro: string;
  ultimo_acesso: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    confinamento_nome: "",
    cargo: "",
    telefone: "",
    ativo: true,
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios_combustivel")
        .select("*")
        .order("nome");

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from("usuarios_combustivel")
          .update({
            email: formData.email,
            nome: formData.nome,
            confinamento_nome: formData.confinamento_nome,
            cargo: formData.cargo,
            telefone: formData.telefone,
            ativo: formData.ativo,
          })
          .eq("id", editingUser.id);

        if (error) throw error;
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Criar novo usuário (simulado - na prática seria via auth)
        const newUser = {
          id: crypto.randomUUID(),
          ...formData,
          data_cadastro: new Date().toISOString(),
          ultimo_acesso: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("usuarios_combustivel")
          .insert([newUser]);

        if (error) throw error;
        toast.success("Usuário criado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário");
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      email: usuario.email,
      nome: usuario.nome,
      confinamento_nome: usuario.confinamento_nome,
      cargo: usuario.cargo,
      telefone: usuario.telefone || "",
      ativo: usuario.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const { error } = await supabase
        .from("usuarios_combustivel")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Usuário excluído com sucesso!");
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      nome: "",
      confinamento_nome: "",
      cargo: "",
      telefone: "",
      ativo: true,
    });
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.confinamento_nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && usuario.ativo) ||
      (filterStatus === "inactive" && !usuario.ativo);

    return matchesSearch && matchesFilter;
  });

  const cargos = [
    "Operador de Trator",
    "Motorista",
    "Técnico de Manutenção",
    "Gerente de Produção",
    "Supervisor",
    "Auxiliar",
    "Mecânico",
    "Eletricista",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="p-2 bg-primary rounded-lg">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
                <p className="text-sm text-muted-foreground">
                  Cadastro e gerenciamento de usuários do sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usuarios.length}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários cadastrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usuarios.filter((u) => u.ativo).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Atualmente ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Confinamentos
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(usuarios.map((u) => u.confinamento_nome)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Confinamentos únicos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cargos Diferentes
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(usuarios.map((u) => u.cargo)).size}
                </div>
                <p className="text-xs text-muted-foreground">Tipos de cargo</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuários do Sistema</CardTitle>
                  <CardDescription>
                    Gerencie todos os usuários cadastrados
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingUser(null);
                        resetForm();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? "Editar Usuário" : "Novo Usuário"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingUser
                          ? "Atualize as informações do usuário"
                          : "Preencha as informações para criar um novo usuário"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome Completo</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) =>
                              setFormData({ ...formData, nome: e.target.value })
                            }
                            placeholder="Nome completo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="email@exemplo.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="confinamento">Confinamento</Label>
                          <Input
                            id="confinamento"
                            value={formData.confinamento_nome}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confinamento_nome: e.target.value,
                              })
                            }
                            placeholder="Nome do confinamento"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cargo">Cargo</Label>
                          <Select
                            value={formData.cargo}
                            onValueChange={(value) =>
                              setFormData({ ...formData, cargo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cargo" />
                            </SelectTrigger>
                            <SelectContent>
                              {cargos.map((cargo) => (
                                <SelectItem key={cargo} value={cargo}>
                                  {cargo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telefone: e.target.value,
                            })
                          }
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          checked={formData.ativo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ativo: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <Label htmlFor="ativo">Usuário ativo</Label>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingUser ? "Atualizar" : "Criar"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou confinamento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Confinamento</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Carregando usuários...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {usuario.nome}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {usuario.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{usuario.confinamento_nome}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{usuario.cargo}</Badge>
                          </TableCell>
                          <TableCell>
                            {usuario.telefone ? (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{usuario.telefone}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Não informado
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                usuario.ativo ? "default" : "destructive"
                              }
                            >
                              {usuario.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(
                                usuario.ultimo_acesso
                              ).toLocaleDateString("pt-BR")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(usuario)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(usuario.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
