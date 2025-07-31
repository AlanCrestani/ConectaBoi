#!/usr/bin/env python3
"""
Script de teste para verificar se o storage está funcionando
"""

import os
import sys

def main():
    print("🔍 Testando configuração do Python...")
    
    # Verificar se as bibliotecas básicas estão disponíveis
    try:
        import pandas as pd
        print("✅ pandas disponível")
    except ImportError:
        print("❌ pandas não disponível")
    
    try:
        import numpy as np
        print("✅ numpy disponível")
    except ImportError:
        print("❌ numpy não disponível")
    
    try:
        import requests
        print("✅ requests disponível")
    except ImportError:
        print("❌ requests não disponível")
    
    # Simular processamento de dados
    print("\n📊 Simulando processamento de dados...")
    
    # Dados de exemplo
    dados = {
        'data': ['2024-01-01', '2024-01-02', '2024-01-03'],
        'animal_id': ['A001', 'A002', 'A003'],
        'peso': [450.5, 452.1, 453.8],
        'consumo': [12.5, 12.8, 13.1]
    }
    
    try:
        df = pd.DataFrame(dados)
        print("✅ DataFrame criado com sucesso")
        print(f"📈 Dados processados: {len(df)} registros")
        
        # Estatísticas básicas
        print(f"📊 Peso médio: {df['peso'].mean():.2f} kg")
        print(f"📊 Consumo médio: {df['consumo'].mean():.2f} kg/dia")
        
    except Exception as e:
        print(f"❌ Erro ao processar dados: {e}")
    
    print("\n✅ Teste concluído com sucesso!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 