# Inspire — Especificação de Requisitos de Negócio

## 1. Visão Geral

Inspire é uma plataforma low-code para design, deploy e observabilidade de agentes de IA colaborativos. Permite que equipes criem, configurem e monitorem fluxos multi-agente e agentes individuais através de uma interface visual, sem necessidade de codificação.

---

## 2. Personas

| Persona | Descrição |
|---|---|
| AI Engineer | Projeta e configura agentes individuais e orquestrações multi-agente |
| Platform Admin | Gerencia catálogos de LLMs, APIs, MCP Servers e RAGs disponíveis para a organização |
| Team Lead | Acompanha status, métricas e deploys dos fluxos da sua equipe |
| DevOps Engineer | Gerencia pipelines CI/CD e ambientes Kubernetes |

---

## 3. Módulos Funcionais

### 3.1 Gestão de Orquestrações

Orquestrações são fluxos que coordenam múltiplos agentes através de endpoints, filas, bancos de dados e serviços externos.

**Requisitos:**
- O sistema deve permitir listar todas as orquestrações com nome, versão, status (ativo/rascunho/erro), time responsável e quantidade de agentes referenciados
- O sistema deve permitir criar uma nova orquestração a partir de um editor visual ou via assistente de IA
- O sistema deve permitir visualizar o detalhe de uma orquestração com:
  - Metadados (nome, descrição, versão, time, responsável, tags)
  - Diagrama fan-in/fan-out mostrando origens de entrada e destinos de saída
  - Lista de agentes referenciados com link para o detalhe de cada agente
  - Pipeline de CI/CD e status de deploy
  - Métricas de observabilidade
- O sistema deve permitir editar o fluxo de uma orquestração via editor visual drag-and-drop
- O sistema deve permitir salvar, compartilhar e fazer deploy de uma orquestração

### 3.2 Gestão de Agentes

Agentes são unidades individuais compostas por um LLM, memória, bases de conhecimento (RAG) e ferramentas.

**Requisitos:**
- O sistema deve permitir listar todos os agentes com nome, versão, status, time e quantidade de RAGs vinculados
- O sistema deve permitir criar um novo agente a partir de um editor visual ou via assistente de IA
- O sistema deve permitir visualizar o detalhe de um agente com:
  - Metadados (nome, descrição, versão, time, responsável, tags)
  - Diagrama fan-in/fan-out mostrando entradas e saídas do agente
  - Lista de bases de conhecimento (RAGs) vinculadas
  - Pipeline de CI/CD e status de deploy
  - Métricas de observabilidade
- O sistema deve permitir editar a composição de um agente via editor visual drag-and-drop
- O sistema deve permitir publicar, compartilhar e testar um agente

### 3.3 Editor Visual de Fluxos

O editor visual é o componente central da plataforma, usado tanto para orquestrações quanto para agentes.

**Requisitos:**
- O editor deve oferecer uma paleta lateral com componentes arrastáveis específicos para cada modo:
  - **Modo Orquestração:** Request, Cron Job, Agent, Coordination, Topic/Queue, Database, Cloud Service, External API, MCP Server, Response
  - **Modo Agente:** Input, Prompt, LLM Model, Memory, RAG Retriever, Tool/API, MCP Server, Response
- O editor deve permitir arrastar componentes da paleta para o canvas
- O editor deve permitir conectar componentes com arestas direcionais
- O editor deve permitir selecionar um componente para editar suas propriedades no painel lateral
- O editor deve permitir excluir componentes e conexões
- O editor deve oferecer controles de zoom, pan e minimap para navegação
- O editor deve exibir indicador de salvamento automático
- O editor deve oferecer botão de validação do fluxo
- O editor deve oferecer botão de deploy/teste do fluxo

### 3.4 Propriedades dos Componentes

Cada tipo de componente possui propriedades configuráveis específicas.

