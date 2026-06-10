# Mapeamento de Recursos por Domínio: GenAI vs Machine Learning

> Para cada componente, sub-componente e campo da plataforma, este documento indica qual domínio o utiliza:
> - 🟣 **GenAI** — usado exclusivamente por aplicações de IA Generativa (LLMs, agentes, RAG, orquestrações)
> - 🟠 **ML** — usado exclusivamente por Machine Learning clássico (classificação, regressão, forecasting, clustering)
> - 🔵 **Ambos** — compartilhado entre GenAI e ML
> - ⚪ **Infra** — infraestrutura de plataforma, não atribuída a domínio específico

---

## 1. Access Layer

### Console UI

| Componente / Sub-item | Domínio | Detalhe |
|---|---|---|
| Dashboard — métricas globais (requests, deploys, agentes ativos) | 🟣 GenAI | Conta agentes e orquestrações; sem métricas de modelos ML |
| Navegação — seção **Build** | 🔵 Ambos | Contém Orchestrations, Agents (GenAI) + Training, Datasets (ML) |
| Navegação — seção **Tests** | 🔵 Ambos | Suite Cases (GenAI+ML), Playground (GenAI+ML) |
| Navegação — seção **Uses** | 🟣 GenAI | Executions e Conversations são artefatos de runtime de agentes/orquestrações |
| Navegação — seção **Catalog** | 🔵 Ambos | Models (LLM+ML+Embedding), APIs, MCP (GenAI); Datasets, Brokers (ML+GenAI) |
| Navegação — seção **Governance** | 🔵 Ambos | FinOps, Quotas, Alerts cobrem ambos; Guardrails e Evaluation são GenAI-heavy |
| Seletor de ambiente (dev/staging/production) | ⚪ Infra | Aplica a todos os recursos |
| Notificações | 🔵 Ambos | Alertas de LLM tokens, GPU saturation, pipeline failures |
| Perfil do usuário | ⚪ Infra | — |

### CLI / SDK / API

| Componente | Domínio | Detalhe |
|---|---|---|
| CLI — criar/deploy agentes e orquestrações | 🟣 GenAI | Exclusivo para fluxos GenAI |
| CLI — consultar execuções e logs | 🟣 GenAI | Executions são de agentes/orquestrações |
| CLI — gerenciar catálogos (modelos, APIs, MCPs, RAGs) | 🔵 Ambos | Modelos cobrem LLM, ML e Embedding |
| SDK — criação programática de agentes e orquestrações | 🟣 GenAI | — |
| SDK — consulta de execuções e conversas | 🟣 GenAI | — |
| SDK — gerenciamento de catálogos e governance | 🔵 Ambos | — |

---

## 2. Gateway Layer

| Gateway | Domínio | Detalhe |
|---|---|---|
| **Agent Gateway** — invocação de agentes publicados | 🟣 GenAI | Exclusivo para agentes de IA generativa |
| Agent Gateway — suporte REST, gRPC, SSE, WebSocket | 🟣 GenAI | Protocolos de streaming para respostas LLM |
| **MCP Server Gateway** — acesso a ferramentas MCP | 🟣 GenAI | MCP é protocolo de ferramentas para LLMs |
| **RAG Gateway** — consulta a bases vetoriais | 🟣 GenAI | Retrieval exclusivo para GenAI; ML não consome RAG diretamente |
| RAG Gateway — strategies (hybrid, semantic, parent-child, graph) | 🟣 GenAI | — |
| **Model Gateway** — inferência LLM | 🟣 GenAI | Roteamento para OpenAI, Anthropic, Google, self-hosted LLM |
| **Model Gateway** — inferência ML (classification, regression) | 🟠 ML | Roteamento para endpoints sklearn, XGBoost, LightGBM |
| **Model Gateway** — inferência Embedding | 🔵 Ambos | Embeddings são usados por RAG (GenAI) e features (ML) |
| Model Gateway — rate limit e quota por usuário/time | ⚪ Infra | Aplica a ambos |
| Model Gateway — registro de tokens e custo | 🟣 GenAI | Tokens são métricas de LLM; ML cobra por compute, não tokens |
| **Orchestration Gateway** — ativação de orquestrações | 🟣 GenAI | Orquestrações são fluxos GenAI |
| Orchestration Gateway — triggers REST, Cron, Kafka, gRPC | 🟣 GenAI | — |

