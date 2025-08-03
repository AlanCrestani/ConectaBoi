# ConectaBoi Backend API

## 🚀 Production-Ready Backend para Sistema de Gestão de Confinamento

### 📋 Visão Geral

Backend enterprise-grade desenvolvido em Node.js/Express/TypeScript para o sistema ConectaBoi, oferecendo APIs robustas para gestão de confinamento, controle de combustível, sincronização mobile e dashboards em tempo real.

### 🏗️ Arquitetura

```
backend/
├── src/
│   ├── controllers/     # Business logic controllers
│   ├── middleware/      # Security & auth middleware
│   ├── routes/v1/       # API endpoints
│   ├── services/        # Business services
│   ├── validation/      # Input validation schemas
│   ├── database/        # Database connections
│   ├── websocket/       # Real-time sync
│   ├── monitoring/      # Prometheus metrics
│   ├── logging/         # Structured logging
│   ├── health/          # Health checks
│   └── config/          # Configuration management
├── logs/                # Application logs
├── tests/               # Test suites
└── docs/                # API documentation
```

### 🔐 Segurança Enterprise

- **JWT Authentication** com Supabase
- **Role-Based Access Control** (RBAC)
- **Rate Limiting** (100 req/min standard, 500 req/5min sync)
- **SQL Injection Protection**
- **XSS Protection**
- **CORS Configuration** para produção
- **Security Headers** (Helmet.js)
- **Input Validation** (Joi schemas)

### ⚡ Performance

- **Response Compression** (gzip)
- **Multi-level Caching** (Redis)
- **Database Connection Pooling**
- **Load Balancing** ready
- **Auto-scaling** configuration
- **Performance Monitoring** (Prometheus)

### 📊 Monitoring

- **Health Checks** (live/ready/detailed)
- **Structured Logging** (Winston)
- **Metrics Collection** (Prometheus)
- **Error Tracking**
- **Performance Benchmarks**

### 🚀 Deploy

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Testes
npm test
```

### 📈 Health Checks

```bash
# Health completo
curl http://localhost:3000/health

# Liveness probe
curl http://localhost:3000/health/live

# Readiness probe
curl http://localhost:3000/health/ready

# Métricas Prometheus
curl http://localhost:3000/metrics
```

### 🔗 APIs Principais

#### Confinamentos

- `GET /api/v1/confinamentos` - Listar confinamentos
- `POST /api/v1/confinamentos` - Criar confinamento
- `PUT /api/v1/confinamentos/:id` - Atualizar confinamento
- `DELETE /api/v1/confinamentos/:id` - Deletar confinamento

#### Combustível

- `GET /api/v1/combustivel/lancamentos` - Listar lançamentos
- `POST /api/v1/combustivel/lancamentos` - Criar lançamento
- `GET /api/v1/combustivel/equipamentos` - Listar equipamentos

#### Dashboard

- `GET /api/v1/dashboard/overview` - Métricas gerais
- `GET /api/v1/dashboard/charts/:type` - Dados para gráficos

#### Mobile Sync

- `POST /api/v1/mobile/sync/batch-upload` - Upload em lote
- `GET /api/v1/mobile/sync/incremental-download` - Download incremental
- `POST /api/v1/mobile/sync/resolve-conflicts` - Resolver conflitos

### 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:prod

# Testes de integração
npm run test:integration

# Load testing
npm run test:load
```

### 📊 Métricas de Performance

- **Response Time P95:** < 500ms (CRUD), < 2000ms (sync)
- **Throughput:** 500+ requests/second
- **Concurrent Users:** 1000+
- **Uptime:** 99.9%
- **Error Rate:** < 0.1%

### 🔧 Configuração

#### Variáveis de Ambiente Obrigatórias

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# JWT
JWT_SECRET=your_jwt_secret_here

# CORS
WEB_APP_URL=http://localhost:8080
```

#### Configuração de Produção

```bash
# Docker
docker build -t conectaboi-backend .
docker run -p 3000:3000 conectaboi-backend

# Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### 📚 Documentação

- **OpenAPI 3.0:** `/docs` (quando implementado)
- **Postman Collection:** Disponível no projeto
- **Error Codes:** Documentados em `/docs/errors`

### 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar TypeScript
npm run build

# Desenvolvimento com hot reload
npm run dev

# Linting
npm run lint
npm run lint:fix
```

### 🔍 Troubleshooting

#### Problemas Comuns

1. **Erro de conexão com Supabase**

   - Verificar `SUPABASE_URL` e `SUPABASE_ANON_KEY`
   - Verificar conectividade de rede

2. **Rate limiting**

   - Verificar logs para identificar IP
   - Ajustar configurações de rate limiting

3. **Performance lenta**
   - Verificar métricas em `/metrics`
   - Analisar logs de requests lentos

### 📞 Suporte

- **Issues:** GitHub Issues
- **Documentação:** `/docs`
- **Logs:** `logs/` directory
- **Métricas:** `/metrics` endpoint

### 🎯 Roadmap

- [ ] WebSocket real-time sync
- [ ] Advanced caching strategies
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment

---

**ConectaBoi Backend Team**  
**Versão:** 1.0.0  
**Última atualização:** 02/08/2025