**Requisitos:**
- **Request:** protocolo (REST, GraphQL, gRPC, SSE, WebSocket), path, autenticação
- **Cron Job:** expressão cron, timezone, presets pré-definidos
- **Agent (referência):** seleção de agente publicado no catálogo
- **Coordination:** estratégia (paralelo, router, sequencial, debate)
- **Topic/Queue:** tipo (Kafka, RabbitMQ, NATS), nome do tópico, partições
- **Database:** tipo (PostgreSQL, MySQL, MongoDB, Redis, etc.), operação
- **Cloud Service:** provedor (AWS, GCP, Azure), serviço, região
- **External API:** seleção de API do catálogo, método HTTP
- **MCP Server:** seleção de servidor MCP do catálogo, transporte (stdio/http)
- **Prompt:** template com variáveis (input, memory, rag, tools), instruções de sistema
- **LLM Model:** seleção de modelo do catálogo, temperatura, contexto
- **Memory:** tipo (buffer, summary, vector), janela de contexto
- **RAG Retriever:** seleção de índice do catálogo, estratégia de busca
- **Tool/API:** seleção de API do catálogo
- **Response:** formato de saída (SSE, WebSocket, JSON)

### 3.5 Assistente de IA

O assistente de IA auxilia na criação de fluxos a partir de descrições em linguagem natural.

**Requisitos:**
- O assistente deve estar disponível como painel lateral no editor visual
- O assistente deve aceitar descrições em linguagem natural (português e inglês)
- O assistente deve gerar automaticamente nós e conexões no canvas com base na descrição
- O assistente deve oferecer sugestões contextuais pré-definidas para cada modo (agente/orquestração)
- O assistente deve manter histórico de mensagens na sessão
- O assistente deve informar a quantidade de nós e conexões gerados
- O assistente deve permitir refinamento iterativo do fluxo gerado

### 3.6 Catálogo de LLMs

Registro centralizado de modelos de linguagem disponíveis para uso nos agentes.

**Requisitos:**
- O sistema deve permitir listar todos os LLMs registrados com nome, provedor, custo, latência e status
- O sistema deve permitir registrar novos modelos com metadados de provedor, custo e performance
- O sistema deve suportar modelos de provedores externos (Google, OpenAI, Anthropic) e self-hosted
- Os modelos registrados devem estar disponíveis para seleção no editor visual de agentes

### 3.7 Catálogo de APIs

Registro de integrações HTTP (externas e internas) que agentes podem utilizar como ferramentas.

**Requisitos:**
- O sistema deve permitir listar todas as APIs com nome, descrição, tipo de autenticação, endpoints e status
- O sistema deve permitir adicionar novas APIs com configuração de autenticação e endpoints
- O sistema deve suportar diferentes tipos de autenticação (API key, OAuth2, JWT, PAT, sem autenticação)
- As APIs registradas devem estar disponíveis para seleção no editor visual

### 3.8 Catálogo de MCP Servers

Registro de servidores Model Context Protocol que expõem catálogos de ferramentas.

**Requisitos:**
- O sistema deve permitir listar todos os MCP Servers com nome, transporte, quantidade de ferramentas e status
- O sistema deve permitir conectar novos servidores MCP
- O sistema deve suportar transportes stdio e HTTP
- Os servidores registrados devem estar disponíveis para seleção no editor visual

### 3.9 Catálogo de RAGs

Registro de índices vetoriais e híbridos utilizados como bases de conhecimento pelos agentes.

**Requisitos:**
- O sistema deve permitir listar todos os índices RAG com nome, tipo de store, quantidade de chunks, modelo de embedding e status
- O sistema deve permitir criar novos índices
- O sistema deve suportar diferentes stores vetoriais (pgvector, Pinecone, Qdrant, Weaviate)
- Os índices registrados devem estar disponíveis para seleção no editor visual de agentes

### 3.10 Pipeline e Deploy

Gestão de pipelines CI/CD e ambientes de deploy para orquestrações e agentes.

