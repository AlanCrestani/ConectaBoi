# 🎛️ Painel de Controle ETL - ConectaBoi Insight

## 📋 Visão Geral

O novo **Painel de Controle ETL** é uma interface moderna e intuitiva para gerenciar o servidor Flask e executar processamentos ETL de forma segura e eficiente.

## 🚀 Funcionalidades Principais

### 1. **Controle do Servidor Flask**

- ✅ **Iniciar/Parar Servidor**: Controle completo do servidor Flask
- 🔄 **Monitoramento Automático**: Verificação de status a cada 5 segundos
- 🛡️ **Configuração Estável**: Servidor configurado para não cair constantemente
- 📊 **Status em Tempo Real**: Indicador visual do status do servidor

### 2. **Upload de Scripts ETL**

- 📝 **Editor de Scripts**: Interface para colar scripts Python
- 🚀 **Upload Seguro**: Envio de scripts para o servidor
- ✅ **Validação**: Verificação de conteúdo antes do envio

### 3. **Execução de ETL**

- ⚡ **Processamento em Lote**: Execução dos 3 arquivos principais
- 📈 **Progresso Visual**: Barra de progresso em tempo real
- 📊 **Relatórios**: Resumo detalhado de cada arquivo processado

### 4. **Sistema de Logs**

- 📝 **Logs em Tempo Real**: Terminal com logs coloridos
- 🎨 **Ícones Informativos**: Diferentes ícones para cada tipo de log
- 🔄 **Auto-scroll**: Rolagem automática para novos logs
- 🧹 **Limpeza**: Botão para limpar logs

## 🛠️ Como Usar

### **Passo 1: Iniciar o Servidor**

1. Acesse a página **Upload** no frontend
2. Clique em **"Iniciar Servidor"**
3. Aguarde a confirmação de que o servidor está online
4. O status mudará para **"Online"** com indicador verde

### **Passo 2: Upload de Script (Opcional)**

1. Cole o conteúdo do script Python no campo de texto
2. Clique em **"Enviar Script"**
3. Aguarde a confirmação de upload

### **Passo 3: Executar ETL**

1. Clique em **"Executar ETL"**
2. Acompanhe o progresso em tempo real
3. Veja os logs detalhados no terminal
4. Aguarde o relatório final

## 🔧 Configurações do Servidor

### **Problema Resolvido: Servidor Caindo Constantemente**

**Antes:**

```python
app.run(debug=True, port=8000, host='0.0.0.0')
```

**Depois:**

```python
app.run(
    debug=False,  # Desabilitar debug para estabilidade
    port=8000,
    host='0.0.0.0',
    threaded=True,  # Habilitar threading
    use_reloader=False  # Desabilitar auto-reload
)
```

### **Script de Inicialização Estável**

Use o arquivo `backend/start_server_stable.py` para iniciar o servidor de forma mais robusta:

```bash
cd backend
python start_server_stable.py
```

## 📊 Estrutura dos Logs

### **Tipos de Log:**

- 🔵 **INFO**: Informações gerais do sistema
- 🟢 **SUCCESS**: Operações concluídas com sucesso
- 🟡 **WARNING**: Avisos e alertas
- 🔴 **ERROR**: Erros e falhas

### **Ícones por Operação:**

- 🖥️ **Server**: Operações do servidor
- 📤 **Upload**: Upload de arquivos
- 🗄️ **Database**: Operações de banco de dados
- ⚡ **Activity**: Processamento ETL
- ✅ **CheckCircle**: Sucessos
- ⚠️ **AlertCircle**: Erros
- 🔄 **RefreshCw**: Limpeza de logs

## 🎯 Benefícios do Novo Sistema

### **1. Estabilidade**

- ✅ Servidor não cai mais constantemente
- ✅ Configurações otimizadas para produção
- ✅ Monitoramento automático

### **2. Usabilidade**

- ✅ Interface intuitiva e moderna
- ✅ Controles visuais claros
- ✅ Feedback em tempo real

### **3. Funcionalidade**

- ✅ Controle completo do servidor
- ✅ Upload de scripts personalizados
- ✅ Execução de ETL com relatórios
- ✅ Sistema de logs avançado

### **4. Manutenibilidade**

- ✅ Código organizado e modular
- ✅ Logs detalhados para debugging
- ✅ Configurações centralizadas

## 🚨 Troubleshooting

### **Servidor não inicia:**

1. Verifique se a porta 8000 está livre: `netstat -an | findstr :8000`
2. Mate processos na porta: `taskkill /PID [PID] /F`
3. Use o script estável: `python start_server_stable.py`

### **ETL não executa:**

1. Verifique se o servidor está online
2. Confirme se o arquivo `etl_geral.xlsx` está na pasta `backend`
3. Verifique os logs para erros específicos

### **Logs não aparecem:**

1. Clique em **"Limpar"** e tente novamente
2. Verifique se o JavaScript está habilitado
3. Recarregue a página se necessário

## 📁 Estrutura de Arquivos

```
backend/
├── app.py                    # Servidor Flask principal
├── start_server_stable.py    # Script de inicialização estável
├── script_etl_completo.py   # Script ETL completo
├── etl_geral.xlsx          # Dados para processamento
└── requirements.txt         # Dependências Python

src/pages/
└── Upload.tsx              # Interface do painel de controle
```

## 🎉 Conclusão

O novo **Painel de Controle ETL** resolve o problema de instabilidade do servidor e oferece uma experiência muito mais profissional e confiável para o processamento de dados ETL.

**Principais melhorias:**

- ✅ Servidor estável e confiável
- ✅ Interface moderna e intuitiva
- ✅ Controle completo do processo
- ✅ Logs detalhados e informativos
- ✅ Feedback visual em tempo real

---

**Desenvolvido para ConectaBoi Insight** 🐄📊
