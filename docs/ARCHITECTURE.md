# OrkestrAI - Arquitetura Distribuída Plugável

## 📋 Visão Geral

**OrkestrAI** é uma plataforma de orquestração de agentes IA distribuída, plugável e observável. A arquitetura é centrada em dois motores principais:

1. **Platform Engine** - Núcleo de acesso unificado a recursos (LLMs, RAGs, APIs, MCPs)
2. **Flow Engine** - Motor de design, compilação, execução e deploy de workflows

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  React 19 + TanStack Router + Module Federation             │
│  - Flow Designer (Visual Editor)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway & Orchestration                 │
│         Kong/Traefik + API Orchestrator                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Core Engines Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PLATFORM ENGINE (Núcleo)                           │   │
│  │  - LLM Gateway (Serpro, OpenAI, Google)             │   │
│  │  - RAG Gateway                                       │   │
│  │  - External API Gateway                             │   │
│  │  - MCP Server Gateway (Serpro MCP)                  │   │
│  │  - Resource Manager                                 │   │
│  │  - Auth Manager (Gov Auth)                          │   │
│  │  - Quota Manager                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FLOW ENGINE (Orquestração)                          │   │
│  │  - Flow Compiler                                     │   │
│  │  - Flow Executor                                     │   │
│  │  - Flow Deployer (Jenkins API)                       │   │
│  │  - Flow Environment (Kubernetes)                     │   │
│  │  - Flow Versioning (Git)                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Plugin Services (Extensões)                         │   │
│  │  - LLM Plugin                                        │   │
│  │  - RAG Plugin                                        │   │
│  │  - Workflow Plugin                                   │   │
│  │  - Analytics Plugin                                  │   │
│  │  - Observability Plugin (Grafana)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  PostgreSQL | MongoDB | Vector DB | Redis | S3 (MinIO)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Messaging & Events Layer                        │
│         Kafka (Event Streaming)                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            Observability & Security Layer                    │
│  OpenTelemetry | Prometheus | Grafana | Tempo | Loki        │
│  LangFuse | Gov Auth | Vault                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Platform Engine - Núcleo de Acesso a Recursos

### Responsabilidades

O **Platform Engine** fornece acesso unificado a todos os recursos externos e internos:

#### 1. LLM Gateway
- Acesso a três provedores LLM:
  - **Serpro LLM** - LLM governamental
  - **OpenAI LLM** - GPT-4, GPT-3.5
  - **Google LLM** - Gemini, PaLM
- Fallback automático entre provedores
- Token counting e cost tracking
- Streaming de respostas
- Quota management por usuário

#### 2. RAG Gateway
- Acesso a múltiplos Vector DBs: Weaviate, Pinecone, Milvus, Qdrant
- Lê configuração do PostgreSQL
- Busca semântica unificada
- Gerenciamento de collections
- Ranking de resultados

#### 3. External API Gateway
- Suporte a REST, GraphQL, SOAP
- Retry logic automático
- Error handling
- Timeout management
- Caching de respostas

#### 4. MCP Server Gateway
- Acesso a MCP Server da Serpro
- Tools, Resources, Prompts
- Integração com agentes IA

#### 5. Resource Manager
- Cache distribuído (Redis)
- Filas de processamento (Bull)
- Object storage (S3 via MinIO)
- Armazenamento em MongoDB
- Gerenciamento de recursos

#### 6. Auth Manager
- Autenticação centralizada (Gov Auth)
- Autorização por recurso
- Secrets management (Vault)
- Audit logging

#### 7. Quota Manager
- Quotas por usuário
- Quotas por serviço
- Throttling automático
- Monitoramento de uso

---

## 🚀 Flow Engine - Motor de Orquestração e Deploy

### Responsabilidades

O **Flow Engine** é responsável por compilação, execução e deploy de workflows:

#### 1. Flow Compiler
- Compilação de flows em planos de execução
- Validação de flows
- Otimização de execução
- Geração de código

#### 2. Flow Executor
- Execução de workflows compilados
- Orquestração de nós
- Gerenciamento de estado
- Error handling e retry logic
- Executa aplicações deployadas

#### 3. Flow Deployer
- Acessa API do Jenkins para deploy
- Deploy de flows como aplicações
- Escalabilidade automática
- Rollback de versões
- Gerenciamento de ciclo de vida

#### 4. Flow Environment
- Interage com Kubernetes
- Gerenciamento de ambientes
- Configuração de recursos
- Escalabilidade de pods
- Health checks

