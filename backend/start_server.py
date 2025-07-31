#!/usr/bin/env python3
"""
Script de Inicialização Robusta do Servidor Flask
ConectaBoi Insight - Sistema ETL Multi-Tenant

Este script:
1. Inicia o servidor Flask de forma estável
2. Monitora o processo
3. Reinicia automaticamente se necessário
4. Logs detalhados para debugging

Autor: ConectaBoi Insight
Data: 2025
"""

import os
import sys
import time
import signal
import subprocess
import threading
from datetime import datetime

def log(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def check_port(port=8000):
    """Verificar se a porta está em uso"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

def kill_process_on_port(port=8000):
    """Matar processo na porta especificada"""
    try:
        # Windows
        result = subprocess.run(
            f'netstat -ano | findstr :{port}',
            shell=True, capture_output=True, text=True
        )
        if result.stdout:
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if f':{port}' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        subprocess.run(f'taskkill /PID {pid} /F', shell=True)
                        log(f"Processo {pid} na porta {port} finalizado")
    except Exception as e:
        log(f"Erro ao matar processo: {e}")

def start_server():
    """Iniciar servidor Flask"""
    log("🚀 Iniciando servidor Flask...")
    
    # Verificar se porta está livre
    if check_port(8000):
        log("⚠️  Porta 8000 em uso. Tentando liberar...")
        kill_process_on_port(8000)
        time.sleep(2)
    
    # Configurar ambiente
    os.environ['FLASK_ENV'] = 'production'
    os.environ['FLASK_DEBUG'] = '0'
    
    try:
        # Importar e executar app
        from app import app
        
        log("✅ Servidor iniciado com sucesso!")
        log("🌐 API disponível em: http://localhost:8000")
        log("🔍 Health check: http://localhost:8000/api/health")
        log("📊 ConectaBoi Insight - Sistema ETL Multi-Tenant")
        
        # Executar servidor
        app.run(
            debug=False,
            port=8000,
            host='0.0.0.0',
            threaded=True,
            use_reloader=False
        )
        
    except KeyboardInterrupt:
        log("⚠️  Servidor interrompido pelo usuário")
    except Exception as e:
        log(f"❌ Erro ao iniciar servidor: {e}")
        return False
    
    return True

def monitor_server():
    """Monitorar servidor em background"""
    def monitor():
        while True:
            time.sleep(30)  # Verificar a cada 30 segundos
            if not check_port(8000):
                log("⚠️  Servidor caiu! Reiniciando...")
                start_server()
    
    thread = threading.Thread(target=monitor, daemon=True)
    thread.start()
    return thread

if __name__ == '__main__':
    log("🔄 Iniciando sistema de monitoramento...")
    
    # Iniciar monitoramento
    monitor_thread = monitor_server()
    
    # Iniciar servidor
    start_server() 