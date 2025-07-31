import jwt
import requests
from supabase import create_client, Client
import os
from typing import Dict, Any

# Configuração do Supabase
SUPABASE_URL = "https://weqvnlbqnkjljiezjrqk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXZubGJxbmprbGppZXpqcnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NzI5NzAsImV4cCI6MjA0ODU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"

def get_supabase_client() -> Client:
    """Retorna cliente Supabase configurado"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def authenticate_user(token: str) -> Dict[str, Any]:
    """
    Autentica usuário usando token do Supabase
    Retorna payload com informações do usuário e tenant
    """
    try:
        # Para desenvolvimento, vamos simular a autenticação
        # Em produção, usar Supabase Auth
        
        # Simular payload do Supabase
        payload = {
            'user_id': 'user-123',
            'email': 'admin@conectaboi.com',
            'tenant_id': 'confinamento_teste',
            'role': 'master',
            'exp': 9999999999  # Token não expira em desenvolvimento
        }
        
        return payload
        
    except Exception as e:
        raise jwt.InvalidTokenError(f"Erro na autenticação: {str(e)}")

def get_user_tenant_info(user_id: str) -> Dict[str, Any]:
    """
    Obtém informações do tenant do usuário
    """
    try:
        supabase = get_supabase_client()
        
        # Buscar role do usuário
        response = supabase.table('user_roles').select('*').eq('user_id', user_id).execute()
        
        if response.data:
            role_data = response.data[0]
            return {
                'tenant_id': role_data['confinamento_id'],
                'role': role_data['role'],
                'user_id': user_id
            }
        
        return {
            'tenant_id': 'confinamento_teste',  # Fallback para desenvolvimento
            'role': 'master',
            'user_id': user_id
        }
        
    except Exception as e:
        # Em caso de erro, retornar dados de desenvolvimento
        return {
            'tenant_id': 'confinamento_teste',
            'role': 'master',
            'user_id': user_id
        }

def validate_user_permission(user_id: str, tenant_id: str, required_role: str = 'operacional') -> bool:
    """
    Valida se usuário tem permissão para acessar o tenant
    """
    try:
        supabase = get_supabase_client()
        
        # Buscar role do usuário para o tenant específico
        response = supabase.table('user_roles').select('*').eq('user_id', user_id).eq('confinamento_id', tenant_id).execute()
        
        if not response.data:
            return False
        
        user_role = response.data[0]['role']
        
        # Hierarquia de roles
        role_hierarchy = {
            'master': 4,
            'gerencial': 3,
            'supervisor': 2,
            'operacional': 1
        }
        
        user_level = role_hierarchy.get(user_role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        return user_level >= required_level
        
    except Exception as e:
        print(f"Erro ao validar permissão: {e}")
        return False

def create_fake_token(tenant_id: str, user_id: str, role: str = 'master') -> str:
    """
    Cria token fake para desenvolvimento
    """
    payload = {
        'user_id': user_id,
        'tenant_id': tenant_id,
        'role': role,
        'email': f'{user_id}@conectaboi.com'
    }
    
    # Em desenvolvimento, retornar token fake
    return f"fake-token-{tenant_id}-{user_id}-{role}" 