#### 5. Flow Versioning
- Controle de versão com Git
- Comparação entre versões
- Rollback automático
- Tags de versão

### Tipos de Nós Suportados

1. **LLM Node** - Chamadas a LLMs (Serpro, OpenAI, Google)
2. **RAG Node** - Busca semântica
3. **API Node** - Chamadas a APIs externas
4. **MCP Node** - Chamadas a MCP Server Serpro
5. **Condition Node** - If/else logic
6. **Loop Node** - Iteração
7. **Parallel Node** - Execução paralela
8. **Transform Node** - Transformação de dados

### Aplicação Deployada

- Uma única aplicação (flow) é deployada por vez
- Executada como Kubernetes Pod
- Acessa Platform Engine para recursos
- Envia métricas e traces para observabilidade

---

## 📊 Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **TanStack Router** - Roteamento
- **Module Federation** (Webpack 5) - Microfrontends
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Recharts** - Visualizações
- **XYFlow** - Visualização de flows
- **Flow Designer** - Editor visual de workflows (Frontend)

### Backend
- **Node.js** - Orchestration, Execution, Plugins
- **Python** - Agent Service, RAG, Analytics
- **Express/Fastify** - APIs
- **Bull** - Job queues

### Databases
- **PostgreSQL** - Dados estruturados, configurações RAG
- **MongoDB** - Dados não-estruturados, Resource Manager
- **Weaviate/Pinecone** - Vector DB para RAG
- **Redis** - Cache e filas
- **S3 (MinIO)** - Object storage
- **ClickHouse** - Data warehouse

### Messaging
- **Apache Kafka** - Event streaming

### External Services
- **Serpro LLM** - LLM governamental
- **OpenAI LLM** - GPT-4, GPT-3.5
- **Google LLM** - Gemini, PaLM
- **Serpro MCP Server** - Model Context Protocol
- **Gov Auth** - Autenticação governamental
- **Jenkins API** - Deploy automation

### Observability
- **OpenTelemetry** - Unified observability (traces, metrics, logs)
- **Prometheus** - Coleta de métricas
- **Grafana Tempo** - Distributed tracing
- **Loki** - Log aggregation
- **Grafana** - Visualização
- **LangFuse** - LLM observability (exporta para Prometheus e Tempo)

### Security & Auth
- **Gov Auth** - Identity provider
- **HashiCorp Vault** - Secrets management

### Infrastructure
- **Kubernetes** - Orquestração de containers
- **Docker** - Containerização
- **Helm** - Package manager
- **Terraform** - Infrastructure as Code
- **Git** - Flow versioning
- **Jenkins** - CI/CD e Deploy

---

## 🔄 Fluxo de Trabalho Completo

### 1. Design
```
User → Flow Designer UI
  ↓
Flow Designer (Platform Engine)
  ↓
Flow Definition (DAG)
  ↓
PostgreSQL
```

### 2. Compilação
```
Flow Definition
  ↓
Flow Compiler
  ↓
Validação + Otimização
  ↓
Compiled Flow
```

### 3. Deploy
```
Compiled Flow
  ↓
Flow Deployer
  ↓
Kubernetes Deployment
  ↓
Application Instance
```

### 4. Execução
```
Application Instance
  ↓
Flow Executor
  ↓
Platform Engine (LLM, RAG, API, MCP)
  ↓
External Resources
  ↓
Result + Observability
```

---

## 📈 Escalabilidade

### Horizontal
- ✅ Stateless services (múltiplas instâncias)
- ✅ Load balancing automático
- ✅ Database replication
- ✅ Cache clustering
- ✅ Message partitioning

### Vertical
- ✅ Resource limits (CPU, Memory)
- ✅ Auto-scaling (Kubernetes HPA)
- ✅ Database optimization
- ✅ Multi-level caching

---

## 🔐 Segurança

### Authentication
- Keycloak (OIDC/SAML)
- Multi-factor authentication
- Social login

### Authorization
- Role-based access control (RBAC)
- Fine-grained permissions
- API scopes

### Secrets Management
- HashiCorp Vault
- Automatic rotation
- Audit logging

