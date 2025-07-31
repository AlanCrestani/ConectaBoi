#!/usr/bin/env python3
"""
Script ETL Completo - ConectaBoi Insight
Sistema Multi-Tenant para Confinamentos

Este script:
1. Extrai dados do arquivo Excel (todas as abas)
2. Filtra apenas colunas válidas para cada tabela
3. Faz upload para o Supabase usando ANON KEY (seguro)
4. Funciona com a estrutura correta do banco (user_confinamentos)

Autor: ConectaBoi Insight
Data: 2025
"""

import pandas as pd
import numpy as np
import json
import os
import sys
from datetime import datetime, timedelta
import random
from supabase import create_client, Client
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configuração do Supabase - USAR ANON KEY (seguro)
SUPABASE_URL = "https://weqvnlbqnkjljiezjrqk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXZubGJxbmtqbGppZXpqcnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3OTk3MzQsImV4cCI6MjA2ODM3NTczNH0.BUkHzt1ZzRXTkAFwllJCjIBlowRBmKs4DELdX0K8p7I"
CONFINAMENTO_ID_PADRAO = "00000000-0000-0000-0000-000000000001"
USER_ID_REAL = "6d3c8bbb-1e1c-4fde-a2e7-744c552c95d8"  # Seu user_id real
EXCEL_PATH = 'etl_geral.xlsx'

# Colunas válidas para cada tabela (baseado na estrutura real do Supabase)
COLUNAS_VALIDAS_FATO_RESUMO = [
    'id_curral', 'curral', 'setor', 'lote', 'data', 'qtd_animais', 
    'dias_confinamento', 'data_entrada', 'leitura_cocho', 'ajuste_kg', 
    'leitura_noturna', 'sexo', 'grupo_genetico', 'peso_entrada_kg', 
    'peso_medio_estimado_kg', 'cms_previsto_kg', 'cms_realizado_kg', 
    'cmn_previsto_kg', 'cmn_realizado_kg', 'ms_dieta_meta_pc', 
    'ms_dieta_real_pc', 'cms_real_pc_pv', 'area_m2', 'area_cocho_m', 
    'm2_cab', 'cocho_cab_m', 'unique_key', 'confinamento_id', 
    'gmd_padrao', 'peso_estimado_corrigido', 'eficiencia_cms', 'status_lote'
]

COLUNAS_VALIDAS_FATO_TRATO = [
    'data', 'hora_trato', 'trato', 'id_trato', 'curral', 'setor',
    'dieta', 'tipo_dieta', 'ingrediente', 'tipo_ingrediente',
    'previsto_kg', 'realizado_kg', 'desvio_kg', 'desvio_pc', 'desvio_abs_pc',
    'status', 'categoria_desvio', 'id_curral', 'unique_key', 'confinamento_id'
]

COLUNAS_VALIDAS_FATO_CARREGAMENTO = [
    'data', 'hora_carregamento', 'carregamento', 'id_carregamento', 'pazeiro',
    'vagao', 'dieta', 'tipo_dieta', 'ingrediente', 'tipo_ingrediente',
    'previsto_kg', 'realizado_kg', 'desvio_kg', 'desvio_pc', 'desvio_abs_pc',
    'status', 'categoria_desvio', 'id_curral', 'unique_key', 'confinamento_id'
]

def criar_cliente_supabase():
    """Cria cliente Supabase usando ANON KEY (seguro)."""
    try:
        if not SUPABASE_ANON_KEY:
            print("[ERRO] SUPABASE_ANON_KEY não encontrada")
            return None
            
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logging.info("Cliente Supabase criado com ANON KEY!")
        return supabase
    except Exception as e:
        logging.error(f"Erro ao criar cliente: {e}")
        return None

def obter_confinamento_id():
    """Obtém o confinamento_id do argumento da linha de comando ou usa o padrão."""
    if len(sys.argv) > 1:
        tenant_id = sys.argv[1]
        # Mapear tenant_id para confinamento_id (UUID)
        tenant_mapping = {
            "confinamento_teste": "00000000-0000-0000-0000-000000000001",
            "ganadera_7_montes": "00000000-0000-0000-0000-000000000001",
            # Adicionar outros mapeamentos conforme necessário
        }
        return tenant_mapping.get(tenant_id, CONFINAMENTO_ID_PADRAO)
    return CONFINAMENTO_ID_PADRAO