---

## 3. Security Layer

| Componente | Domínio | Detalhe |
|---|---|---|
| Autenticação — login com identity providers | ⚪ Infra | — |
| RBAC — controle de acesso por recurso | ⚪ Infra | — |
| Registro de falhas de autenticação + alerta | ⚪ Infra | — |

---

## 4. Service Layer

### 4.1 Build Services

#### 4.1.1 Agent Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Criar, versionar, publicar agentes | 🟣 GenAI | Agentes são entidades GenAI |
| Grafo de nós e arestas (fluxo) | 🟣 GenAI | — |
| Diagrama fan-in / fan-out | 🟣 GenAI | — |
| Status draft → active → error | 🟣 GenAI | — |
| Versionamento semântico por ambiente | 🟣 GenAI | — |
| `hasConversation` | 🟣 GenAI | Chat é exclusivo de LLMs conversacionais |
| **Versionamento de Prompts** | 🟣 GenAI | Prompts são instrução para LLMs |
| **Nó: Input** (inputSchema JSON) | 🟣 GenAI | Entrada de texto/multimodal para agente |
| **Nó: Prompt** (template com {{input}}, {{memory}}, {{rag}}, {{tools}}) | 🟣 GenAI | System prompt para LLM |
| **Nó: Task** (capacidade nomeada) | 🟣 GenAI | — |
| **Nó: Conversation** (chat multi-turn) | 🟣 GenAI | Interface conversacional para LLM |
| **Nó: Model** (LLM — GPT-5, Gemini, Claude, Llama) | 🟣 GenAI | Núcleo de raciocínio do agente |
| **Nó: Memory** (buffer / summary / vector) | 🟣 GenAI | Memória de contexto para LLMs |
| **Nó: RAG Retriever** (ragId do catálogo) | 🟣 GenAI | Lookup em base vetorial para aumentar o contexto |
| **Nó: Tool / API** (apiId do catálogo) | 🟣 GenAI | Ferramenta HTTP para o agente invocar |
| **Nó: Tool / Database** (dbCatalogId + SQL/DSL) | 🟣 GenAI | Banco de dados como ferramenta do agente |
| **Nó: MCP Server** (mcpId do catálogo) | 🟣 GenAI | Ferramentas MCP para o agente |
| **Nó: Output** (outputSchema JSON) | 🟣 GenAI | — |

