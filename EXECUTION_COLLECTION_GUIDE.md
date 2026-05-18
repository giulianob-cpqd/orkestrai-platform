# Execution Collection - Guia de Implementação

## 📋 Visão Geral

**Execution Collection** é um novo componente na camada de observabilidade que coleta, armazena e disponibiliza logs de execução de flows. Permite que usuários visualizem o histórico completo de execuções de suas aplicações.

---

## 🏗️ Arquitetura

### Componentes

#### 1. Execution Collection (Collector)
- **Tipo**: Node.js Service
- **Função**: Coleta logs de execução
- **Recebe dados de**:
  - Deployed Applications (aplicações deployadas)
  - Flow Executor (orquestrador de flows)
  - LLM Gateway (chamadas a LLMs)
  - RAG Gateway (buscas semânticas)
  - External API Gateway (chamadas a APIs)
  - MCP Server Gateway (chamadas a MCP)

#### 2. Flow Executions API (Backend)
- **Tipo**: Node.js Service
- **Função**: Disponibiliza histórico de execuções
- **Integração**: Flow Engine
- **Acesso**: Frontend via Executions UI

#### 3. Executions UI (Frontend)
- **Tipo**: React Component
- **Função**: Exibe histórico de execuções
- **Dados**: Consulta Flow Executions API
- **Localização**: Menu principal da aplicação

---

## 📊 Fluxo de Dados

### Coleta de Logs

```
┌─────────────────────────────────────────────────────────────┐
│                    Execution Sources                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Flow Executor    │  │ Deployed App     │                │
│  │ - Orquestração   │  │ - Execução       │                │
│  │ - Nós            │  │ - Resultados     │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
│  ┌────────▼──────────┐  ┌───────▼──────────┐               │
│  │ LLM Gateway       │  │ RAG Gateway      │               │
│  │ - Chamadas LLM    │  │ - Buscas         │               │
│  │ - Tokens          │  │ - Resultados     │               │
│  └────────┬──────────┘  └───────┬──────────┘               │
│           │                     │                           │
│  ┌────────▼──────────┐  ┌───────▼──────────┐               │
│  │ External API GW   │  │ MCP Server GW    │               │
│  │ - Chamadas API    │  │ - Chamadas MCP   │               │
│  │ - Respostas       │  │ - Respostas      │               │
│  └────────┬──────────┘  └───────┬──────────┘               │
│           │                     │                           │
└───────────┼─────────────────────┼──────────────────────────┘
            │                     │
            └─────────┬───────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Execution Collection       │
        │  (Collector)                │
        │                             │
        │  - Recebe logs              │
        │  - Correlaciona com Trace ID│
        │  - Armazena histórico       │
        │  - Indexa por flow/execution│
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │  Flow Executions API        │
        │  (Backend)                  │
        │                             │
        │  - Consulta histórico       │
        │  - Filtra por critérios     │
        │  - Retorna dados formatados │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │  Executions UI              │
        │  (Frontend)                 │
        │                             │
        │  - Exibe histórico          │
        │  - Detalhes de execução     │
        │  - Logs estruturados        │
        │  - Correlação com traces    │
        └─────────────────────────────┘
```

---

## 📝 Estrutura de Dados

### Execution Log Entry

```json
{
  "executionId": "uuid",
  "flowId": "uuid",
  "flowName": "Customer Support Agent",
  "flowVersion": "1.0.0",
  "status": "completed|running|failed",
  "startTime": "2026-05-14T10:30:00Z",
  "endTime": "2026-05-14T10:30:45Z",
  "duration": 45000,
  "traceId": "trace-uuid",
  "userId": "user-uuid",
  "nodes": [
    {
      "nodeId": "node-1",
      "nodeName": "RAG Node",
      "nodeType": "rag",
      "status": "completed",
      "startTime": "2026-05-14T10:30:00Z",
      "endTime": "2026-05-14T10:30:10Z",
      "duration": 10000,
      "input": { "query": "..." },
      "output": { "results": [...] },
      "logs": [
        {
          "timestamp": "2026-05-14T10:30:00Z",
          "level": "info",
          "message": "Searching vector DB",
          "context": { "collection": "docs" }
        }
      ]
    },
    {
      "nodeId": "node-2",
      "nodeName": "LLM Node",
      "nodeType": "llm",
      "status": "completed",
      "startTime": "2026-05-14T10:30:10Z",
      "endTime": "2026-05-14T10:30:40Z",
      "duration": 30000,
      "input": { "prompt": "..." },
      "output": { "response": "..." },
      "metadata": {
        "provider": "openai",
        "model": "gpt-4",
        "tokens": { "input": 150, "output": 200 }
      },
      "logs": [
        {
          "timestamp": "2026-05-14T10:30:10Z",
          "level": "info",
          "message": "Calling OpenAI API",
          "context": { "model": "gpt-4" }
        }
      ]
    }
  ],
  "errors": [],
  "warnings": [],
  "metadata": {
    "environment": "production",
    "region": "us-east-1",
    "source": "deployed-app-1"
  }
}
```

---

## 🔌 Integração com Flow Engine

### Flow Executions API Endpoints