### Network Security
- TLS/SSL (Let's Encrypt)
- Network policies
- Service mesh (Istio)
- WAF (ModSecurity)

---

## 📊 Observabilidade com OpenTelemetry

### Dados Coletados

#### 1. Traces (Rastreamento Distribuído)
- Trace ID (identificador único)
- Span ID (identificador do span)
- Parent Span ID (hierarquia)
- Timestamps (início e fim)
- Atributos (metadados)
- Eventos (marcos importantes)
- Status (sucesso/erro)

#### 2. Metrics (Métricas)
- **Counter**: Valor que só aumenta
- **Gauge**: Valor que pode aumentar ou diminuir
- **Histogram**: Distribuição de valores
- **Summary**: Percentis de valores

#### 3. Logs (Logs Estruturados)
- Mensagem de log
- Nível de severidade
- Timestamp
- Atributos (contexto)
- Trace ID (correlação)

#### 4. Baggage (Propagação de Contexto)
- Contexto propagado entre serviços
- User ID, Request ID, etc.

### Backends

#### Prometheus (Métricas)
- Time-series database
- Scraping de métricas
- Alerting rules
- Retenção configurável
- Recebe métricas do LangFuse

#### Grafana Tempo (Traces)
- Distributed tracing backend
- Armazenamento de traces
- Integração com Grafana
- Sampling configurável
- Recebe traces do LangFuse

#### Loki (Logs)
- Log aggregation
- Busca e análise
- Integração com Grafana
- Compressão de dados

#### Grafana (Visualização)
- Dashboards customizáveis
- Alertas visuais
- Integração com múltiplos backends
- RBAC
- Integração com Observability Plugin

#### LangFuse (LLM Observability)
- Rastreamento de chamadas LLM
- Exporta métricas para Prometheus
- Exporta traces para Grafana Tempo
- Análise de custos e performance

#### Execution Collection (Execução de Flows)
- Coleta logs de execução de flows
- Recebe dados de:
  - **Deployed Applications** - Logs de execução
  - **Gateways** - Logs de chamadas (LLM, RAG, API, MCP)
  - **Flow Executor** - Logs de orquestração
- Armazena histórico de execuções
- Disponibiliza via **Flow Executions** (Flow Engine)
- Exibe no frontend na tela de **Executions**
- Rastreamento completo de cada flow execution
- Correlação com Trace ID para debugging

#### AlertManager (Gerenciamento de Alertas)
- Recebe alertas do Prometheus
- Agrupa e deduplica alertas
- Roteia notificações
- Integra com plugins de alertas
- Salva configurações no PostgreSQL
- Suporta múltiplos canais de notificação

---

## 🔌 Sistema de Plugins

Cada plugin é uma unidade independente que acessa seus respectivos serviços:

```
Plugin = {
  Frontend: Microfrontend (React Component),
  Backend: Microservice (Node.js/Python),
  Storage: Dedicated Database/Store,
  Events: Pub/Sub via Event Bus,
  Access: Acessa serviços específicos
}
```

### Plugins Inclusos e Suas Integrações

| Plugin | Frontend | Backend | Acessa | Storage | Função |
|--------|----------|---------|--------|---------|--------|
| **LLM Integration** | React UI | Node.js/Python | LLM Gateway | PostgreSQL | Gerenciar provedores LLM (Serpro, OpenAI, Google) |
| **RAG System** | React UI | Python | RAG Gateway | Vector DB + PostgreSQL | Busca semântica com configuração |
| **Workflow Builder** | React UI | Node.js | Flow Compiler | PostgreSQL | Orquestração de workflows |
| **Analytics** | React UI | Node.js | PostgreSQL | ClickHouse | Análise de dados |
| **Observability** | React UI | Node.js | Grafana | Grafana + Execution Collection | Monitoramento e dashboards |
| **Alerts Management** | React UI | Node.js | AlertManager | PostgreSQL | Gerenciar alertas e notificações |

### Fluxo de Integração dos Plugins

```
Frontend (Plugin UI)
    ↓
Backend Plugin Service
    ↓
Serviço Específico (Gateway/Compiler/Database)
    ↓
Dados/Configurações
```

#### Exemplo: LLM Plugin
```
LLM Plugin UI
    ↓
LLM Plugin Backend
    ↓
LLM Gateway
    ↓
Serpro LLM / OpenAI / Google LLM
```

#### Exemplo: RAG Plugin
```
RAG Plugin UI
    ↓
RAG Plugin Backend
    ↓
RAG Gateway
    ↓
Vector DB (Weaviate/Pinecone)
```

#### Exemplo: Alerts Management Plugin
```
Alerts Management UI
    ↓
Alerts Management Plugin Backend
    ↓
AlertManager
    ↓
Prometheus (recebe alertas)
    ↓
PostgreSQL (salva configurações)
```

---

## 🚀 Deployment em Kubernetes

### Namespaces

```
orchestrai/
├── ingress-nginx/
│   ├── Ingress Controller
│   └── Cert Manager
├── api-gateway/
│   ├── Kong API Gateway
│   └── Kong DB
├── core-services/
│   ├── Orchestration Service
│   ├── Agent Service
│   ├── Execution Service
│   └── Plugin Registry
├── plugin-services/
│   ├── LLM Plugin
│   ├── RAG Plugin
│   ├── Workflow Plugin
│   └── Analytics Plugin
├── deployed-apps/
│   └── Deployed Flow App (única aplicação)
├── observability/
│   ├── OpenTelemetry Collector
│   ├── Prometheus
│   ├── Grafana Tempo
│   ├── Loki
│   └── Grafana
├── databases/
│   ├── PostgreSQL
│   ├── MongoDB
│   └── Redis
├── storage/
│   ├── S3 (MinIO)
│   └── Weaviate
├── messaging/
│   └── Kafka
└── security/
    ├── Gov Auth
    └── Vault
```

---

## 📋 Componentes Principais

### Platform Engine (7 componentes)
| Componente | Função |
|-----------|--------|
| **LLM Gateway** | Acesso a Serpro LLM, OpenAI LLM, Google LLM |
| **RAG Gateway** | Busca semântica com config do PostgreSQL |
| **External API Gateway** | Integração com APIs externas |
| **MCP Server Gateway** | Acesso a MCP Server Serpro |
| **Resource Manager** | Cache (Redis), Queues (Bull), Storage (S3/MongoDB) |
| **Auth Manager** | Autenticação Gov Auth e Autorização |
| **Quota Manager** | Controle de quotas por usuário/serviço |

### Flow Engine (5 componentes)
| Componente | Função |
|-----------|--------|
| **Flow Compiler** | Compilação e otimização |
| **Flow Executor** | Execução de workflows |
| **Flow Deployer** | Deploy via Jenkins API |
| **Flow Environment** | Gerenciamento Kubernetes |
| **Flow Versioning** | Controle de versão com Git |

### Frontend Components
| Componente | Função |
|-----------|--------|
| **Flow Designer** | Editor visual de workflows (Frontend) |
| **Plugin Management UI** | Gerenciamento de plugins |
| **Observability UI** | Dashboards Grafana |
| **Executions UI** | Tela de histórico de execuções |

### Observability Components
| Componente | Função |
|-----------|--------|
| **Execution Collection** | Coleta logs de execução de flows |
| **Flow Executions API** | API para acesso a histórico de execuções |
| **AlertManager** | Gerenciamento e roteamento de alertas |
| **OpenTelemetry Collector** | Coleta de traces, métricas e logs |
| **Prometheus** | Armazenamento de métricas |
| **Grafana Tempo** | Armazenamento de traces |
| **Loki** | Armazenamento de logs |
| **Grafana** | Visualização de dados |
| **LangFuse** | Observabilidade de LLM |

### Plugin Services (Backend)
| Plugin | Acessa | Storage | Função |
|--------|--------|---------|--------|
| **LLM Plugin** | LLM Gateway | PostgreSQL | Gerencia provedores LLM |
| **RAG Plugin** | RAG Gateway | PostgreSQL | Gerencia sistema RAG |
| **Workflow Plugin** | Flow Compiler | PostgreSQL | Estende tipos de nós |
| **Analytics Plugin** | PostgreSQL | ClickHouse | Análise de execuções |
| **Observability Plugin** | Grafana | Grafana | Integração com dashboards |
| **Alerts Management Plugin** | AlertManager | PostgreSQL | Gerencia alertas e notificações |

---

## 💰 Estimativa de Custos

### Infraestrutura (AWS)
- Kubernetes: ~$500-1000/mês
- Databases: ~$300-500/mês
- Storage: ~$100-200/mês
- Networking: ~$50-100/mês
- **Total**: ~$950-1800/mês

### LLM (Exemplo com OpenAI)
- GPT-4: ~$0.03/1K tokens
- GPT-3.5: ~$0.0005/1K tokens
- Varia conforme uso

---

## 🎯 Benefícios da Arquitetura

### Para Usuários
- ✅ Interface visual intuitiva
- ✅ Deploy com um clique
- ✅ Monitoramento em tempo real
- ✅ Fácil integração com LLMs e APIs
- ✅ Escalabilidade automática

### Para Desenvolvedores
- ✅ Arquitetura modular
- ✅ Fácil estender com plugins
- ✅ APIs bem definidas
- ✅ Exemplos e documentação
- ✅ Testes facilitados

### Para Operadores
- ✅ Escalabilidade automática
- ✅ Observabilidade completa
- ✅ Segurança por padrão
- ✅ Disaster recovery
- ✅ Gerenciamento simplificado

---

## 🔄 Exemplo Prático: Customer Support Agent

### 1. Design Flow (Frontend - Flow Designer)
```
Flow: "Customer Support Agent"

1. [Input Node]
   ↓
2. [RAG Node] - Buscar documentação relevante (config PostgreSQL)
   ↓
3. [LLM Node] - Gerar resposta com contexto (Serpro/OpenAI/Google)
   ↓
4. [Condition Node] - Resposta satisfatória?
   ├─ Sim → [Output Node]
   └─ Não → [API Node] - Escalar para humano
            ↓
            [Output Node]
```

### 2. Compilação
```
Flow Definition
  ↓
Validação: ✅ Todos os nós válidos
  ↓
Otimização: ✅ RAG e LLM podem ser paralelos
  ↓
Compiled Flow: ✅ Pronto para deploy
```

### 3. Deploy
```
Deploy Button
  ↓
Flow Deployer acessa Jenkins API
  ↓
Jenkins cria build e deploy
  ↓
Flow Environment gerencia Kubernetes
  ↓
1 Pod com aplicação iniciado
  ↓
Application running
```

### 4. Execução
```
User Input
  ↓
RAG Node: Busca documentação (PostgreSQL)
  ↓
LLM Node: Gera resposta (Serpro/OpenAI/Google)
  ↓
Condition Node: Valida resposta
  ↓
Output: Resposta ao usuário
  ↓
LangFuse: Rastreia LLM
  ↓
Prometheus: Recebe métricas
  ↓
Grafana Tempo: Recebe traces
```

### 5. Coleta de Execução
```
Durante a execução:
  ↓
Flow Executor → Execution Collection (logs)
RAG Gateway → Execution Collection (logs)
LLM Gateway → Execution Collection (logs)
Deployed App → Execution Collection (logs)
  ↓
Execution Collection armazena histórico
  ↓
Flow Executions API disponibiliza dados
  ↓
Executions UI exibe no frontend
  ↓
Usuário visualiza:
  - Status de cada nó
  - Logs de execução
  - Tempo de execução
  - Erros e warnings
  - Correlação com Trace ID
```

---

## 📚 Diagramas C4

Consulte os arquivos PlantUML para diagramas detalhados:

1. **ARCHITECTURE_CONTEXT.puml** - Diagrama de Contexto (Level 1)
2. **ARCHITECTURE_CONTAINERS.puml** - Diagrama de Containers (Level 2)
3. **ARCHITECTURE_COMPONENTS.puml** - Diagrama de Componentes (Level 3)

---

## 🚀 Roadmap de Implementação

### Fase 1: Core (Semanas 1-4)
- [ ] Setup de infraestrutura (Kubernetes)
- [ ] Implementar Platform Engine
- [ ] Setup de databases
- [ ] Implementar API Gateway

### Fase 2: Flow Engine (Semanas 5-8)
- [ ] Flow Designer
- [ ] Flow Compiler
- [ ] Flow Executor
- [ ] Flow Deployer

### Fase 3: Observabilidade (Semanas 9-12)
- [ ] OpenTelemetry Collector
- [ ] Prometheus + Grafana
- [ ] Grafana Tempo
- [ ] Loki

### Fase 4: Plugins (Semanas 13-16)
- [ ] LLM Plugin
- [ ] RAG Plugin
- [ ] Workflow Plugin
- [ ] Analytics Plugin

### Fase 5: Production (Semanas 17-20)
- [ ] Testes e otimização
- [ ] Security hardening
- [ ] Documentation
- [ ] Deploy em produção

---

## 📞 Recursos Úteis

### Documentação Oficial
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Docker Docs](https://docs.docker.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)

### Ferramentas
- [Kong API Gateway](https://konghq.com/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [Keycloak](https://www.keycloak.org/)

### Comunidades
- [CNCF](https://www.cncf.io/)
- [Kubernetes Community](https://kubernetes.io/community/)
- [OpenTelemetry Community](https://opentelemetry.io/community/)

---

**Versão**: 2.0.0 (Final)
**Data**: Maio 2026
**Status**: ✅ Completo e Pronto para Implementação