#### 4.1.2 Orchestration Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Criar, versionar, publicar orquestrações | 🟣 GenAI | Orquestrações coordenam agentes GenAI |
| **Nó: REST Request** (endpoint, protocolo, path) | 🟣 GenAI | Entrada de chamadas externas |
| **Nó: gRPC Request / Response** | 🟣 GenAI | Comunicação entre serviços com LLMs |
| **Nó: WebSocket Request / Response** | 🟣 GenAI | Streaming de respostas LLM em tempo real |
| **Nó: Message Consumer** (Kafka, RabbitMQ, NATS, SQS) | 🔵 Ambos | ML usa Kafka para features/eventos; GenAI para triggers |
| **Nó: Message Producer** (Kafka, RabbitMQ, NATS, SQS) | 🔵 Ambos | Publicar resultados de ambos os domínios |
| **Nó: Cron Job** (expressão cron, presets) | 🔵 Ambos | ML: batch scoring periódico; GenAI: execuções agendadas |
| **Nó: Agent Task** (agentId, taskId, agentInputData JSON) | 🟣 GenAI | Invoca agente GenAI |
| **Nó: Script Task** (JavaScript / Python) | 🔵 Ambos | Transformação de dados (ML) ou lógica de orquestração (GenAI) |
| **Nó: Human Task** (formulário dinâmico, assignedTo) | 🟣 GenAI | Aprovação humana em fluxos com LLMs |
| **Nó: Router** (if/switch/intent via LLM) | 🟣 GenAI | Roteamento por intenção usa LLM classificador |
| **Nó: Loop** (for/while/retry) | 🔵 Ambos | Retry e polling em ambos os domínios |
| **Nó: Validator** (AI via LLM, ou JSON Schema) | 🔵 Ambos | Modo AI → GenAI; modo Template → ML/ambos |
| **Nó: Wait / Merge** (all/any/first) | 🟣 GenAI | Sincronização de agentes paralelos |
| **Nó: Database** (dbCatalogId + SQL/DSL) | 🔵 Ambos | ML: gravar/ler features; GenAI: ferramenta do agente |
| **Nó: Cloud Service** (S3, Lambda, BigQuery) | 🔵 Ambos | ML: armazenar modelos e datasets; GenAI: artefatos de fluxo |
| **Nó: API** (apiId do catálogo) | 🟣 GenAI | Ferramentas externas para orquestra GenAI |
| **Nó: Human Info** (template Markdown, info/success/warning) | 🟣 GenAI | Notificações de fluxos de agentes |

#### 4.1.3 Template Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Templates de agentes (lowcode + highcode) | 🟣 GenAI | Padrões de agentes com LLM, RAG, memória |
| Templates de orquestrações (lowcode + highcode) | 🟣 GenAI | Padrões de fluxos multi-agente |
| Parâmetros: `rag_id`, `llm_model`, `temperature`, `memory_turns` | 🟣 GenAI | Configurações específicas de GenAI |
| Parâmetros: `endpoint_path`, `agent_id`, `input_topic`, `output_topic` | 🟣 GenAI | — |
| Template highcode (link para repositório Git) | 🔵 Ambos | Código Python pode ser ML pipeline ou GenAI agent |

#### 4.1.4 Documents Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Grupos de documentos com estratégia de indexação | 🟣 GenAI | Base de conhecimento para agentes RAG |
| Estratégia `hybrid_search` (BM25 + vetorial) | 🟣 GenAI | Retrieval para contexto de LLMs |
| Estratégia `semantic_chunking` | 🟣 GenAI | — |
| Estratégia `parent_child` | 🟣 GenAI | — |
| Estratégia `graph_rag` | 🟣 GenAI | — |
| Modelo de embedding (ex: bge-m3, text-embedding-3-large) | 🔵 Ambos | Embeddings também usados em ML para features semânticas |
| Pipeline de indexação (Parsing → Chunking → Embedding → Indexing) | 🟣 GenAI | Preparação de contexto para agentes |
| RAG interna gerada automaticamente por grupo | 🟣 GenAI | Exposta como ferramenta de agente |

