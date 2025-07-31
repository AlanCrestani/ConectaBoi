# 🚀 Guia do Servidor Flask - ConectaBoi Insight

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Iniciar o Servidor](#como-iniciar-o-servidor)
- [Testando o Servidor](#testando-o-servidor)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Troubleshooting](#troubleshooting)
- [Endpoints da API](#endpoints-da-api)

---

## 🎯 Visão Geral

O **ConectaBoi Insight** é um sistema SaaS Multi-Tenant para processamento ETL (Extract, Transform, Load) de dados de confinamentos. O servidor Flask fornece uma API REST para gerenciar tenants, executar scripts ETL personalizados e monitorar execuções.

### 🔧 Arquitetura

- **Backend**: Python Flask
- **Frontend**: React + TypeScript
- **Banco**: Supabase (PostgreSQL)
- **Storage**: Sistema de arquivos local por tenant
- **Autenticação**: JWT + Supabase Auth

---

## 📋 Pré-requisitos

### ✅ Software Necessário

- **Python 3.8+**
- **Node.js 16+** (para frontend)
- **Git**

### 🔧 Dependências Python

```bash
# Backend
Flask==3.0.0
Flask-CORS==4.0.0
PyJWT>=2.10.1,<3.0.0
supabase==2.17.0
pandas>=2.0.0
numpy>=1.24.0
requests>=2.31.0
```

---

## 🛠️ Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd conectaboi-insight-main
```

### 2. Configure o Backend

```bash
# Navegue para a pasta backend
cd backend

# Crie ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configure o Frontend

```bash
# Navegue para a pasta raiz
cd ..

# Instale as dependências
npm install
```

---

## 🚀 Como Iniciar o Servidor

### **Método 1: Script Personalizado (Recomendado)**

```bash
cd backend
venv\Scripts\activate
python start_server.py
```

### **Método 2: Direto com Flask**

```bash
cd backend
venv\Scripts\activate
python app.py
```

### **Método 3: Com Flask CLI**

```bash
cd backend
venv\Scripts\activate
set FLASK_APP=app.py
set FLASK_DEBUG=1
flask run --host=0.0.0.0 --port=5000
```

### **Método 4: Desenvolvimento Completo**

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python start_server.py

# Terminal 2 - Frontend
npm run dev
```

---

## 🧪 Testando o Servidor

### **1. Teste Simples**

```bash
cd backend
python simple_test.py
```

### **2. Teste Completo da API**

```bash
cd backend
python test_api.py
```

### **3. Teste Manual no Navegador**

```
http://localhost:5000/api/health
```

### **4. Teste com curl**

```bash
curl http://localhost:5000/api/health
```

### **5. Teste com PowerShell**

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET
```

---

## 📁 Estrutura do Projeto

```
conectaboi-insight-main/
├── backend/
│   ├── app.py                 # Aplicação Flask principal
│   ├── start_server.py        # Script para iniciar servidor
│   ├── test_api.py           # Testes completos da API
│   ├── simple_test.py        # Teste simples
│   ├── requirements.txt      # Dependências Python
│   ├── core/
│   │   ├── auth.py          # Autenticação
│   │   ├── tenant_manager.py # Gerenciamento de tenants
│   │   └── etl_executor.py  # Execução de ETL
│   └── venv/                # Ambiente virtual
├── storage/                  # Arquivos por tenant
│   └── confinamento_teste/
│       ├── etl.py
│       ├── config.json
│       ├── requirements.txt
│       ├── logs/
│       └── exports/
├── src/
│   ├── services/
│   │   └── etlService.ts    # Serviço frontend
│   ├── pages/
│   │   └── ETLManagement.tsx # Página de gerenciamento
│   └── components/
│       └── ETLButton.tsx    # Botão ETL
└── README_SERVIDOR.md       # Este arquivo
```

---

## 🔧 Troubleshooting

### **❌ Problema: Servidor não responde**

```bash
# 1. Verifique se a porta está livre
netstat -an | findstr :5000

# 2. Mate processos Python se necessário
taskkill /f /im python.exe

# 3. Reinicie o servidor
python start_server.py
```

### **❌ Problema: Erro de importação**

```bash
# Verifique se está no ambiente virtual
venv\Scripts\activate

# Reinstale dependências
pip install -r requirements.txt
```

### **❌ Problema: Erro de conexão**

```bash
# Teste se o servidor está rodando
python simple_test.py

# Verifique logs do servidor
# O servidor deve mostrar:
# * Running on http://127.0.0.1:5000
```

### **❌ Problema: Erro de dependências**

```bash
# Atualize pip
python -m pip install --upgrade pip

# Reinstale com versões específicas
pip install Flask==3.0.0 Flask-CORS==4.0.0
```

---

## 🌐 Endpoints da API

### **Health Check**

```
GET /api/health
```

**Resposta:**

```json
{
  "status": "ok",
  "message": "API ETL Multi-Tenant funcionando",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### **Login (Simulado)**

```
POST /api/login
```

**Body:**

```json
{
  "email": "admin@conectaboi.com",
  "password": "password123"
}
```

### **Criar Tenant**

```
POST /api/create-tenant
```

**Body:**

```json
{
  "tenant_id": "confinamento_farmtell",
  "config": {
    "name": "Confinamento Farmtell",
    "data_source": "farmtell_api"
  }
}
```

### **Informações do Tenant**

```
GET /api/tenant-info
```

### **Executar ETL**

```
POST /api/run-etl
```

### **Upload de Script**

```
POST /api/upload-script
```

**Body:**

```json
{
  "script": "print('Hello World')",
  "requirements": "pandas>=2.0.0"
}
```

### **Status ETL**

```
GET /api/etl-status
```

---

## 📊 Logs e Monitoramento

### **Logs do Servidor**

O servidor mostra logs em tempo real:

```
🚀 Iniciando API ETL Multi-Tenant...
📊 ConectaBoi Insight - Sistema de ETL para Confinamentos
🌐 API disponível em: http://localhost:5000
🔍 Health check: http://localhost:5000/api/health
```

### **Logs de Execução ETL**

Localizados em: `storage/{tenant_id}/logs/`

### **Arquivos de Exportação**

Localizados em: `storage/{tenant_id}/exports/`

---

## 🔐 Segurança

### **Autenticação**

- JWT tokens para autenticação
- Integração com Supabase Auth
- Middleware de autenticação automática

### **Multi-Tenancy**

- Isolamento por tenant_id
- Row Level Security (RLS) no Supabase
- Arquivos separados por tenant

### **Execução Segura**

- Scripts executados em ambiente isolado
- Timeout de execução
- Validação de sintaxe Python

---

## 🚀 Deploy

### **Desenvolvimento**

```bash
python start_server.py
```

### **Produção (Recomendado)**

```bash
# Use Gunicorn ou uWSGI
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Docker (Futuro)**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "start_server.py"]
```

---

## 📞 Suporte

### **Problemas Comuns**

1. **Servidor não inicia**: Verifique se está no ambiente virtual
2. **Erro de conexão**: Verifique se a porta 5000 está livre
3. **Erro de importação**: Reinstale as dependências
4. **ETL falha**: Verifique logs em `storage/{tenant}/logs/`

### **Logs Úteis**

- **Servidor**: Console onde o servidor está rodando
- **ETL**: `storage/{tenant}/logs/`
- **Frontend**: Console do navegador (F12)

---

## 📝 Notas Importantes

### **⚠️ Avisos**

- Este é um servidor de desenvolvimento
- Não use em produção sem configurações adequadas
- Sempre use HTTPS em produção
- Configure firewall adequadamente

### **🔧 Configurações**

- **Porta padrão**: 5000
- **Host**: 0.0.0.0 (aceita conexões externas)
- **Debug**: Ativado para desenvolvimento
- **CORS**: Configurado para frontend

### **📈 Performance**

- **Timeout ETL**: 300 segundos
- **Máximo de tenants**: Ilimitado
- **Tamanho de script**: 10MB
- **Logs retidos**: 100 execuções por tenant

---

**🎉 Agora você está pronto para usar o servidor ConectaBoi Insight!**

Para dúvidas ou problemas, consulte a seção [Troubleshooting](#troubleshooting) ou entre em contato com a equipe de desenvolvimento.
