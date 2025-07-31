@echo off
echo ========================================
echo    Teste Rápido - ConectaBoi Insight
echo ========================================
echo.

REM Navegar para a pasta backend
cd /d "%~dp0backend"

REM Ativar ambiente virtual
call venv\Scripts\activate.bat

echo 🔍 Testando se o servidor está funcionando...
echo.

REM Teste simples
python simple_test.py

echo.
echo ========================================
echo 💡 Se o teste falhou, inicie o servidor primeiro:
echo    - Execute INICIAR_SERVIDOR.bat
echo    - Ou: python start_server.py
echo ========================================
echo.
pause 