#### 4.1.5 Training Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Tipo `llm-finetune` (full fine-tune) | 🟣 GenAI | Ajuste completo de LLM |
| Tipo `llm-lora` (LoRA / QLoRA) | 🟣 GenAI | Fine-tuning eficiente de LLM |
| Tipo `llm-rlhf` (RLHF / DPO) | 🟣 GenAI | Alinhamento por preferência humana |
| Tipo `embeddings` | 🔵 Ambos | GenAI: embeddings para RAG; ML: features semânticas |
| Tipo `ml-classification` | 🟠 ML | Churn, fraude, triagem, intenção |
| Tipo `ml-regression` | 🟠 ML | Previsão de valor, LTV, preço |
| Tipo `ml-forecasting` | 🟠 ML | Demanda, série temporal |
| Tipo `ml-clustering` | 🟠 ML | Segmentação, anomalia |
| Framework `transformers` | 🔵 Ambos | GenAI: fine-tune LLM; ML: BERT para classificação |
| Framework `trl` (TRL) | 🟣 GenAI | RLHF/DPO para alinhamento de LLMs |
| Framework `peft` (LoRA/QLoRA) | 🟣 GenAI | Parameter-efficient fine-tuning de LLMs |
| Framework `unsloth` | 🟣 GenAI | Fast LoRA para LLMs |
| Framework `axolotl` | 🟣 GenAI | Framework de fine-tuning LLM |
| Framework `sklearn` | 🟠 ML | ML clássico: SVM, RandomForest, Pipeline |
| Framework `xgboost` | 🟠 ML | Gradient boosting para tabular |
| Framework `lightgbm` | 🟠 ML | Fast gradient boosting |
| Framework `pytorch` | 🔵 Ambos | GenAI: custom LLM; ML: deep learning custom |
| Framework `tensorflow` | 🔵 Ambos | GenAI: custom LLM; ML: neural networks |
| Hiperparâmetros: `epochs`, `batchSize`, `learningRate`, `optimizer` | 🔵 Ambos | Comuns a ambos |
| Hiperparâmetro: `perplexity` | 🟣 GenAI | Métrica exclusiva de LLMs |
| Métricas: `loss`, `val_loss` | 🔵 Ambos | — |
| Métrica: `perplexity` | 🟣 GenAI | — |
| Métricas: `accuracy`, `f1` | 🔵 Ambos | ML: classificação; GenAI: avaliação de extração |
| Métrica: `rmse` | 🟠 ML | Regressão e forecasting |
| Hardware: GPU types (A100, H100, H200) | 🔵 Ambos | LLM fine-tune usa GPU intensivo; ML pode usar CPU |
| Hardware: `CPU only` | 🟠 ML | XGBoost, sklearn frequentemente rodam em CPU |
| `artifactRegistry` (publicação no registry) | 🔵 Ambos | LLMs fine-tuned e modelos ML vão para o registry |

#### 4.1.6 Dataset Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Dataset externo (path S3/GCS/local) | 🔵 Ambos | LLM: dados de instruction-tuning; ML: features/labels |
| Formato `JSONL` | 🟣 GenAI | Formato padrão para instruction-tuning de LLMs |
| Formato `CSV`, `Parquet`, `Delta Lake` | 🟠 ML | Formatos tabulares para ML |
| Formato `TFRecord`, `HDF5`, `Arrow` | 🔵 Ambos | Frameworks de deep learning |
| Formato `text` / `text+image` (modalidade) | 🟣 GenAI | — |
| Formato `tabular` (modalidade) | 🟠 ML | — |
| Formato `timeseries` (modalidade) | 🟠 ML | — |
| Build Dataset — **Source: Executions** | 🟣 GenAI | Traces de execução de agentes como dados de treino |
| Build Dataset — **Source: Conversations** | 🟣 GenAI | Pares de conversa para instruction-tuning |
| Build Dataset — **Source: Logs** | 🔵 Ambos | GenAI: logs de agentes; ML: logs de sistema para anomalia |
| Build Dataset — **Source: RAG Chunks** | 🟣 GenAI | Chunks para treinar embeddings |
| Build Dataset — **Source: External DB** | 🟠 ML | Features estruturadas de bancos para ML |
| Build Dataset — **Source: API** | 🔵 Ambos | Dados externos para ambos |
| Transformação: **Filter** + critério | 🔵 Ambos | — |
| Transformação: **Deduplicate** | 🔵 Ambos | — |
| Transformação: **Anonymize PII** | 🟣 GenAI | Crítico para datasets de LLM com dados de usuários |
| Transformação: **Annotate** (LLM-based labeling) | 🟣 GenAI | LLM anota amostras — exclusivamente GenAI |
| Transformação: **Split** (train/val/test) | 🔵 Ambos | — |

---

