#!/usr/bin/env python3
"""Script de teste para debug do ETL"""

import os
import sys
import subprocess

def teste_etl_debug():
    """Teste direto do ETL com debug completo"""
    print("=== TESTE ETL DEBUG ===")
    
    # Verificar ambiente
    print(f"Diretório atual: {os.getcwd()}")
    print(f"Arquivo Excel existe: {os.path.exists('etl_geral.xlsx')}")
    print(f"Python: {sys.executable}")
    
    # Simular chamada da API
    print("\n--- Simulando chamada da API ---")
    try:
        result = subprocess.run([
            sys.executable, 
            "script_etl_completo.py", 
            "confinamento_teste"
        ], 
        capture_output=True, 
        text=True, 
        timeout=180
        )
        
        print(f"Return code: {result.returncode}")
        print(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
            
    except Exception as e:
        print(f"Erro na execução: {e}")

if __name__ == "__main__":
    teste_etl_debug()