**Requisitos:**
- O sistema deve exibir pipelines ativas com estágios (Build, Test, Push, Deploy) e status de cada estágio
- O sistema deve exibir histórico de execuções de pipeline com trigger, commit, autor, duração e status
- O sistema deve exibir ambientes Kubernetes com:
  - Cluster, namespace e região
  - Réplicas (prontas/desejadas)
  - Uso de CPU e memória
  - Status de saúde (healthy/degraded/down)
  - Timestamp do último deploy
- O sistema deve permitir conectar repositório Git
- O sistema deve permitir fazer deploy e redeploy
- O sistema deve exibir métricas agregadas: réplicas ativas, ambientes, execuções em 24h, taxa de sucesso

### 3.11 Observabilidade

Monitoramento em tempo real de métricas, logs e traces das orquestrações e agentes.

**Requisitos:**
- O sistema deve exibir métricas em tempo real:
  - Requests por minuto
  - Latência p99
  - Taxa de erro
  - Gasto em 24h (custo de tokens)
- O sistema deve exibir gráfico de latência (p50 vs p99) nas últimas 24 horas
- O sistema deve exibir gráfico de uso de tokens (input vs output) nos últimos 12 dias
- O sistema deve exibir tabela de traces recentes com:
  - ID do trace, agente, duração, tokens consumidos, status (ok/error/warn), timestamp
  - Auto-refresh a cada 5 segundos
  - Indicador de streaming ativo

---

## 4. Requisitos Não-Funcionais

### 4.1 Usabilidade
- A interface deve ser responsiva e funcionar em desktop e tablet
- O editor visual deve suportar drag-and-drop fluido com feedback visual
- A navegação deve ser feita via sidebar colapsável com seções "Build" e "Catalog"
- O sistema deve oferecer indicadores visuais de status (cores: verde/ativo, amarelo/rascunho, vermelho/erro)

### 4.2 Organização
- Cada orquestração e agente deve pertencer a um time e ter um responsável
- O sistema deve suportar versionamento de orquestrações e agentes
- O sistema deve suportar tags para categorização

### 4.3 Colaboração
- O sistema deve permitir compartilhar orquestrações e agentes
- O sistema deve exibir informações de autoria nos históricos de pipeline

### 4.4 Extensibilidade
- O sistema deve permitir adicionar novos tipos de componentes ao editor visual
- Os catálogos (LLMs, APIs, MCPs, RAGs) devem ser extensíveis com novos itens
- O sistema deve suportar múltiplos provedores de cloud (AWS, GCP, Azure)

---

## 5. Fluxos de Negócio Principais

### 5.1 Criar uma Orquestração Multi-Agente
1. Usuário acessa a lista de orquestrações
2. Clica em "New orchestration"
3. No editor visual, arrasta componentes da paleta (Request, Agents, Queues, etc.)
4. Conecta os componentes com arestas
5. Configura propriedades de cada componente no painel lateral
6. Opcionalmente usa o assistente de IA para gerar o fluxo
7. Valida o fluxo
8. Salva e faz deploy

### 5.2 Criar um Agente Individual
1. Usuário acessa o catálogo de agentes
2. Clica em "New agent"
3. No editor visual, arrasta componentes (Input, Prompt, LLM, Memory, RAG, Tools, Response)
4. Conecta os componentes (hub-and-spoke: inputs → Prompt → LLM → Response)
5. Configura template do Prompt com variáveis
6. Seleciona LLM, RAGs e ferramentas dos catálogos
7. Testa o agente
8. Publica no catálogo para uso em orquestrações

### 5.3 Monitorar uma Orquestração em Produção
1. Usuário acessa o detalhe da orquestração
2. Visualiza o diagrama fan-in/fan-out
3. Acessa a aba "Observability"
4. Monitora métricas em tempo real (requests, latência, erros, custo)
5. Analisa traces recentes para identificar gargalos
6. Acessa a aba "Pipeline & Deploy" para verificar status dos ambientes