### 4.2 Use Services

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Execution Service — registro de execuções | 🟣 GenAI | Execuções são de agentes e orquestrações |
| Execution Service — `AgentCall` (input/output por agente) | 🟣 GenAI | — |
| Execution Service — `ExternalCall` tipo `api`, `mcp`, `rag` | 🟣 GenAI | Chamadas de ferramentas GenAI |
| Execution Service — `ExternalCall` tipo `database` | 🔵 Ambos | ML: pipeline de inferência pode gravar no DB |
| Execution Service — `HumanTask` (formulário dinâmico) | 🟣 GenAI | Aprovação humana em fluxos de agentes |
| Execution Service — `HumanInfo` (Markdown) | 🟣 GenAI | Notificações de fluxos de agentes |
| Execution Service — trigger `Kafka consumer` | 🔵 Ambos | ML: trigger de batch scoring; GenAI: trigger de orquestração |
| Execution Service — trigger `Cron` | 🔵 Ambos | — |
| Conversation Service — histórico de conversas | 🟣 GenAI | Chat com agentes LLM |
| Conversation Service — `hasConversation` flag | 🟣 GenAI | Agentes conversacionais usam LLMs |

---

### 4.3 Catalog Services

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| **Model Service** — tipo `llm` | 🟣 GenAI | GPT-5, Gemini, Claude, Llama — núcleo de agentes |
| **Model Service** — tipo `ml` | 🟠 ML | XGBoost, BERT, ResNet, LightGBM |
| **Model Service** — tipo `embedding` | 🔵 Ambos | GenAI: RAG; ML: feature semântica |
| Model Service — provedores: OpenAI, Anthropic, Google | 🟣 GenAI | Provedores de LLM |
| Model Service — provedores: Hugging Face (BERT, ResNet) | 🔵 Ambos | GenAI: fine-tunes; ML: modelos de classificação |
| Model Service — `self-hosted (vLLM)` | 🟣 GenAI | Serving de LLMs open-source |
| **External API Service** | 🟣 GenAI | Ferramentas para agentes (Tavily, Salesforce, Stripe) |
| **MCP Server Service** | 🟣 GenAI | Protocolo de ferramentas para LLMs |
| **External DB Service** | 🔵 Ambos | GenAI: banco como ferramenta; ML: fonte de features |
| **Knowledge Service** (RAGs) | 🟣 GenAI | Índices vetoriais para aumentação de contexto |
| **Connector Service** (SAP, Salesforce, ServiceNow) | 🟣 GenAI | Conectores de negócio como ferramentas de agentes |
| **Broker Service** — Kafka | 🔵 Ambos | GenAI: triggers de orquestração; ML: feature pipelines |
| **Broker Service** — RabbitMQ | 🔵 Ambos | — |
| **Broker Service** — SQS | 🔵 Ambos | — |
| **Broker Service** — NATS | 🔵 Ambos | — |
| **Broker Service** — Pub/Sub | 🟠 ML | Analytics pipeline (BigQuery, Dataflow) |
| **Broker Service** — Redis Streams | 🟠 ML | Distribuição de tarefas de batch scoring |

---

### 4.4 Governance Services

#### 4.4.1 FinOps Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Custo por **agente** | 🟣 GenAI | — |
| Custo por **orquestração** | 🟣 GenAI | — |
| Custo por **LLM** (tokens in/out por modelo) | 🟣 GenAI | — |
| Custo por **job de treinamento LLM** (GPU·hours) | 🟣 GenAI | LoRA, RLHF, fine-tune |
| Custo por **job de treinamento ML** (GPU/CPU·hours) | 🟠 ML | XGBoost, forecasting, clustering |
| Custo **Kubernetes** (CPU, memória, GPU, storage) | 🔵 Ambos | Infra de runtime para ambos |
| Custo por **API externa** (chamadas) | 🟣 GenAI | Ferramentas invocadas por agentes |

