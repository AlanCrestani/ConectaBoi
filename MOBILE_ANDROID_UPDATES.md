# 🚀 **ATUALIZAÇÕES PARA APLICATIVO ANDROID - CONTROLE DE COMBUSTÍVEL**

## 📋 **RESUMO DAS ALTERAÇÕES**

Foram implementadas novas funcionalidades de **Controle de Combustível** na aplicação web. O agente Android deve implementar as mesmas funcionalidades no aplicativo Flutter.

## 🆕 **NOVAS FUNCIONALIDADES IMPLEMENTADAS**

### **1. Dashboard Atualizado**

- ✅ **Novos cards de métricas** no Dashboard principal:
  - Consumo de Combustível (L/dia)
  - Custo de Combustível (R$/dia)
- ✅ **Novo card de navegação** para "Controle de Combustível"
- ✅ **Rota adicionada**: `/combustivel`

### **2. Página de Controle de Combustível**

- ✅ **Interface completa** com tabs organizadas
- ✅ **Cards de resumo** com métricas principais
- ✅ **Tabela de lançamentos** com filtros
- ✅ **Relatórios** por equipamento
- ✅ **Sistema de alertas** configurável

## 📊 **ESTRUTURA DE DADOS NECESSÁRIA**

### **Tabelas a serem criadas no Supabase:**

```sql
-- Tabela principal de lançamentos de combustível
CREATE TABLE public.combustivel_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo_combustivel TEXT NOT NULL, -- 'Diesel S10', 'Gasolina', 'Etanol'
  quantidade_litros DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  equipamento TEXT NOT NULL,
  operador TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  mobile_synced_at TIMESTAMPTZ,
  mobile_created_at TIMESTAMPTZ
);

-- Tabela de configurações de alertas
CREATE TABLE public.combustivel_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL, -- 'consumo_diario', 'custo_diario', 'preco_unitario'
  valor_limite DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de equipamentos
CREATE TABLE public.combustivel_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confinamento_id UUID NOT NULL REFERENCES public.confinamentos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'Trator', 'Caminhão', 'Gerador', 'Outros'
  modelo TEXT,
  ano_fabricacao INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### **Índices para performance:**

```sql
-- Índices para consultas mobile
CREATE INDEX idx_combustivel_lancamentos_confinamento_data ON public.combustivel_lancamentos(confinamento_id, data DESC);
CREATE INDEX idx_combustivel_lancamentos_equipamento ON public.combustivel_lancamentos(confinamento_id, equipamento);
CREATE INDEX idx_combustivel_alertas_user ON public.combustivel_alertas(user_id, ativo);
CREATE INDEX idx_combustivel_equipamentos_confinamento ON public.combustivel_equipamentos(confinamento_id, ativo);
```

## 📱 **FUNCIONALIDADES PARA IMPLEMENTAR NO FLUTTER**

### **1. Dashboard Mobile**

```dart
// Adicionar ao Dashboard principal
Widget buildCombustivelCards() {
  return Column(
    children: [
      Card(
        child: ListTile(
          leading: Icon(Icons.local_gas_station, color: Colors.orange),
          title: Text('Consumo Combustível'),
          subtitle: Text('${consumoDiario} L/dia'),
          trailing: _getStatusBadge(consumoDiario, 1000),
        ),
      ),
      Card(
        child: ListTile(
          leading: Icon(Icons.attach_money, color: Colors.green),
          title: Text('Custo Combustível'),
          subtitle: Text('R\$ ${custoDiario}/dia'),
          trailing: _getStatusBadge(custoDiario, 5000),
        ),
      ),
    ],
  );
}
```

### **2. Página de Controle de Combustível**

```dart
class ControleCombustivelPage extends StatefulWidget {
  @override
  _ControleCombustivelPageState createState() => _ControleCombustivelPageState();
}

class _ControleCombustivelPageState extends State<ControleCombustivelPage> {
  // Estados
  List<LancamentoCombustivel> lancamentos = [];
  ResumoCombustivel resumo = ResumoCombustivel();
  bool isLoading = true;

