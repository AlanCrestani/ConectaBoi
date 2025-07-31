#!/usr/bin/env python3
"""
ETL personalizado para confinamento_farmtell
ConectaBoi Insight - Sistema Multi-Tenant
"""

import sys
import pandas as pd
import json
import os
from datetime import datetime

def main(tenant_id):
    """ETL personalizado para {tenant_id}"""
    print(f"🔍 Executando ETL para {tenant_id}")
    
    try:
        # 1. EXTRAÇÃO - Simular dados de exemplo
        print("📥 Extraindo dados...")
        dados = {
            'data': ['2024-01-01', '2024-01-02', '2024-01-03'],
            'animal_id': ['A001', 'A002', 'A003'],
            'peso': [450.5, 452.1, 453.8],
            'consumo': [12.5, 12.8, 13.1]
        }
        
        df = pd.DataFrame(dados)
        print(f"✅ {len(df)} registros extraídos")
        
        # 2. TRANSFORMAÇÃO
        print("🔄 Transformando dados...")
        df['data'] = pd.to_datetime(df['data'])
        df['peso_medio'] = df['peso'].mean()
        df['consumo_medio'] = df['consumo'].mean()
        
        # 3. CARGA - Simular inserção
        print("📤 Carregando dados...")
        registros_processados = len(df)
        
        # Salvar resultado
        output_file = f"../storage/{tenant_id}/exports/resultado_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        resultado = {
            'tenant_id': tenant_id,
            'registros_processados': registros_processados,
            'peso_medio': df['peso'].mean(),
            'consumo_medio': df['consumo'].mean(),
            'executado_em': datetime.now().isoformat(),
            'status': 'success'
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Resultado salvo em: {output_file}")
        
        return resultado
        
    except Exception as e:
        erro = {
            'tenant_id': tenant_id,
            'error': str(e),
            'executado_em': datetime.now().isoformat(),
            'status': 'error'
        }
        print(f"❌ Erro no ETL: {e}")
        return erro

if __name__ == "__main__":
    tenant_id = sys.argv[1] if len(sys.argv) > 1 else "confinamento_farmtell"
    result = main(tenant_id)
    print(json.dumps(result, indent=2, ensure_ascii=False))
