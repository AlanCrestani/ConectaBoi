# ⚡ Comandos Rápidos - ConectaBoi Insight

## 🚀 Iniciar Servidor

### **Windows (Recomendado)**

```bash
# Duplo clique no arquivo:
INICIAR_SERVIDOR.bat

# Ou via PowerShell:
.\INICIAR_SERVIDOR.ps1

# Ou manualmente:
cd backend
venv\Scripts\activate
python start_server.py
```

### **Linux/Mac**

```bash
cd backend
source venv/bin/activate
python start_server.py
```

## 🧪 Testar Servidor

### **Teste Rápido**

```bash
# Windows:
TESTAR_SERVIDOR.bat

# Manualmente:
cd backend
venv\Scripts\activate
python simple_test.py
```

### **Teste Completo**

```bash
cd backend
venv\Scripts\activate
python test_api.py
```

### **Teste no Navegador**

```
http://localhost:5000/api/health
```

## 🔧 Troubleshooting Rápido

### **Servidor não inicia**

```bash
# 1. Verificar ambiente virtual
venv\Scripts\activate

# 2. Reinstalar dependências
pip install -r requirements.txt

# 3. Verificar porta
netstat -an | findstr :5000
```

### **Servidor não responde**

```bash
# 1. Parar processos Python
taskkill /f /im python.exe

# 2. Reiniciar servidor
python start_server.py
```

### **Erro de importação**

```bash
# Reinstalar dependências
pip install --force-reinstall -r requirements.txt
```

## 📁 Estrutura de Arquivos

```
📁 conectaboi-insight-main/
├── 🚀 INICIAR_SERVIDOR.bat      # Iniciar servidor (Windows)
├── 🚀 INICIAR_SERVIDOR.ps1      # Iniciar servidor (PowerShell)
├── 🧪 TESTAR_SERVIDOR.bat       # Teste rápido
├── 📖 README_SERVIDOR.md        # Documentação completa
├── ⚡ COMANDOS_RAPIDOS.md       # Este arquivo
├── 📁 backend/
│   ├── 🐍 app.py               # Aplicação Flask
│   ├── 🚀 start_server.py      # Script de inicialização
│   ├── 🧪 test_api.py         # Testes completos
│   ├── 🧪 simple_test.py      # Teste simples
│   └── 📋 requirements.txt    # Dependências
└── 📁 src/                    # Frontend React
```

## 🌐 URLs Importantes

- **Servidor**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Frontend**: http://localhost:5173 (após `npm run dev`)

## 📞 Comandos de Emergência

### **Parar tudo**

```bash
taskkill /f /im python.exe
taskkill /f /im node.exe
```

### **Limpar cache**

```bash
# Python
pip cache purge

# Node
npm cache clean --force
```

### **Reinstalar tudo**

```bash
# Backend
cd backend
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend
npm install
```

## 🎯 Checklist de Inicialização

- [ ] Python 3.8+ instalado
- [ ] Node.js 16+ instalado
- [ ] Ambiente virtual ativado
- [ ] Dependências instaladas
- [ ] Servidor iniciado
- [ ] Teste de conexão passou
- [ ] Frontend iniciado (opcional)

## 💡 Dicas Rápidas

1. **Sempre ative o ambiente virtual primeiro**
2. **Use `start_server.py` em vez de `app.py`**
3. **Teste com `simple_test.py` antes de usar a API**
4. **Mantenha o terminal do servidor aberto**
5. **Use Ctrl+C para parar o servidor**

---

**🎉 Agora você tem tudo que precisa para usar o servidor!**
