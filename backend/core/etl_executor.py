import subprocess
import os
import json
import sys
from datetime import datetime
from typing import Dict, Any, List

def execute_etl(tenant_id: str) -> Dict[str, Any]:
    """Executa ETL específico no ambiente virtual"""
    
    # Usar o script ETL completo que já funciona
    etl_path = os.path.join("script_etl_completo.py")
    venv_python = get_venv_python()
    
    if not os.path.exists(etl_path):
        raise FileNotFoundError(f"ETL não encontrado: {etl_path}")
    
    print(f"🚀 Executando ETL para {tenant_id}")
    print(f"📁 Script: {etl_path}")
    print(f"🐍 Python: {venv_python}")
    
    try:
        # Garantir que executa no diretório backend onde está o arquivo Excel
        backend_dir = os.path.dirname(os.path.abspath(__file__)).replace('\\core', '')
        print(f"📂 Diretório de execução: {backend_dir}")
        
        # Executar ETL no ambiente virtual a partir do diretório backend
        result = subprocess.run([
            venv_python, etl_path, tenant_id
        ], 
        capture_output=True, 
        text=True, 
        timeout=300,  # 5 minutos timeout
        cwd=backend_dir  # Executar especificamente no diretório backend
        )
        
        # Parse do resultado
        success = result.returncode == 0
        output = result.stdout.strip()
        error = result.stderr.strip()
        
        # Log da execução com debug
        print(f"🔍 DEBUG - Return code: {result.returncode}")
        print(f"🔍 DEBUG - STDOUT: {output[:500]}...")  # Primeiros 500 chars
        if error:
            print(f"❌ DEBUG - STDERR: {error}")
        
        log_execution(tenant_id, success, output, error)
        
        # Tentar parsear JSON do output
        etl_result = None
        try:
            # Procurar por JSON no output
            lines = output.split('\n')
            for line in lines:
                if line.strip().startswith('{') and line.strip().endswith('}'):
                    etl_result = json.loads(line.strip())
                    break
        except:
            pass
        
        return {
            'success': success,
            'output': output,
            'error': error,
            'tenant_id': tenant_id,
            'executed_at': datetime.now().isoformat(),
            'etl_result': etl_result,
            'return_code': result.returncode
        }
        
    except subprocess.TimeoutExpired:
        error_msg = f"ETL timeout para {tenant_id} - execução cancelada após 5 minutos"
        log_execution(tenant_id, False, "", error_msg)
        return {
            'success': False,
            'error': error_msg,
            'tenant_id': tenant_id,
            'executed_at': datetime.now().isoformat()
        }
    except Exception as e:
        error_msg = f"Erro na execução: {str(e)}"
        log_execution(tenant_id, False, "", error_msg)
        return {
            'success': False,
            'error': error_msg,
            'tenant_id': tenant_id,
            'executed_at': datetime.now().isoformat()
        }

def get_venv_python() -> str:
    """Retorna caminho do Python no ambiente virtual"""
    if sys.platform == "win32":
        return os.path.join('venv', 'Scripts', 'python.exe')
    else:
        return os.path.join('venv', 'bin', 'python')

def log_execution(tenant_id: str, success: bool, output: str, error: str) -> None:
    """Log das execuções para debug"""
    log_dir = os.path.join("..", "storage", tenant_id, "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'success': success,
        'output': output,
        'error': error,
        'tenant_id': tenant_id
    }
    
    log_file = os.path.join(log_dir, "executions.log")
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
    except Exception as e:
        print(f"❌ Erro ao salvar log: {e}")

def get_execution_logs(tenant_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Obtém logs de execução do tenant"""
    log_file = os.path.join("..", "storage", tenant_id, "logs", "executions.log")
    
    if not os.path.exists(log_file):
        return []
    
    try:
        logs = []
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Pegar as últimas N linhas
        for line in lines[-limit:]:
            try:
                log_entry = json.loads(line.strip())
                logs.append(log_entry)
            except:
                continue
                
        return logs
    except Exception as e:
        print(f"❌ Erro ao ler logs: {e}")
        return []

def install_requirements(tenant_id: str) -> bool:
    """Instala requirements específicos do tenant"""
    requirements_file = os.path.join("..", "storage", tenant_id, "requirements.txt")
    venv_pip = get_venv_pip()
    
    if not os.path.exists(requirements_file):
        print(f"⚠️ Requirements não encontrado para {tenant_id}")
        return True
    
    try:
        print(f"📦 Instalando requirements para {tenant_id}")
        result = subprocess.run([
            venv_pip, "install", "-r", requirements_file
        ], 
        capture_output=True, 
        text=True, 
        timeout=120
        )
        
        success = result.returncode == 0
        if success:
            print(f"✅ Requirements instalados para {tenant_id}")
        else:
            print(f"❌ Erro ao instalar requirements: {result.stderr}")
            
        return success
        
    except Exception as e:
        print(f"❌ Erro ao instalar requirements: {e}")
        return False

def get_venv_pip() -> str:
    """Retorna caminho do pip no ambiente virtual"""
    if sys.platform == "win32":
        return os.path.join('venv', 'Scripts', 'pip.exe')
    else:
        return os.path.join('venv', 'bin', 'pip')

def check_etl_status(tenant_id: str) -> Dict[str, Any]:
    """Verifica status do ETL do tenant"""
    etl_file = os.path.join("..", "storage", tenant_id, "etl.py")
    requirements_file = os.path.join("..", "storage", tenant_id, "requirements.txt")
    
    status = {
        'tenant_id': tenant_id,
        'etl_exists': os.path.exists(etl_file),
        'requirements_exists': os.path.exists(requirements_file),
        'last_execution': None,
        'status': 'unknown'
    }
    
    # Verificar última execução
    logs = get_execution_logs(tenant_id, limit=1)
    if logs:
        last_log = logs[0]
        status['last_execution'] = last_log.get('timestamp')
        status['last_success'] = last_log.get('success', False)
        status['status'] = 'success' if last_log.get('success') else 'error'
    
    return status

def validate_etl_script(tenant_id: str) -> Dict[str, Any]:
    """Valida sintaxe do script ETL"""
    etl_file = os.path.join("..", "storage", tenant_id, "etl.py")
    venv_python = get_venv_python()
    
    if not os.path.exists(etl_file):
        return {
            'valid': False,
            'error': 'Script ETL não encontrado'
        }
    
    try:
        # Verificar sintaxe do Python
        result = subprocess.run([
            venv_python, "-m", "py_compile", etl_file
        ], 
        capture_output=True, 
        text=True, 
        timeout=30
        )
        
        valid = result.returncode == 0
        
        return {
            'valid': valid,
            'error': result.stderr if not valid else None,
            'tenant_id': tenant_id
        }
        
    except Exception as e:
        return {
            'valid': False,
            'error': str(e),
            'tenant_id': tenant_id
        } 