  // Controllers para filtros
  TextEditingController filtroDataController = TextEditingController();
  TextEditingController filtroEquipamentoController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Controle de Combustível'),
        backgroundColor: Colors.orange,
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _novoLancamento,
          ),
        ],
      ),
      body: DefaultTabController(
        length: 3,
        child: Column(
          children: [
            // Cards de resumo
            _buildResumoCards(),

            // Tabs
            TabBar(
              tabs: [
                Tab(text: 'Lançamentos'),
                Tab(text: 'Relatórios'),
                Tab(text: 'Alertas'),
              ],
            ),

            Expanded(
              child: TabBarView(
                children: [
                  _buildLancamentosTab(),
                  _buildRelatoriosTab(),
                  _buildAlertasTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### **3. Modelos de Dados Flutter**

```dart
// models/lancamento_combustivel.dart
class LancamentoCombustivel {
  final String id;
  final DateTime data;
  final String tipoCombustivel;
  final double quantidadeLitros;
  final double precoUnitario;
  final double valorTotal;
  final String equipamento;
  final String operador;
  final String? observacoes;
  final String confinamentoId;
  final DateTime? mobileSyncedAt;
  final DateTime? mobileCreatedAt;

  LancamentoCombustivel({
    required this.id,
    required this.data,
    required this.tipoCombustivel,
    required this.quantidadeLitros,
    required this.precoUnitario,
    required this.valorTotal,
    required this.equipamento,
    required this.operador,
    this.observacoes,
    required this.confinamentoId,
    this.mobileSyncedAt,
    this.mobileCreatedAt,
  });

  factory LancamentoCombustivel.fromJson(Map<String, dynamic> json) {
    return LancamentoCombustivel(
      id: json['id'],
      data: DateTime.parse(json['data']),
      tipoCombustivel: json['tipo_combustivel'],
      quantidadeLitros: json['quantidade_litros'].toDouble(),
      precoUnitario: json['preco_unitario'].toDouble(),
      valorTotal: json['valor_total'].toDouble(),
      equipamento: json['equipamento'],
      operador: json['operador'],
      observacoes: json['observacoes'],
      confinamentoId: json['confinamento_id'],
      mobileSyncedAt: json['mobile_synced_at'] != null
        ? DateTime.parse(json['mobile_synced_at']) : null,
      mobileCreatedAt: json['mobile_created_at'] != null
        ? DateTime.parse(json['mobile_created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'data': data.toIso8601String().split('T')[0],
      'tipo_combustivel': tipoCombustivel,
      'quantidade_litros': quantidadeLitros,
      'preco_unitario': precoUnitario,
      'valor_total': valorTotal,
      'equipamento': equipamento,
      'operador': operador,
      'observacoes': observacoes,
      'confinamento_id': confinamentoId,
      'mobile_synced_at': mobileSyncedAt?.toIso8601String(),
      'mobile_created_at': mobileCreatedAt?.toIso8601String(),
    };
  }
}

// models/resumo_combustivel.dart
class ResumoCombustivel {
  final double consumoDiario;
  final double custoDiario;
  final double consumoMensal;
  final double custoMensal;
  final double mediaPreco;
  final String equipamentoMaisConsumo;

  ResumoCombustivel({
    this.consumoDiario = 0,
    this.custoDiario = 0,
    this.consumoMensal = 0,
    this.custoMensal = 0,
    this.mediaPreco = 0,
    this.equipamentoMaisConsumo = '',
  });

  factory ResumoCombustivel.fromJson(Map<String, dynamic> json) {
    return ResumoCombustivel(
      consumoDiario: json['consumo_diario']?.toDouble() ?? 0,
      custoDiario: json['custo_diario']?.toDouble() ?? 0,
      consumoMensal: json['consumo_mensal']?.toDouble() ?? 0,
      custoMensal: json['custo_mensal']?.toDouble() ?? 0,
      mediaPreco: json['media_preco']?.toDouble() ?? 0,
      equipamentoMaisConsumo: json['equipamento_mais_consumo'] ?? '',
    );
  }
}
```

### **4. Serviços de API**

```dart
// services/combustivel_service.dart
class CombustivelService {
  final SupabaseClient _supabase;

  CombustivelService(this._supabase);

  // Buscar lançamentos
  Future<List<LancamentoCombustivel>> getLancamentos({
    String? confinamentoId,
    DateTime? dataInicio,
    DateTime? dataFim,
    String? equipamento,
  }) async {
    try {
      var query = _supabase
          .from('combustivel_lancamentos')
          .select('*');

      if (confinamentoId != null) {
        query = query.eq('confinamento_id', confinamentoId);
      }

      if (dataInicio != null) {
        query = query.gte('data', dataInicio.toIso8601String().split('T')[0]);
      }

      if (dataFim != null) {
        query = query.lte('data', dataFim.toIso8601String().split('T')[0]);
      }

      if (equipamento != null && equipamento.isNotEmpty) {
        query = query.ilike('equipamento', '%$equipamento%');
      }

      final response = await query.order('data', ascending: false);

      return (response as List)
          .map((json) => LancamentoCombustivel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Erro ao buscar lançamentos: $e');
    }
  }

  // Salvar novo lançamento
  Future<void> salvarLancamento(LancamentoCombustivel lancamento) async {
    try {
      await _supabase
          .from('combustivel_lancamentos')
          .insert(lancamento.toJson());
    } catch (e) {
      throw Exception('Erro ao salvar lançamento: $e');
    }
  }

  // Buscar resumo
  Future<ResumoCombustivel> getResumo(String confinamentoId) async {
    try {
      final hoje = DateTime.now().toIso8601String().split('T')[0];

      // Lançamentos do dia
      final lancamentosHoje = await _supabase
          .from('combustivel_lancamentos')
          .select('quantidade_litros, valor_total')
          .eq('confinamento_id', confinamentoId)
          .eq('data', hoje);

      double consumoDiario = 0;
      double custoDiario = 0;

      for (var lancamento in lancamentosHoje) {
        consumoDiario += lancamento['quantidade_litros'] ?? 0;
        custoDiario += lancamento['valor_total'] ?? 0;
      }

      // Lançamentos do mês
      final inicioMes = DateTime(DateTime.now().year, DateTime.now().month, 1);
      final lancamentosMes = await _supabase
          .from('combustivel_lancamentos')
          .select('quantidade_litros, valor_total, preco_unitario')
          .eq('confinamento_id', confinamentoId)
          .gte('data', inicioMes.toIso8601String().split('T')[0]);

      double consumoMensal = 0;
      double custoMensal = 0;
      double totalPrecos = 0;
      int countPrecos = 0;

      for (var lancamento in lancamentosMes) {
        consumoMensal += lancamento['quantidade_litros'] ?? 0;
        custoMensal += lancamento['valor_total'] ?? 0;
        if (lancamento['preco_unitario'] != null) {
          totalPrecos += lancamento['preco_unitario'];
          countPrecos++;
        }
      }

      final mediaPreco = countPrecos > 0 ? totalPrecos / countPrecos : 0;

      return ResumoCombustivel(
        consumoDiario: consumoDiario,
        custoDiario: custoDiario,
        consumoMensal: consumoMensal,
        custoMensal: custoMensal,
        mediaPreco: mediaPreco,
      );
    } catch (e) {
      throw Exception('Erro ao buscar resumo: $e');
    }
  }
}
```

### **5. Funcionalidades Mobile-Specific**

```dart
// Funcionalidades específicas para mobile
class CombustivelMobileFeatures {
  // Sincronização offline
  Future<void> syncOfflineData() async {
    // Implementar sincronização com SQLite
  }

  // Notificações push para alertas
  Future<void> setupPushNotifications() async {
    // Configurar notificações para alertas de combustível
  }

  // Captura de foto do abastecimento
  Future<String?> captureFuelPhoto() async {
    // Implementar captura de foto
  }

  // GPS para localização do abastecimento
  Future<Map<String, double>?> getLocation() async {
    // Implementar captura de GPS
  }
}
```

## 🎯 **PRIORIDADES DE IMPLEMENTAÇÃO**

### **Fase 1 (Semana 1-2):**

1. ✅ **Criar tabelas** no Supabase
2. ✅ **Implementar modelos** de dados Flutter
3. ✅ **Criar serviços** de API
4. ✅ **Adicionar cards** no Dashboard

### **Fase 2 (Semana 3-4):**

1. ✅ **Implementar página** de Controle de Combustível
2. ✅ **Criar formulário** de novo lançamento
3. ✅ **Implementar filtros** e busca
4. ✅ **Adicionar relatórios** básicos

### **Fase 3 (Semana 5-6):**

1. ✅ **Implementar sincronização** offline
2. ✅ **Adicionar notificações** push
3. ✅ **Implementar captura** de foto
4. ✅ **Adicionar GPS** para localização

## 📱 **UI/UX MOBILE**

### **Cores e Temas:**

```dart
// Cores específicas para combustível
class CombustivelColors {
  static const primary = Color(0xFFFF9800); // Laranja
  static const secondary = Color(0xFFFF5722); // Laranja escuro
  static const accent = Color(0xFFFFEB3B); // Amarelo
  static const background = Color(0xFFFFF3E0); // Laranja claro
}
```

### **Ícones Sugeridos:**

- 🛢️ **Combustível**: `Icons.local_gas_station`
- 💰 **Custo**: `Icons.attach_money`
- 📊 **Relatórios**: `Icons.bar_chart`
- ⚠️ **Alertas**: `Icons.warning`
- 📷 **Foto**: `Icons.camera_alt`
- 📍 **Localização**: `Icons.location_on`

## 🔄 **SINCRONIZAÇÃO COM WEB**

### **Dados compartilhados:**

- ✅ **Lançamentos** sincronizados entre web e mobile
- ✅ **Alertas** configuráveis em ambas plataformas
- ✅ **Relatórios** consistentes
- ✅ **Métricas** do Dashboard atualizadas

### **Funcionalidades mobile-exclusive:**

- 📷 **Captura de foto** do abastecimento
- 📍 **GPS** para localização
- 🔔 **Notificações push** para alertas
- 📱 **Interface otimizada** para touch

## 📋 **CHECKLIST PARA IMPLEMENTAÇÃO**

- [ ] Criar tabelas no Supabase
- [ ] Implementar modelos de dados Flutter
- [ ] Criar serviços de API
- [ ] Adicionar cards no Dashboard
- [ ] Implementar página de Controle de Combustível
- [ ] Criar formulário de lançamento
- [ ] Implementar filtros e busca
- [ ] Adicionar relatórios
- [ ] Implementar sincronização offline
- [ ] Adicionar notificações push
- [ ] Implementar captura de foto
- [ ] Adicionar GPS
- [ ] Testes de integração
- [ ] Documentação final

---

**🎯 OBJETIVO:** Implementar controle completo de combustível no aplicativo Android, mantendo sincronização com a aplicação web e adicionando funcionalidades mobile-exclusive.
