-- Criar tipo enum para user_role
CREATE TYPE user_role AS ENUM ('master', 'gerencial', 'supervisor', 'operacional');

-- Atualizar tabelas que usam user_role
ALTER TABLE public.user_invites 
ALTER COLUMN role TYPE user_role USING role::user_role;

ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Adicionar RLS policies para as novas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para user_roles
CREATE POLICY "Users can view roles in their confinamento" ON public.user_roles
    FOR SELECT USING (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Master users can manage roles" ON public.user_roles
    FOR ALL USING (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'master'
        )
    );

-- Policies para user_invites
CREATE POLICY "Users can view invites in their confinamento" ON public.user_invites
    FOR SELECT USING (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Master users can manage invites" ON public.user_invites
    FOR ALL USING (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'master'
        )
    );

-- Policies para assinaturas
CREATE POLICY "Users can view their own subscription" ON public.assinaturas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Master users can manage subscriptions" ON public.assinaturas
    FOR ALL USING (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'master'
        )
    );

-- Policies para ai_feedback
CREATE POLICY "Users can view feedback in their confinamento" ON public.ai_feedback
    FOR SELECT USING (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert feedback in their confinamento" ON public.ai_feedback
    FOR INSERT WITH CHECK (
        confinamento_id IN (
            SELECT confinamento_id FROM public.user_roles WHERE user_id = auth.uid()
        )
    );

-- Policies para confinamentos
CREATE POLICY "Users can view their confinamento" ON public.confinamentos
    FOR SELECT USING (
        id IN (
            SELECT confinamento_id FROM public.user_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Master users can manage their confinamento" ON public.confinamentos
    FOR ALL USING (
        master_user_id = auth.uid()
    ); 