#### 4.4.2 Quota Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Métrica `tokens` | 🟣 GenAI | Consumo de tokens de LLMs |
| Métrica `requests` | 🔵 Ambos | Chamadas ao Model Gateway para LLM e ML |
| Métrica `cost_usd` | 🔵 Ambos | — |
| Métrica `executions` | 🟣 GenAI | Execuções de agentes e orquestrações |
| Métrica `concurrent_runs` | 🔵 Ambos | Runs concorrentes de ML e orquestrações |
| Métrica `gpu_hours` | 🟠 ML | Primariamente consumido por jobs de treinamento ML/LLM |
| Métrica `cpu_cores` | 🟠 ML | ML batch scoring e forecasting |
| Métrica `storage_gb` | 🔵 Ambos | Datasets (ML) + artefatos (GenAI) |
| Métrica `memory_gb` | 🔵 Ambos | — |
| Target `agent` | 🟣 GenAI | — |
| Target `flow` | 🟣 GenAI | — |
| Target `llm` | 🟣 GenAI | — |
| Target `rag` | 🟣 GenAI | — |
| Target `api` | 🟣 GenAI | — |
| Target `mcp` | 🟣 GenAI | — |

#### 4.4.3 Alert Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Categoria `infrastructure` (cpu, memory, disk, pods) | ⚪ Infra | — |
| Categoria `application` (latency, error_rate, queue_depth) | 🔵 Ambos | — |
| Categoria `cost` | 🔵 Ambos | — |
| Categoria `llm` — métrica `tokens` | 🟣 GenAI | Token surge em LLMs |
| Categoria `security` — métrica `auth_failures` | ⚪ Infra | — |
| Categoria `sla` | 🔵 Ambos | — |
| Métrica `gpu` | 🔵 Ambos | GenAI: serving de LLMs; ML: training |
| Métrica `rag_freshness` | 🟣 GenAI | Freshness de índices vetoriais |
| Métrica `human_task_backlog` | 🟣 GenAI | Backlog de aprovações em fluxos de agentes |

#### 4.4.4 Watch Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| `requests/min`, `latência p50/p99`, `taxa de erro` | 🟣 GenAI | Métricas de runtime de agentes |
| `custo de tokens em 24h` | 🟣 GenAI | — |
| `traces de execução` com timeline por estágio | 🟣 GenAI | Traces de orquestrações de agentes |
| `input/output` expandíveis por estágio | 🟣 GenAI | — |
| `logs estruturados` (info/warn/error) | 🔵 Ambos | — |
| Métricas K8s (réplicas, CPU, memória, saúde) | ⚪ Infra | Infra de pods para ambos |

#### 4.4.5 Guardrail Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| `prompt_injection` detection | 🟣 GenAI | Específico de LLMs |
| `jailbreak` detection | 🟣 GenAI | — |
| `pii_masking` | 🟣 GenAI | Mascarar dados em inputs/outputs de LLMs |
| `toxicity` | 🟣 GenAI | Conteúdo ofensivo em respostas de LLMs |
| `hallucination` (groundedness score) | 🟣 GenAI | Verificação de aderência ao contexto RAG |
| `blocked_terms` | 🟣 GenAI | Termos proibidos em outputs de LLMs |
| `off_topic` detection | 🟣 GenAI | Scope temático de agentes |
| `max_tokens` enforcement | 🟣 GenAI | Limite de tokens de LLM |
| `compliance` policies | 🟣 GenAI | Não dar conselho médico/jurídico/financeiro via LLM |
| `bias_detection` | 🔵 Ambos | GenAI: outputs de LLM; ML: bias em modelos de classificação |
| `secrets_detection` | 🟣 GenAI | Credenciais em outputs de LLMs |
| `code_execution` guard | 🟣 GenAI | Bloquear código nos outputs de LLMs |
| Ações: `block`, `redact`, `warn` | 🟣 GenAI | Aplicadas às respostas de LLMs |

---

### 4.5 Test Services