def verificar_acesso_confinamento(supabase, confinamento_id):
    """Verifica se o usuário tem acesso ao confinamento_id."""
    try:
        # Busca na tabela user_confinamentos usando o user_id real
        result = supabase.table('user_confinamentos').select('*').eq('confinamento_id', confinamento_id).eq('user_id', USER_ID_REAL).execute()
        
        if result.data:
            print(f"[OK] Acesso verificado para confinamento_id: {confinamento_id} e user_id: {USER_ID_REAL}")
            return True
        else:
            print(f"[WARN] Nenhum usuário encontrado para confinamento_id: {confinamento_id} e user_id: {USER_ID_REAL}")
            return False
            
    except Exception as e:
        print(f"[ERRO] Erro ao verificar acesso: {e}")
        return False

def extrair_dados():
    """Extrai dados do arquivo Excel para todas as tabelas"""
    print("Extraindo dados do arquivo Excel...")
    
    if not os.path.exists(EXCEL_PATH):
        print(f"[ERRO] Arquivo não encontrado: {EXCEL_PATH}")
        return {}
    
    try:
        # Lê Excel
        xls = pd.ExcelFile(EXCEL_PATH)
        print(f"[INFO] Arquivo Excel carregado: {EXCEL_PATH}")
        print(f"[INFO] Abas disponíveis: {xls.sheet_names}")
        
        dados_totais = {}
        confinamento_id = obter_confinamento_id()
        
        # Processa cada aba correspondente às tabelas
        tabelas_abas = {
            'fato_resumo': 'fato_resumo',
            'fato_trato': 'fato_trato', 
            'fato_carregamento': 'fato_carregamento'
        }
        
        colunas_por_tabela = {
            'fato_resumo': COLUNAS_VALIDAS_FATO_RESUMO,
            'fato_trato': COLUNAS_VALIDAS_FATO_TRATO,
            'fato_carregamento': COLUNAS_VALIDAS_FATO_CARREGAMENTO
        }
        
        for tabela, aba in tabelas_abas.items():
            if aba in xls.sheet_names:
                # Lê aba
                df = pd.read_excel(xls, sheet_name=aba)
                print(f"[INFO] {len(df)} registros lidos da aba '{aba}'")
                
                # Filtra apenas colunas válidas
                colunas_validas = colunas_por_tabela[tabela]
                colunas_existentes = [col for col in colunas_validas if col in df.columns]
                df = df[colunas_existentes]
                print(f"[INFO] {len(colunas_existentes)} colunas válidas filtradas para {tabela}")
                
                # Adiciona confinamento_id se não existir
                if 'confinamento_id' not in df.columns:
                    df['confinamento_id'] = confinamento_id
                    print(f"[INFO] Confinamento ID definido para {tabela}: {confinamento_id}")
                else:
                    # Atualiza confinamento_id para garantir consistência
                    df['confinamento_id'] = confinamento_id
                    print(f"[INFO] Confinamento ID atualizado para {tabela}: {confinamento_id}")
                
                # Converte para lista de dicionários
                dados_totais[tabela] = df.to_dict('records')
                print(f"[INFO] {len(dados_totais[tabela])} registros preparados para {tabela}")
            else:
                print(f"[WARN] Aba '{aba}' não encontrada para tabela {tabela}")
                dados_totais[tabela] = []
        
        print(f"Dados extraídos: {sum(len(dados) for dados in dados_totais.values())} registros totais")
        return dados_totais
        
    except Exception as e:
        print(f"[ERRO] Erro ao ler Excel: {e}")
        return {}

def transformar_dados(dados_brutos):
    """Transforma os dados extraídos para cada tabela"""
    print("Transformando dados...")
    
    dados_processados = {}
    
    for tabela, dados in dados_brutos.items():
        if not dados:
            print(f"[WARN] Nenhum dado para tabela {tabela}")
            dados_processados[tabela] = []
            continue
            
        df = pd.DataFrame(dados)
        
        # Verifica se tem unique_key
        if 'unique_key' not in df.columns:
            print(f"[ERRO] Coluna 'unique_key' não encontrada na tabela {tabela}")
            dados_processados[tabela] = []
            continue
        
        # Remove linhas sem unique_key
        df = df.dropna(subset=['unique_key'])
        
        if df.empty:
            print(f"[ERRO] Nenhum registro com 'unique_key' válido na tabela {tabela}")
            dados_processados[tabela] = []
            continue
        
        print(f"[INFO] {len(df)} registros válidos para processamento na tabela {tabela}")
        dados_processados[tabela] = df.to_dict('records')
    
    total_processados = sum(len(dados) for dados in dados_processados.values())
    print(f"[INFO] Dados transformados: {total_processados} registros totais")
    
    return dados_processados

