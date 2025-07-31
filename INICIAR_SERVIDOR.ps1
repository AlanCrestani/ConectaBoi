# ConectaBoi Insight - Script de Inicialização do Servidor
# PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ConectaBoi Insight - Servidor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para a pasta backend
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host "📁 Diretório: $backendPath" -ForegroundColor Green

# Verificar se o ambiente virtual existe
$venvPath = Join-Path $backendPath "venv"
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

if (-not (Test-Path $activateScript)) {
    Write-Host "❌ Ambiente virtual não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Criando ambiente virtual..." -ForegroundColor Yellow
    
    try {
        python -m venv venv
        Write-Host "✅ Ambiente virtual criado com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao criar ambiente virtual: $_" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# Ativar ambiente virtual
Write-Host "✅ Ativando ambiente virtual..." -ForegroundColor Green
& $activateScript

# Verificar se as dependências estão instaladas
$requirementsPath = Join-Path $backendPath "requirements.txt"
if (-not (Test-Path $requirementsPath)) {
    Write-Host "❌ Arquivo requirements.txt não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências se necessário
Write-Host "🔧 Verificando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt | Out-Null

# Iniciar o servidor
Write-Host ""
Write-Host "🚀 Iniciando servidor Flask..." -ForegroundColor Green
Write-Host "📊 ConectaBoi Insight - Sistema de ETL para Confinamentos" -ForegroundColor Cyan
Write-Host "🌐 API disponível em: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🔍 Health check: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para parar o servidor, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    python start_server.py
}
catch {
    Write-Host "❌ Erro ao iniciar servidor: $_" -ForegroundColor Red
}
finally {
    Write-Host ""
    Write-Host "👋 Servidor parado." -ForegroundColor Green
    Read-Host "Pressione Enter para sair"
} 