```
GET /api/flow-executions
  - Listar execuções
  - Query params: flowId, status, startDate, endDate, limit, offset
  - Response: Array de execuções

GET /api/flow-executions/:executionId
  - Detalhes de uma execução
  - Response: Execution log entry completo

GET /api/flow-executions/:executionId/nodes/:nodeId
  - Detalhes de um nó específico
  - Response: Node execution details

GET /api/flow-executions/:executionId/logs
  - Logs estruturados de uma execução
  - Query params: level, nodeId, limit
  - Response: Array de logs

GET /api/flow-executions/:executionId/trace
  - Correlação com OpenTelemetry trace
  - Response: Trace details
```

---

## 🎨 Executions UI - Tela de Execuções

### Funcionalidades

#### 1. Lista de Execuções
- Tabela com histórico de execuções
- Colunas: Flow Name, Status, Start Time, Duration, User
- Filtros: Flow, Status, Date Range
- Paginação: 20 execuções por página
- Ordenação: Por data (descendente por padrão)

#### 2. Detalhes de Execução
- Timeline visual dos nós
- Status de cada nó (completed, running, failed)
- Duração de cada nó
- Input/Output de cada nó
- Logs estruturados

#### 3. Visualização de Logs
- Logs por nó
- Filtro por nível (info, warning, error)
- Busca por texto
- Correlação com Trace ID (link para Grafana Tempo)

#### 4. Análise de Performance
- Gráfico de duração por nó
- Identificação de gargalos
- Comparação com execuções anteriores

---

## 🔄 Fluxo Completo de Execução

### Exemplo: Customer Support Agent

```
1. Usuário inicia flow
   ↓
2. Flow Executor começa orquestração
   ↓
3. Execution Collection recebe evento de início
   ↓
4. RAG Node executa
   → Envia logs para Execution Collection
   → Trace ID correlacionado
   ↓
5. LLM Node executa
   → Envia logs para Execution Collection
   → LangFuse rastreia chamada LLM
   ↓
6. Condition Node valida
   → Envia logs para Execution Collection
   ↓
7. Output Node retorna resultado
   → Envia logs para Execution Collection
   ↓
8. Flow Executor finaliza
   → Envia evento de conclusão
   ↓
9. Execution Collection armazena histórico completo
   ↓
10. Flow Executions API disponibiliza dados
    ↓
11. Usuário acessa Executions UI
    ↓
12. Visualiza:
    - Timeline de execução
    - Logs de cada nó
    - Duração total e por nó
    - Erros e warnings
    - Link para trace completo
```

---

## 💾 Armazenamento

### Backends Suportados

#### 1. MongoDB (Recomendado)
- Armazenamento de logs estruturados
- Indexação por executionId, flowId, traceId
- TTL para limpeza automática (ex: 30 dias)
- Escalabilidade horizontal

#### 2. PostgreSQL (Alternativa)
- Tabela de execuções
- JSONB para logs estruturados
- Índices para performance
- Backup e replicação

#### 3. ClickHouse (Analytics)
- Armazenamento de longo prazo
- Análise de padrões
- Agregações rápidas
- Compressão de dados

---

## 🔐 Segurança

### Controle de Acesso
- Usuários veem apenas suas próprias execuções
- Admins veem todas as execuções
- RBAC integrado com Gov Auth

### Retenção de Dados
- Logs: 30 dias (configurável)
- Histórico: 1 ano (configurável)
- Limpeza automática via TTL

### Conformidade
- Logs estruturados com Trace ID
- Auditoria de acesso
- Criptografia em trânsito (TLS)
- Criptografia em repouso (opcional)

---

## 📈 Monitoramento

### Métricas Coletadas

```
execution_collection.logs_received (counter)
  - Total de logs recebidos
  - Tags: source, flow_id, status

execution_collection.logs_stored (counter)
  - Total de logs armazenados
  - Tags: backend, flow_id

execution_collection.query_latency (histogram)
  - Latência de consultas
  - Tags: endpoint, status

execution_collection.storage_size (gauge)
  - Tamanho do armazenamento
  - Tags: backend, retention_days
```

---

## 🚀 Roadmap de Implementação

### Fase 1: MVP (Semanas 1-2)
- [ ] Execution Collection básico
- [ ] Flow Executions API
- [ ] Executions UI simples
- [ ] Armazenamento em MongoDB

### Fase 2: Enhancements (Semanas 3-4)
- [ ] Filtros avançados
- [ ] Busca por texto
- [ ] Correlação com traces
- [ ] Análise de performance

### Fase 3: Analytics (Semanas 5-6)
- [ ] Dashboards de execução
- [ ] Alertas de falhas
- [ ] Comparação de execuções
- [ ] Exportação de relatórios

### Fase 4: Otimização (Semanas 7-8)
- [ ] Compressão de logs
- [ ] Limpeza automática
- [ ] Replicação de dados
- [ ] Backup e recovery

---

## 📚 Referências

### Documentação
- [MongoDB Docs](https://docs.mongodb.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [ClickHouse Docs](https://clickhouse.com/docs/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)

### Ferramentas
- [Grafana Tempo](https://grafana.com/oss/tempo/)
- [Loki](https://grafana.com/oss/loki/)
- [Prometheus](https://prometheus.io/)

---

**Versão**: 1.0.0
**Data**: May 14, 2026
**Status**: ✅ Documentado e Pronto para Implementação