def obter_chaves_existentes(supabase, tabela):
    """Busca TODAS as unique_keys existentes na tabela (com paginação)."""
    try:
        chaves = set()
        offset = 0
        limite = 1000
        
        while True:
            result = supabase.table(tabela).select("unique_key").range(offset, offset + limite - 1).execute()
            
            if not result.data:
                break
                
            batch_chaves = {row['unique_key'] for row in result.data if row['unique_key']}
            chaves.update(batch_chaves)
            
            if len(result.data) < limite:
                break
                
            offset += limite
        
        logging.info(f"Encontradas {len(chaves)} chaves na tabela '{tabela}'")
        return chaves
    except Exception as e:
        logging.warning(f"Erro ao buscar chaves de '{tabela}': {e}")
        return set()

def carregar_dados_supabase(dados_processados):
    """Carrega dados no Supabase usando ANON KEY (seguro)"""
    print("Carregando dados no Supabase...")
    
    # Criar cliente Supabase com ANON KEY
    supabase = criar_cliente_supabase()
    if not supabase:
        return {
            "registros_processados": 0,
            "erro": "Não foi possível conectar ao Supabase"
        }
    
    # Verificar acesso ao confinamento
    confinamento_id = obter_confinamento_id()
    if not verificar_acesso_confinamento(supabase, confinamento_id):
        return {
            "registros_processados": 0,
            "erro": f"Usuário não tem acesso ao confinamento_id: {confinamento_id}"
        }
    
    total_inseridos = 0
    resultados_por_tabela = {}
    
    for tabela, dados in dados_processados.items():
        if not dados:
            print(f"[INFO] Nenhum dado para processar na tabela {tabela}")
            resultados_por_tabela[tabela] = 0
            continue
            
        print(f"\n[INFO] Processando tabela: {tabela}")
        
        # Preparar dados para upload
        df = pd.DataFrame(dados)
        
        # Limpar dados
        df = limpar_dados(df)
        
        if df.empty:
            print(f"[WARN] Nenhum dado válido para upload na tabela {tabela}")
            resultados_por_tabela[tabela] = 0
            continue
        
        # VERIFICAÇÃO DE DUPLICAÇÃO - Buscar chaves existentes
        print(f"Verificando chaves existentes para evitar duplicação na tabela {tabela}...")
        chaves_existentes = obter_chaves_existentes(supabase, tabela)
        
        # Filtrar apenas registros novos (não duplicados)
        df_novo = df[~df['unique_key'].isin(chaves_existentes)]
        
        print(f"[INFO] Total de registros em {tabela}: {len(df)}")
        print(f"[INFO] Registros já existentes em {tabela}: {len(df) - len(df_novo)}")
        print(f"[INFO] Registros novos para inserir em {tabela}: {len(df_novo)}")
        
        if df_novo.empty:
            print(f"[INFO] Todos os registros já existem na tabela {tabela}!")
            resultados_por_tabela[tabela] = 0
            continue
        
        # Converte para lista de dicionários apenas os novos
        registros = df_novo.to_dict('records')
        
        # Insere no Supabase usando ANON KEY (seguro, com RLS)
        total_inserido = inserir_dados_lote(supabase, tabela, registros)
        resultados_por_tabela[tabela] = total_inserido
        total_inseridos += total_inserido
    
    return {
        "registros_processados": total_inseridos,
        "resultados_por_tabela": resultados_por_tabela,
        "erro": None
    }

