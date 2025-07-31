@echo off
echo ========================================
echo    ConectaBoi Insight - Servidor
echo ========================================
echo.

REM Navegar para a pasta backend
cd /d "%~dp0backend"

REM Verificar se o ambiente virtual existe
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Ambiente virtual não encontrado!
    echo.
    echo 🔧 Criando ambiente virtual...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Erro ao criar ambiente virtual!
        pause
        exit /b 1
    )
)

REM Ativar ambiente virtual
echo ✅ Ativando ambiente virtual...
call venv\Scripts\activate.bat

REM Verificar se as dependências estão instaladas
if not exist "requirements.txt" (
    echo ❌ Arquivo requirements.txt não encontrado!
    pause
    exit /b 1
)

REM Instalar dependências se necessário
echo 🔧 Verificando dependências...
pip install -r requirements.txt >nul 2>&1

REM Iniciar o servidor
echo.
echo 🚀 Iniciando servidor Flask...
echo 📊 ConectaBoi Insight - Sistema de ETL para Confinamentos
echo 🌐 API disponível em: http://localhost:5000
echo 🔍 Health check: http://localhost:5000/api/health
echo.
echo 💡 Para parar o servidor, pressione Ctrl+C
echo ========================================
echo.

python start_server.py

echo.
echo 👋 Servidor parado.
pause 