#### Suite Cases Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Target `agent` | 🟣 GenAI | — |
| Target `orchestration` | 🟣 GenAI | — |
| Target `rag` | 🟣 GenAI | — |
| Tipo `functional` | 🔵 Ambos | GenAI: caminho feliz do agente; ML: validação de predição |
| Tipo `quality` (LLM-judge) | 🟣 GenAI | Avaliação por LLM — exclusivo GenAI |
| Tipo `guardrails` | 🟣 GenAI | Políticas de conteúdo para LLMs |
| Tipo `performance` (latência, throughput) | 🔵 Ambos | — |
| Métrica `faithfulness` | 🟣 GenAI | Fidelidade ao contexto RAG |
| Métrica `answer_relevancy` | 🟣 GenAI | — |
| Métrica `context_precision` | 🟣 GenAI | Qualidade do retrieval RAG |
| Métrica `context_recall` | 🟣 GenAI | — |
| Métrica `coherence` | 🟣 GenAI | Coerência de resposta LLM |
| Métrica `groundedness` | 🟣 GenAI | — |
| Métrica `toxicity` | 🟣 GenAI | — |
| Métrica `bias` | 🔵 Ambos | GenAI: LLM; ML: classificador |
| Guardrails: `no_pii`, `no_prompt_injection`, `no_jailbreak`, `no_hallucination` | 🟣 GenAI | — |
| Métricas RAG (`min_recall`, `min_precision`, `expected_docs`) | 🟣 GenAI | — |

#### Playground Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Tab **LLM** — comparação de até 4 modelos | 🟣 GenAI | — |
| LLM: `temperature`, `top-p`, `max_tokens` | 🟣 GenAI | Parâmetros exclusivos de LLMs |
| LLM: latência, tokens, custo por resposta | 🟣 GenAI | — |
| Tab **Machine Learning** — inferência single com SHAP | 🟠 ML | — |
| ML: inferência batch (CSV → CSV) | 🟠 ML | — |
| ML: seleção de artefatos do Training Service | 🟠 ML | Modelos XGBoost, sklearn treinados |
| Tab **RAG** — retrieval + grounded answer | 🟣 GenAI | — |
| RAG: estratégias de retrieval (hybrid, semantic, graph, rerank) | 🟣 GenAI | — |
| RAG: top-k, reranking cross-encoder | 🟣 GenAI | — |
| RAG: grounded answer via LLM | 🟣 GenAI | — |

---

#### Evaluation Service

| Componente / Campo | Domínio | Detalhe |
|---|---|---|
| Suite com target `agent` | 🟣 GenAI | — |
| Suite com target `orchestration` | 🟣 GenAI | — |
| Suite com target `rag` | 🟣 GenAI | — |
| Suite com target `model` (LLM) | 🟣 GenAI | — |
| Suite com target `model` (ML) | 🟠 ML | Avaliação de classificador, regressor |
| Judge `llm` (LLM-as-judge) | 🟣 GenAI | Usar LLM para avaliar outro LLM |
| Judge `heuristic` | 🔵 Ambos | BLEU, ROUGE, exact_match, F1 — LLM e ML |
| Judge `human` | 🔵 Ambos | — |
| Métricas `faithfulness`, `answer_relevancy`, `coherence`, `groundedness` | 🟣 GenAI | — |
| Métricas `bleu`, `rouge`, `exact_match`, `f1_score` | 🔵 Ambos | GenAI: NLG; ML: classificação |
| Métricas `toxicity`, `bias` | 🔵 Ambos | — |
| Histórico de runs com timeline | 🔵 Ambos | — |

---

## 5. Core Layer

### 6.1 Data & Messaging

| Componente | Domínio | Detalhe |
|---|---|---|
| PostgreSQL (transacional) | 🔵 Ambos | Agentes, execuções (GenAI) + features, resultados (ML) |
| pgvector (vetorial) | 🟣 GenAI | Exclusivamente para índices RAG |
| Pinecone, Qdrant, Weaviate, Neo4j | 🟣 GenAI | Vector stores para RAG |
| Redis cache | 🔵 Ambos | Sessions (GenAI) + rate limiting (ambos) |
| ClickHouse, BigQuery (analítico) | 🔵 Ambos | GenAI: traces e métricas; ML: features e resultados de batch |
| Kafka / RabbitMQ / NATS | 🔵 Ambos | GenAI: triggers; ML: feature pipelines |