def limpar_dados(df):
    """Limpa e prepara os dados."""
    # Remove colunas vazias
    df = df.dropna(axis=1, how='all')
    
    # Limpa nomes das colunas
    df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
    
    # Remove linhas vazias
    df = df.dropna(how='all')
    
    # Remove a coluna created_at se existir (deixa o Supabase definir automaticamente)
    if 'created_at' in df.columns:
        df = df.drop('created_at', axis=1)
        logging.info("Coluna 'created_at' removida (será definida automaticamente pelo Supabase)")
    
    # Converte datas ANTES de tratar NaN
    for col in df.columns:
        if 'data' in col or df[col].dtype == 'datetime64[ns]':
            try:
                # Converte para datetime e depois para string
                df[col] = pd.to_datetime(df[col], errors='coerce')
                df[col] = df[col].dt.strftime('%Y-%m-%d')
            except:
                pass
    
    # Trata valores NaN/None DEPOIS de converter datas
    df = df.replace({np.nan: None, pd.NaT: None, 'NaT': None})
    
    # Converte chaves estrangeiras para string (para compatibilidade com Supabase)
    colunas_fk = ['id_curral', 'id_carregamento', 'id_trato', 'vagao', 'confinamento_id']
    for col in colunas_fk:
        if col in df.columns:
            # Converte valores numéricos para string, preservando None
            def convert_to_string_or_none(x):
                if pd.isna(x) or x is None:
                    return None
                # Se é float com decimais zero, converte para int primeiro
                if isinstance(x, float) and x.is_integer():
                    return str(int(x))
                return str(x)
            
            df[col] = df[col].apply(convert_to_string_or_none)
            logging.info(f"Coluna '{col}' convertida para string (chave estrangeira)")
    
    # Converte timestamps restantes, mas preserva None
    for col in df.columns:
        if df[col].dtype == 'object':
            # Não converte None para string "None"
            mask_nao_none = df[col].notna()
            if mask_nao_none.any():
                df.loc[mask_nao_none, col] = df.loc[mask_nao_none, col].astype(str)
                df.loc[mask_nao_none, col] = df.loc[mask_nao_none, col].replace('NaT', None)
                df.loc[mask_nao_none, col] = df.loc[mask_nao_none, col].replace('nan', None)
    
    return df

def inserir_dados_lote(supabase, tabela, dados, tamanho_lote=50):
    """Insere dados em lotes para evitar timeout."""
    total_inseridos = 0
    
    for i in range(0, len(dados), tamanho_lote):
        lote = dados[i:i + tamanho_lote]
        
        try:
            result = supabase.table(tabela).insert(lote).execute()
            total_inseridos += len(lote)
            print(f"Lote {i//tamanho_lote + 1} da tabela {tabela}: {len(lote)} registros inseridos")
        except Exception as e:
            print(f"Erro no lote {i//tamanho_lote + 1} da tabela {tabela}: {e}")
            # Tenta inserir um por vez para identificar problemas
            for j, registro in enumerate(lote):
                try:
                    supabase.table(tabela).insert([registro]).execute()
                    total_inseridos += 1
                except Exception as e2:
                    print(f"Erro no registro {i+j} da tabela {tabela}: {e2}")
    
    return total_inseridos

def main():
    """Função principal do ETL"""
    print("Iniciando ETL Completo - ConectaBoi Insight")
    print("=" * 50)
    
    # Obter confinamento_id
    confinamento_id = obter_confinamento_id()
    print(f"[INFO] Confinamento ID: {confinamento_id}")
    
    # Extrair dados
    dados_brutos = extrair_dados()
    total_brutos = sum(len(dados) for dados in dados_brutos.values())
    print(f"Dados extraídos: {total_brutos} registros totais")
    
    # Transformar dados
    dados_processados = transformar_dados(dados_brutos)
    total_processados = sum(len(dados) for dados in dados_processados.values())
    print(f"Dados transformados: {total_processados} registros totais")
    
    # Carregar dados no Supabase
    resultado_upload = carregar_dados_supabase(dados_processados)
    print(f"Dados carregados: {resultado_upload['registros_processados']} registros totais")
    
    # Mostrar resultados por tabela
    if 'resultados_por_tabela' in resultado_upload:
        print("\nResultados por tabela:")
        for tabela, quantidade in resultado_upload['resultados_por_tabela'].items():
            print(f"  - {tabela}: {quantidade} registros")
    
    print("=" * 50)
    print("ETL Completo concluído com sucesso!")
    
    return {
        "status": "sucesso",
        "registros_processados": resultado_upload['registros_processados'],
        "registros_upload": resultado_upload['registros_processados'],
        "relatorios_gerados": 0,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    try:
        resultado = main()
        print(f"\nResultado final: {json.dumps(resultado, indent=2)}")
    except Exception as e:
        print(f"Erro no ETL: {e}")
        exit(1) 