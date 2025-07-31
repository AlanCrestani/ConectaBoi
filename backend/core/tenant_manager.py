import os
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

def validate_tenant(tenant_id: str) -> bool:
    """Verifica se o cliente existe"""
    tenant_path = os.path.join("..", "storage", tenant_id)
    return os.path.exists(tenant_path)

def get_tenant_etl(tenant_id: str) -> str:
    """Retorna caminho do ETL específico do cliente"""
    etl_path = os.path.join("..", "storage", tenant_id, "etl.py")
    
    if not os.path.exists(etl_path):
        raise FileNotFoundError(f"ETL não encontrado para {tenant_id}")
    
    return etl_path

def get_tenant_config(tenant_id: str) -> Dict[str, Any]:
    """Carrega configurações específicas do cliente"""
    config_path = os.path.join("..", "storage", tenant_id, "config.json")
    
    if not os.path.exists(config_path):
        return {}
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao carregar config do tenant {tenant_id}: {e}")
        return {}

def create_tenant(tenant_id: str, config: Optional[Dict[str, Any]] = None) -> None:
    """Cria estrutura para novo cliente"""
    tenant_dir = os.path.join("..", "storage", tenant_id)
    os.makedirs(tenant_dir, exist_ok=True)
    
    # Criar subdiretórios
    os.makedirs(os.path.join(tenant_dir, "logs"), exist_ok=True)
    os.makedirs(os.path.join(tenant_dir, "exports"), exist_ok=True)
    os.makedirs(os.path.join(tenant_dir, "temp"), exist_ok=True)
    
    # ETL template
    etl_template = f'''#!/usr/bin/env python3
"""
ETL personalizado para {tenant_id}
ConectaBoi Insight - Sistema Multi-Tenant
"""

import sys
import pandas as pd
import json
import os
from datetime import datetime

def main(tenant_id):
    """ETL personalizado para {{tenant_id}}"""
    print(f"🔍 Executando ETL para {{tenant_id}}")
    
    try:
        # 1. EXTRAÇÃO - Simular dados de exemplo
        print("📥 Extraindo dados...")
        dados = {{
            'data': ['2024-01-01', '2024-01-02', '2024-01-03'],
            'animal_id': ['A001', 'A002', 'A003'],
            'peso': [450.5, 452.1, 453.8],
            'consumo': [12.5, 12.8, 13.1]
        }}
        
        df = pd.DataFrame(dados)
        print(f"✅ {{len(df)}} registros extraídos")
        
        # 2. TRANSFORMAÇÃO
        print("🔄 Transformando dados...")
        df['data'] = pd.to_datetime(df['data'])
        df['peso_medio'] = df['peso'].mean()
        df['consumo_medio'] = df['consumo'].mean()
        
        # 3. CARGA - Simular inserção
        print("📤 Carregando dados...")
        registros_processados = len(df)
        
        # Salvar resultado
        output_file = f"../storage/{{tenant_id}}/exports/resultado_{{datetime.now().strftime('%Y%m%d_%H%M%S')}}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        resultado = {{
            'tenant_id': tenant_id,
            'registros_processados': registros_processados,
            'peso_medio': df['peso'].mean(),
            'consumo_medio': df['consumo'].mean(),
            'executado_em': datetime.now().isoformat(),
            'status': 'success'
        }}
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Resultado salvo em: {{output_file}}")
        
        return resultado
        
    except Exception as e:
        erro = {{
            'tenant_id': tenant_id,
            'error': str(e),
            'executado_em': datetime.now().isoformat(),
            'status': 'error'
        }}
        print(f"❌ Erro no ETL: {{e}}")
        return erro

if __name__ == "__main__":
    tenant_id = sys.argv[1] if len(sys.argv) > 1 else "{tenant_id}"
    result = main(tenant_id)
    print(json.dumps(result, indent=2, ensure_ascii=False))
'''
    
    etl_file = os.path.join(tenant_dir, "etl.py")
    with open(etl_file, 'w', encoding='utf-8') as f:
        f.write(etl_template)
    
    # Config template
    default_config = {
        "tenant_id": tenant_id,
        "name": f"Cliente {tenant_id}",
        "data_source": "custom",
        "schedule": "daily",
        "created_at": datetime.now().isoformat(),
        "status": "active",
        "api_config": {
            "type": "custom",
            "endpoint": "",
            "credentials": {}
        },
        "etl_config": {
            "timeout": 300,
            "retry_attempts": 3,
            "notifications": True
        }
    }
    
    config = config or default_config
    config.update(default_config)
    
    config_file = os.path.join(tenant_dir, "config.json")
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    # Criar requirements.txt básico
    requirements_content = '''# Requirements para ETL - ConectaBoi Insight
# Dependências básicas para processamento de dados

# Processamento de dados
pandas>=2.0.0
numpy>=1.24.0

# Utilitários
requests>=2.31.0
openpyxl>=3.1.0
xlrd>=2.0.0

# Supabase (se necessário)
# supabase==2.52.0
'''
    
    requirements_file = os.path.join(tenant_dir, "requirements.txt")
    with open(requirements_file, 'w', encoding='utf-8') as f:
        f.write(requirements_content)
    
    print(f"✅ Tenant {tenant_id} criado com sucesso!")
    print(f"📁 Diretório: {tenant_dir}")
    print(f"🐍 ETL: {etl_file}")
    print(f"⚙️ Config: {config_file}")

def save_tenant_script(tenant_id: str, script_content: str, requirements_content: Optional[str] = None) -> None:
    """Salva script ETL personalizado para o tenant"""
    tenant_dir = os.path.join("..", "storage", tenant_id)
    
    if not os.path.exists(tenant_dir):
        raise FileNotFoundError(f"Tenant {tenant_id} não existe")
    
    # Salvar script ETL
    etl_file = os.path.join(tenant_dir, "etl.py")
    with open(etl_file, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    # Salvar requirements se fornecido
    if requirements_content:
        requirements_file = os.path.join(tenant_dir, "requirements.txt")
        with open(requirements_file, 'w', encoding='utf-8') as f:
            f.write(requirements_content)
    
    print(f"✅ Script salvo para tenant {tenant_id}")

def list_tenants() -> list:
    """Lista todos os tenants disponíveis"""
    storage_dir = os.path.join("..", "storage")
    
    if not os.path.exists(storage_dir):
        return []
    
    tenants = []
    for item in os.listdir(storage_dir):
        item_path = os.path.join(storage_dir, item)
        if os.path.isdir(item_path):
            config = get_tenant_config(item)
            tenants.append({
                'tenant_id': item,
                'config': config,
                'has_etl': os.path.exists(os.path.join(item_path, "etl.py"))
            })
    
    return tenants

def delete_tenant(tenant_id: str) -> bool:
    """Remove tenant (cuidado!)"""
    tenant_dir = os.path.join("..", "storage", tenant_id)
    
    if not os.path.exists(tenant_dir):
        return False
    
    try:
        import shutil
        shutil.rmtree(tenant_dir)
        print(f"✅ Tenant {tenant_id} removido")
        return True
    except Exception as e:
        print(f"❌ Erro ao remover tenant {tenant_id}: {e}")
        return False 