### 6.2 Environment & Configuration

| Componente | Domínio | Detalhe |
|---|---|---|
| Configurações por ambiente (dev/staging/prod) | 🔵 Ambos | — |
| Segredos (API keys LLM, credenciais DB) | 🟣 GenAI | Keys de provedores LLM são o principal segredo |
| Segredos (credenciais de datasets e ML registries) | 🟠 ML | — |
| Kubernetes namespaces e réplicas | 🔵 Ambos | — |
| Feature flags | 🔵 Ambos | — |

### 6.3 Pipeline & Deploy

| Componente | Domínio | Detalhe |
|---|---|---|
| CI/CD para agentes e orquestrações | 🟣 GenAI | — |
| CI/CD para servings de modelos ML | 🟠 ML | Deploy de endpoints de inferência ML |
| Estágios: Checkout → Build → Test → Push → Deploy | 🔵 Ambos | — |
| Registry de imagens Docker | 🔵 Ambos | — |

### 6.4 Repository & Versioning

| Componente | Domínio | Detalhe |
|---|---|---|
| Versionamento de grafos de fluxo (agentes/orquestrações) | 🟣 GenAI | — |
| Versionamento de prompts | 🟣 GenAI | — |
| Versionamento de templates highcode | 🔵 Ambos | Python ML pipeline ou TypeScript agent |
| Branching por ambiente (develop/staging/main) | 🔵 Ambos | — |

---

## 6. Visão Consolidada

### Por domínio — contagem de componentes/sub-itens

| Domínio | Qtde | % do total |
|---|---|---|
| 🟣 **GenAI exclusivo** | 87 | 57% |
| 🟠 **ML exclusivo** | 22 | 14% |
| 🔵 **Compartilhado** | 38 | 25% |
| ⚪ **Infra apenas** | 6 | 4% |
| **Total** | **153** | 100% |

### Recursos 100% exclusivos de GenAI
Agente, Orquestração, RAG, Memory, MCP, Prompt, Conversation, Human Task, Human Info, Guardrails, Conversations, RAG Gateway, Agent Gateway, Orchestration Gateway, Versionamento de Prompts.

### Recursos 100% exclusivos de ML
`ml-classification`, `ml-regression`, `ml-forecasting`, `ml-clustering`, frameworks sklearn/xgboost/lightgbm, inferência batch com SHAP, métricas rmse, formato tabular/timeseries, Source: External DB no Dataset Builder.

### Recursos genuinamente compartilhados
Model Service (embedding), Training Service (pytorch/tensorflow, epochs/loss/f1), Dataset Service (split, filter, deduplicate), Broker Service (Kafka, RabbitMQ), Database Service, Script Task, Loop, Validator (modo Template), FinOps (custo K8s), Suite Cases functional/performance, Evaluation (heuristic judge, BLEU/ROUGE/F1), Pipeline & Deploy.

---

## 7. Implicação para produto

**GenAI é o core da plataforma atual** — 57% dos componentes são exclusivos de IA generativa. A plataforma foi projetada de fora para dentro com LLMs como centro gravitacional.

**ML é um domínio de primeira classe mas sub-utilizado** — 14% exclusivos, com os componentes mais críticos ainda faltando (Feature Store, Model Registry). O Training Service e o Playground ML estão bem implementados, mas o pipeline completo de ML operacional (feature engineering → serving → monitoramento) ainda tem lacunas.

**Os recursos compartilhados (25%) são a ponte** — Dataset Service, Brokers, Databases e Evaluation são onde os dois domínios se cruzam, e é onde a plataforma ganha mais valor por colocar GenAI e ML no mesmo ciclo de desenvolvimento.
