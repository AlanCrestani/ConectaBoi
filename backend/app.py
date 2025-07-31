from flask import Flask, request, jsonify, g
from flask_cors import CORS
import jwt
import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'core')) # Add core to path
from tenant_manager import get_tenant_etl, validate_tenant, create_tenant
from etl_executor import execute_etl
from auth import authenticate_user

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'conectaboi-insight-secret-key-2025'
app.config['JWT_SECRET'] = 'jwt-secret-key-conectaboi'

@app.before_request
def authenticate():
    """Middleware para autenticação e identificação do tenant"""
    # Pular autenticação para health check
    if request.endpoint == 'health':
        return
    
    # Simular autenticação para desenvolvimento
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            user_info = authenticate_user(token)
            g.user = user_info
            g.tenant_id = user_info.get('tenant_id', 'confinamento_teste')
        except Exception as e:
            print(f"Erro na autenticação: {e}")
            g.user = {'user_id': 'user-123', 'tenant_id': 'confinamento_teste', 'role': 'master'}
            g.tenant_id = 'confinamento_teste'
    else:
        # Para desenvolvimento, usar tenant padrão
        g.user = {'user_id': 'user-123', 'tenant_id': 'confinamento_teste', 'role': 'master'}
        g.tenant_id = 'confinamento_teste'

@app.route('/api/health', methods=['GET'])
def health():
    """Health check da API"""
    return jsonify({
        'status': 'ok',
        'message': 'API ETL Multi-Tenant funcionando',
        'timestamp': '2024-01-01T12:00:00Z'
    })

@app.route('/api/login', methods=['POST'])
def login():
    """Login simulado"""
    data = request.get_json()
    email = data.get('email', 'admin@conectaboi.com')
    password = data.get('password', 'password123')
    
    # Simular login bem-sucedido
    token = jwt.encode({
        'user_id': 'user-123',
        'email': email,
        'tenant_id': 'confinamento_teste',
        'role': 'master'
    }, app.config['JWT_SECRET'], algorithm='HS256')
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': 'user-123',
            'email': email,
            'tenant_id': 'confinamento_teste',
            'role': 'master'
        }
    })

@app.route('/api/create-tenant', methods=['POST'])
def create_new_tenant():
    """Criar novo tenant"""
    try:
        data = request.get_json()
        tenant_id = data.get('tenant_id')
        config = data.get('config', {})
        
        if not tenant_id:
            return jsonify({'success': False, 'message': 'tenant_id é obrigatório'}), 400
        
        create_tenant(tenant_id, config)
        
        return jsonify({
            'success': True,
            'message': f'Tenant {tenant_id} criado com sucesso',
            'tenant_id': tenant_id
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/run-etl', methods=['POST'])
def run_etl():
    """Executar ETL para o tenant atual"""
    try:
        tenant_id = g.tenant_id
        print(f"🚀 Executando ETL para tenant: {tenant_id}")
        
        if not validate_tenant(tenant_id):
            return jsonify({'success': False, 'message': f'Tenant {tenant_id} não encontrado'}), 404
        
        result = execute_etl(tenant_id)
        
        return jsonify({
            'success': True,
            'message': 'ETL executado com sucesso',
            'data': result,
            'tenant_id': tenant_id
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/tenant-info', methods=['GET'])
def get_tenant_info():
    """Obter informações do tenant atual"""
    try:
        tenant_id = g.tenant_id
        user = g.user
        
        return jsonify({
            'tenant_id': tenant_id,
            'user_id': user.get('user_id'),
            'user_role': user.get('role', 'master'),
            'config': {
                'name': f'Confinamento {tenant_id}',
                'data_source': 'local'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/upload-script', methods=['POST'])
def upload_script():
    """Upload de script personalizado"""
    try:
        data = request.get_json()
        script_content = data.get('script')
        requirements_content = data.get('requirements', '')
        tenant_id = g.tenant_id
        
        if not script_content:
            return jsonify({'success': False, 'message': 'Script é obrigatório'}), 400
        
        # Salvar script
        from tenant_manager import save_tenant_script
        save_tenant_script(tenant_id, script_content, requirements_content)
        
        return jsonify({
            'success': True,
            'message': 'Script salvo com sucesso',
            'tenant_id': tenant_id
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/etl-status', methods=['GET'])
def get_etl_status():
    """Obter status das execuções ETL"""
    try:
        tenant_id = g.tenant_id
        
        from etl_executor import get_execution_logs
        logs = get_execution_logs(tenant_id, limit=10)
        
        return jsonify({
            'tenant_id': tenant_id,
            'logs': logs
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Iniciando API ETL Multi-Tenant...")
    print("📊 ConectaBoi Insight - Sistema de ETL para Confinamentos")
    print("🌐 API disponível em: http://localhost:8000")
    print("🔍 Health check: http://localhost:8000/api/health")
    
    # Configuração mais estável para produção
    app.run(
        debug=False,  # Desabilitar debug para estabilidade
        port=8000, 
        host='0.0.0.0',
        threaded=True,  # Habilitar threading
        use_reloader=False  # Desabilitar auto-reload
    ) 