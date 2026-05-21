# Platform Services Mapping

## Visão Geral

Mapeamento completo dos recursos implementados na plataforma de IA para os serviços definidos na arquitetura de longo prazo. O documento organiza os requisitos por camada arquitetural — Access, Gateway, Security, Service (Build, Test, Use, Catalog e Governance) e Core.

---

## Requisitos

### 1. Access Layer

#### 1.1 Console UI (Aplicação Web)

- O sistema deve exibir um dashboard principal com métricas globais da plataforma
- O sistema deve oferecer navegação lateral colapsável organizada nas seções: Overview, Build, Tests, Uses, Catalog e Governance
- Na seção **Catalog**, o sistema deve incluir os itens: Models, APIs, MCP Servers, Databases, RAGs, Datasets, **Build Dataset** e **Feature Store**
- O sistema deve suportar seleção de ambiente (dev / staging / production) de forma global e persistente
- O sistema deve exibir menu de notificações com eventos e alertas recentes
- O sistema deve oferecer perfil do usuário e configurações da conta

#### 1.2 CLI

- O sistema deve oferecer interface de linha de comando para criação e deploy de agentes e orquestrações
- O sistema deve oferecer comandos para consulta de execuções, logs e status de ambientes
- O sistema deve oferecer comandos para gerenciamento de catálogos (modelos LLM e ML, APIs, MCPs, RAGs, datasets)

#### 1.3 SDK / API

- O sistema deve expor API programática para criação e gerenciamento de agentes e orquestrações
- O sistema deve expor API para consulta de execuções e conversas
- O sistema deve expor API para gerenciamento de catálogos e governance
- O sistema deve oferecer SDK com clients tipados para as principais linguagens

---

### 2. Gateway Layer

#### 2.1 Agent Gateway

- O sistema deve expor endpoint unificado para invocação de agentes publicados
- O sistema deve suportar protocolos REST, gRPC, SSE e WebSocket
- O sistema deve rotear requisições para a versão correta do agente por ambiente
- O sistema deve aplicar autenticação e autorização antes de repassar ao agente

#### 2.2 MCP Server Gateway

- O sistema deve expor ponto de acesso unificado para os MCP Servers registrados (Filesystem, Slack, GitHub)
- O sistema deve suportar transportes stdio e HTTP para conexão com servidores MCP
- O sistema deve registrar chamadas a ferramentas MCP nas execuções

#### 2.3 RAG Gateway

- O sistema deve expor endpoint unificado para consulta às bases RAG (internas e externas)
- O sistema deve suportar os stores pgvector, Pinecone, Qdrant, Weaviate e Neo4j
- O sistema deve suportar estratégias hybrid_search, semantic_chunking, parent_child e graph_rag
- O sistema deve registrar chamadas RAG nas execuções com latência e resultado

#### 2.4 Model Gateway

- O sistema deve expor endpoint unificado para inferência nos modelos LLM, ML e Embedding cadastrados
- O sistema deve rotear requisições para os provedores: OpenAI, Google, Anthropic, Cohere, Voyage AI e self-hosted (vLLM)
- O sistema deve aplicar controles de quota e rate limit por usuário, time e fluxo
- O sistema deve registrar consumo de tokens e custo por chamada

#### 2.5 Orchestration Gateway

- O sistema deve expor endpoint unificado para ativação de orquestrações publicadas
- O sistema deve suportar triggers por REST, Cron, Kafka consumer e gRPC
- O sistema deve registrar execuções com rastreio completo de chamadas internas e externas

---

### 3. Security Layer

#### 3.1 Authentication & Authorization

- O sistema deve oferecer autenticação via página de login com suporte a identity providers
- O sistema deve controlar acesso às rotas e recursos da Console UI por perfil de usuário
- O sistema deve aplicar autorização nas APIs dos Gateways antes de encaminhar requisições
- O sistema deve registrar falhas de autenticação e disparar alerta ao atingir threshold configurado

---

### 4. Service Layer

#### 4.1 Build Services

##### 4.1.1 Agent Service

- O serviço deve criar, versionar, publicar e remover agentes
- O serviço deve armazenar a composição do agente como grafo de nós e arestas
- O serviço deve manter diagrama fan-in / fan-out derivado dos nós de entrada e saída do fluxo salvo
- O serviço deve disponibilizar agentes publicados para seleção no editor visual, nos catálogos de registro e como referências dentro de orquestrações
- O serviço deve associar cada agente a um time, responsável e conjunto de tags
- O serviço deve gerenciar status de ciclo de vida: draft → active → error
- O serviço deve controlar versionamento semântico (ex: v1.0.0 → v1.0.1) com histórico de versões por ambiente
- O serviço deve armazenar parâmetros de configuração por ambiente (dev / staging / production)
- O serviço deve indicar se o agente suporta rota de conversação (hasConversation)

**Versionamento de Prompts:**
- O serviço deve armazenar e versionar os prompts (system template e instruções) de cada agente de forma independente do grafo de fluxo
- O serviço deve permitir criar, editar e ativar versões de prompt sem necessidade de abrir ou salvar o editor visual
- Cada versão de prompt deve registrar: conteúdo do template, autor, timestamp e nota de alteração
- O serviço deve permitir comparar versões de prompt lado a lado (diff)
- O serviço deve permitir rollback para uma versão anterior de prompt com registro da operação
- O serviço deve expor o prompt ativo para uso pelo agente em tempo de execução via Agent Gateway

**Paleta de nós do editor de agentes (sugestão):**
- **Input** — mensagem de entrada do usuário; propriedade: inputSchema (JSON)
- **Prompt** — template com variáveis `{{input}}`, `{{memory}}`, `{{rag}}`, `{{tools}}`; conectores tipados: in, memory, tools, rag
- **Task** — capacidade nomeada do agente com taskId e descrição; permite múltiplas tasks selecionáveis ao referenciar o agente em orquestrações
- **Conversation** — habilita interface de chat multi-turn stateful
- **LLM Model** — núcleo de raciocínio; propriedade: llmId (seleção do catálogo)
- **Memory** — buffer / summary / vector; propriedade: tipo de memória e janela de contexto
- **RAG Retriever** — lookup na base de conhecimento; propriedade: ragId (seleção do catálogo)
- **Tool / API** — capacidade externa REST/GraphQL; propriedade: apiId (seleção do catálogo)
- **Tool / Database** — consulta a banco registrado; propriedades: dbCatalogId e dbInstructions (SQL/DSL)
- **MCP Server** — Model Context Protocol stdio/http; propriedade: mcpId (seleção do catálogo)
- **Output** — saída do agente; propriedade: outputSchema (JSON)

##### 4.1.2 Orchestration Service

- O serviço deve criar, versionar, publicar e remover orquestrações
- O serviço deve armazenar o grafo de fluxo com nós e arestas (JSON ReactFlow) com persistência por ambiente
- O serviço deve manter o diagrama fan-in / fan-out derivado dos nós de entrada (endpoint, cron, consumer, grpcreq, wsreq) e saída (producer, humantask, db, cloud, tool) do fluxo
- O serviço deve gerenciar informações de deploy por ambiente (cluster, namespace, região, réplicas, imagem, health)
- O serviço deve gerenciar status de ciclo de vida: draft → active → deploying → error
- O serviço deve controlar versionamento semântico com histórico de versões por ambiente

**Versionamento de Prompts:**
- O serviço deve armazenar e versionar os prompts de nós críticos da orquestração (ex: instruções de coordenação, templates de mensagem para Human Task/Human Info) de forma independente do grafo de fluxo
- O serviço deve permitir editar e ativar versões de prompt diretamente na tela de detalhe da orquestração, sem necessidade de abrir o editor visual
- Cada versão de prompt deve registrar: conteúdo, escopo (ID do nó ao qual pertence), autor, timestamp e nota de alteração
- O serviço deve permitir rollback para versão anterior de qualquer prompt com registro da operação
- O serviço deve expor os prompts ativos para uso em tempo de execução via Orchestration Gateway

**Paleta de nós do editor de orquestração (sugestão):**

*Message / Communication:*
- **REST Request** (endpoint) — ponto de entrada via HTTP. Recebe chamadas externas e inicia a orquestração. Configurável com protocolo (REST, GraphQL, SSE, WebSocket), path do endpoint e tipo de autenticação.
- **REST Response** (output) — envia a resposta final ao chamador HTTP. O formato de saída (JSON, stream SSE, WebSocket frames) segue automaticamente o protocolo do REST Request conectado.
- **gRPC Request** (grpcreq) — ponto de entrada via gRPC unary. Recebe chamadas de serviços internos usando Protocol Buffers, adequado para comunicação serviço-a-serviço de alta performance.
- **gRPC Response** (grpcres) — envia a resposta ao chamador gRPC, suportando tanto resposta unary quanto streaming bidirecional via proto.
- **WebSocket Request** (wsreq) — estabelece conexão WebSocket persistente (ws:// ou wss://). Permite comunicação bidirecional em tempo real entre cliente e orquestração.
- **WebSocket Response** (wsres) — emite mensagens de volta ao cliente WebSocket conectado. Suporta envio de frames JSON ao longo de toda a execução da orquestração.
- **Message Consumer** (consumer) — assina um tópico ou fila de mensageria e dispara a orquestração a cada mensagem recebida. Configurável com broker (Kafka, RabbitMQ, NATS, SQS, Pub/Sub, Redis Streams), nome do tópico/fila e consumer group.
- **Message Producer** (producer) — publica uma mensagem em um tópico ou fila ao final de um passo da orquestração. Configurável com broker e nome do tópico/fila destino.

*Triggers:*
- **Cron Job** (cron) — dispara a orquestração em intervalos programados sem payload externo. Configurável via expressão cron (ex: `0 2 * * *`) ou presets pré-definidos (diário, horário, semanal, mensal).

*Tasks:*
- **Agent Task** (agentref) — invoca um agente publicado no catálogo. Permite selecionar o agente, a task específica a executar (quando o agente expõe múltiplas tasks) e o payload de entrada via editor JSON. O resultado do agente flui para o próximo nó da orquestração.
- **Script Task** (scripttask) — executa código customizado embutido na orquestração, em JavaScript ou Python. Útil para transformações de dados, cálculos ou lógicas simples que não justificam um agente dedicado. O script é editado em modal com syntax highlighting.
- **Human Task** (humantask) — pausa a execução e aguarda interação manual de um operador. Define um formulário dinâmico (campos text, textarea, select, checkbox, checkbox-group) e o e-mail do responsável pela tarefa. Suporta parâmetros dinâmicos `{{param}}` nos campos.

*Coordination:*
- **Router** (router) — avalia condições e encaminha o fluxo para uma ou mais branches específicas. Suporta roteamento condicional por regras (if/switch) ou por classificação de intenção via LLM, permitindo despacho inteligente entre agentes especializados.
- **Loop** (loop) — repete um bloco da orquestração até que uma condição seja satisfeita. Suporta padrões de iteração (for, while) e de retry com backoff, útil para polling e tentativas com tolerância a falha.
- **Validator** (validator) — verifica a qualidade ou conformidade do output de um nó anterior antes de prosseguir o fluxo. Opera em dois modos: **AI** (envia o output a um LLM com um prompt de validação e aguarda `{ valid, reason }`) ou **Template** (valida contra um JSON Schema).
- **Wait / Merge** (merge) — sincroniza múltiplas branches paralelas antes de continuar. Configurável com política de convergência: **all** (aguarda todas), **any** (avança com a primeira) ou **first** (descarta as demais ao receber a primeira resposta).

*Tools:*
- **Database** (db) — executa operações em um banco de dados registrado no catálogo (PostgreSQL, MySQL, MongoDB, Redis, etc.). Configurável com seleção do banco e instruções SQL/DSL editadas em modal, suportando operações insert, update, upsert, delete e search.
- **Cloud Service** (cloud) — acessa serviços de nuvem como S3 (leitura/escrita de objetos), Lambda (invocação de função), BigQuery (queries analíticas) e equivalentes nos provedores AWS, GCP e Azure.
- **API** (tool) — realiza chamadas a APIs externas cadastradas no catálogo. Permite invocar qualquer endpoint registrado (REST), com método HTTP, payload e autenticação já configurados no catálogo.

*Information:*
- **Human Info** (humaninfo) — emite uma mensagem informativa para o operador humano durante a execução, sem interromper o fluxo. O conteúdo é um template Markdown com suporte a parâmetros dinâmicos `{{param}}` substituídos em tempo de execução. Suporta níveis info, success e warning.

##### 4.1.3 Template Service

- O serviço deve armazenar e versionar templates do tipo agent e orchestration
- O serviço deve suportar templates lowcode (snapshot de fluxo com parâmetros configuráveis tipados: text, select, number) e highcode (link para repositório Git)
- O serviço deve expor catálogo de templates para listagem com filtro por tipo e fonte
- O serviço deve expor os parâmetros configuráveis de cada template para preenchimento no wizard de instanciação
- O serviço deve criar um novo agente ou orquestração a partir de um template instanciado, substituindo os parâmetros nos nós do fluxo

##### 4.1.4 Knowledge Service

- O serviço deve criar e gerenciar grupos de documentos com estratégia de indexação, modelo de embedding, chunk size, chunk overlap e vector store configuráveis
- O serviço deve suportar documentos nos formatos PDF, Markdown, HTML, DOCX e TXT
- O serviço deve versionar documentos, rastrear status de indexação (indexed / processing / failed) e permitir ativação de versão específica
- O serviço deve suportar estratégias: hybrid_search (BM25 + vetorial), semantic_chunking, parent_child e graph_rag
- O serviço deve acionar pipeline de indexação ao fazer upload de documento: Parsing → Chunking → Embedding → Indexing → Validation
- O serviço deve criar automaticamente uma RAG interna associada a cada grupo de documentos
- O serviço deve expor RAGs internas para seleção no editor visual de agentes e no RAG Gateway

##### 4.1.5 Training Service

- O serviço deve criar, enfileirar, iniciar, pausar, parar e remover jobs de treinamento
- O serviço deve suportar tipos: llm-finetune, llm-lora, llm-rlhf, ml-classification, ml-regression, ml-forecasting, ml-clustering e embeddings
- O serviço deve suportar frameworks LLM: transformers, trl, peft, unsloth e axolotl; e frameworks ML: sklearn, xgboost, lightgbm, pytorch e tensorflow
- O serviço deve registrar hiperparâmetros (epochs, batch size, learning rate, optimizer, seed), hardware (tipo de GPU, quantidade, nós), métricas de progresso (loss, val_loss, accuracy, f1, perplexity, rmse) e custo acumulado por job
- O serviço deve expor KPIs agregados: total de runs, runs em execução, runs com sucesso, total gasto e GPU·hours
- O serviço deve publicar artefatos treinados no registry de modelos (artifactRegistry)
- O serviço deve gerenciar tipos de GPU disponíveis (gpuTypes) para seleção ao criar um job

##### 4.1.5 Dataset Builder Service

- O serviço deve oferecer capacidade de construção de datasets a partir de fontes de dados da plataforma (execuções, conversas, logs, bases RAG, APIs externas e bancos registrados)
- O serviço deve permitir definir pipelines de coleta, transformação e limpeza de dados (filtros, deduplicação, anotação e splitting em train/validation/test)
- O serviço deve suportar geração de datasets sintéticos a partir de LLMs cadastrados no catálogo
- O serviço deve versionar datasets construídos, registrando origem, transformações aplicadas, autor e timestamp
- O serviço deve expor datasets construídos para seleção em jobs de treinamento, suites de testes e na Feature Store

---

#### 4.2 Use Services

##### 4.2.1 Execution Service

- O serviço deve registrar cada execução de orquestração ou agente com ID de correlação, trigger, ambiente, status e duração total
- O serviço deve armazenar o trace completo: chamadas externas (API, MCP, RAG, DB com request/response, duração e status), chamadas a agentes (input, output, role, duração e status), Human Infos e Human Tasks
- O serviço deve suportar Human Tasks com formulários dinâmicos com campos do tipo text, textarea, select, checkbox e checkbox-group, estado (pending/completed) e submissão pelo usuário
- O serviço deve suportar Human Infos com mensagens Markdown de nível info, success e warning emitidas pelo fluxo
- O serviço deve suportar status: success, error, running e human_review
- O serviço deve suportar triggers: REST, Cron, Kafka consumer e gRPC
- O serviço deve armazenar parâmetros de entrada e saída final da execução
- O serviço deve expor filtros por ambiente, status, orquestração/agente e período

##### 4.2.2 Conversation Service

- O serviço deve registrar conversas com agentes que possuem rota de conversação (hasConversation = true)
- O serviço deve armazenar histórico de mensagens com role (user/agent), conteúdo Markdown e timestamp
- O serviço deve associar cada conversa a um agente, usuário e título auto-gerado a partir da primeira mensagem
- O serviço deve suportar múltiplas conversas por agente e por usuário
- O serviço deve expor histórico por agente para consulta e busca por título

---

#### 4.3 Catalog Services

##### 4.3.1 Model Service

- O serviço deve registrar modelos do tipo LLM, ML e Embedding com nome, provedor, endpoint e credenciais
- O serviço deve suportar provedores externos: OpenAI, Google, Anthropic, Cohere, Voyage AI, Hugging Face
- O serviço deve suportar modelos self-hosted via endpoint customizado (ex: vLLM)
- O serviço deve disponibilizar modelos ativos para seleção no editor visual e no Model Gateway

##### 4.3.2 External API Service

- O serviço deve registrar APIs externas com nome, descrição, URL base, endpoints e tipo de autenticação
- O serviço deve suportar autenticações: API key, OAuth2, JWT, PAT e sem autenticação
- O serviço deve disponibilizar APIs ativas para seleção no editor visual

##### 4.3.3 MCP Server Service

- O serviço deve registrar servidores MCP com nome, transporte (stdio / HTTP) e lista de ferramentas
- O serviço deve verificar conectividade ao registrar ou atualizar um servidor
- O serviço deve disponibilizar servidores ativos para seleção no editor visual

##### 4.3.4 External DB Service

- O serviço deve registrar bancos de dados externos com tipo (PostgreSQL, MySQL, MongoDB, Redis, BigQuery, Elasticsearch), operação e credenciais
- O serviço deve disponibilizar bancos registrados para seleção no editor visual

##### 4.3.5 RAGs DB Service

- O serviço deve registrar bases RAG externas com store vetorial, endpoint, índice e modelo de embedding
- O serviço deve suportar stores: pgvector, Pinecone, Qdrant, Weaviate e Neo4j
- O serviço deve permitir configuração independente por ambiente (dev / staging / production)
- O serviço deve disponibilizar RAGs ativos para seleção no editor visual de agentes

##### 4.3.6 Dataset Catalog Service

- O serviço deve registrar datasets com nome, descrição, path (local ou cloud: S3, GCS, etc.), formato (CSV, JSON, JSONL, Parquet, Delta Lake, Avro, ORC, HDF5, Arrow, TFRecord, Protobuf, XML, Excel, SQLite), tamanho e número de linhas
- O serviço deve suportar tags para categorização
- O serviço deve expor datasets ativos para seleção em jobs de treinamento e suites de testes
- O serviço deve permitir registrar, editar e remover datasets; campos de tamanho e número de linhas são somente leitura após criação

---

#### 4.4 Governance Services

##### 4.4.1 FinOps Service

- O serviço deve calcular e consolidar custos por área, equipe, orquestração (fluxo), agente e job de treinamento
- O serviço deve discriminar custos por categoria: Kubernetes (CPU, memória, GPU, storage, rede), LLM (tokens in/out por modelo) e External API (chamadas por serviço)
- O serviço deve suportar filtro por período (7d, 30d, 90d), com escalonamento proporcional de invocações, tokens e custos
- O serviço deve expor ranking de modelos LLM por custo total, chamadas e tokens consumidos
- O serviço deve expor breakdown de infraestrutura Kubernetes por aplicação (namespace, CPU, memória, GPU, storage, rede)
- O serviço deve integrar com o Quota Service para comparar gasto realizado vs limite configurado

##### 4.4.2 Quota Service

- O serviço deve criar e gerenciar quotas por escopo: usuário, time e área; com seleção de scope e target específico (ex: time "Customer AI", agente "Researcher", LLM "GPT-5")
- O serviço deve suportar métricas de quota: tokens, requests, cost_usd, executions, concurrent_runs, storage_gb, cpu_cores, memory_gb e gpu_hours
- O serviço deve suportar períodos: minute, hour, day e month
- O serviço deve suportar ações ao atingir limite: block, warn e throttle
- O serviço deve suportar configuração de ambiente por regra (dev / staging / production)
- O serviço deve criar e gerenciar regras de rate limit: requests_per_second, requests_per_minute, concurrent_connections e bandwidth_mbps
- O serviço deve expor consumo atual vs limite com barra de progresso colorida (verde / âmbar ≥80% / vermelho ≥100%) na Console UI
- O serviço deve expor KPIs: total de quotas, habilitadas, próximas do limite (≥80%) e violadas (≥100%)
- O serviço deve permitir habilitar/desabilitar regras individualmente via switch

##### 4.4.3 Alert Service

- O serviço deve criar, editar e remover regras de alerta com condição, severidade, escopo e janela de avaliação
- O serviço deve suportar métricas: cpu, memory, disk, pods, gpu, tokens, cost, latency, error_rate, queue_depth, human_task_backlog, rag_freshness e auth_failures
- O serviço deve suportar categorias: infrastructure, application, cost, llm, security e sla
- O serviço deve suportar canais de notificação: email, slack, teams, pagerduty e webhook
- O serviço deve suportar escopo de regra: global, namespace, flow, agent e team
- O serviço deve suportar operadores de comparação: `>`, `>=`, `<`, `<=`, `==`
- O serviço deve suportar campo runbook (URL) opcional por regra
- O serviço deve gerenciar estado dos eventos: firing, acknowledged (com registro de quem acusou), resolved (com timestamp) e silenced
- O serviço deve permitir ao usuário: acknowledge, resolve e silence eventos diretamente na Console UI
- O serviço deve suportar cooldown entre disparos para evitar flood de notificações
- O serviço deve expor KPIs: alertas firing, acknowledged, critical abertos e total de regras ativas

##### 4.4.4 Watch Service

- O serviço deve coletar e expor métricas em tempo real: requests/min, latência p50/p99, taxa de erro, taxa de sucesso, throughput e custo de tokens em 24h
- O serviço deve armazenar série histórica de latência (p50 vs p99), taxa de erro, taxa de sucesso, throughput e consumo de tokens (input vs output) por dia para os últimos 12 dias
- O serviço deve coletar e expor traces de execução com ID, duração por estágio (com timeline), tokens, status e timestamp; cada estágio deve expor input e output expandíveis
- O serviço deve coletar e expor logs estruturados de execução com timestamp, nível (info/warn/error) e source (orchestration/agent)
- O serviço deve suportar auto-refresh de traces a cada 5 segundos na Console UI
- O serviço deve expor métricas de infraestrutura Kubernetes: réplicas ativas/desejadas, CPU, memória, pods e status de saúde por ambiente (healthy/degraded/down)
- O serviço deve expor estatísticas de tempo médio por componente/estágio da orquestração para identificação de gargalos

---

#### 4.5 Test Services

##### 4.5.1 Suite Cases Service

- O serviço deve criar e gerenciar suites de testes com alvo (orchestration / agent / rag), ambiente e agendamento
- O serviço deve suportar casos de teste do tipo: functional, quality (LLM-judge), guardrails e performance
- O serviço deve suportar métricas de qualidade: faithfulness, answer_relevancy, context_precision, context_recall, toxicity, bias, coherence e groundedness
- O serviço deve suportar guardrails: no_pii, no_secrets, no_prompt_injection, no_jailbreak, no_hallucination, no_offtopic, max_tokens e blocked_terms
- O serviço deve suportar métricas de performance: p95_latency, max_latency, min_throughput_rps e concurrency
- O serviço deve suportar métricas RAG: recall mínimo, precisão mínima e documentos esperados
- O serviço deve registrar resultado de cada execução de teste com status, duração e timestamp
- O serviço deve expor histórico de execuções por suite e por caso de teste

##### 4.5.2 Playground Service

- O serviço deve permitir experimentação de modelos LLM (catálogo + fine-tunes) com comparação lado a lado de até 4 modelos simultâneos, com system prompt compartilhado e parâmetros independentes (temperatura, top-p, max tokens)
- O serviço deve registrar latência, tokens consumidos e custo por resposta no playground LLM
- O serviço deve permitir experimentação de modelos de ML com inferência single (com contribuições SHAP) e batch (input CSV, output CSV com prediction e confidence), usando modelos de artefatos do Training Service
- O serviço deve permitir experimentação de pipelines RAG com seleção de índice, estratégia de retrieval (hybrid, semantic, parent-child, graph, rerank), top-k e reranking; exibindo chunks recuperados com score e gerando resposta fundamentada via LLM selecionado
- O serviço deve registrar sessões do playground como conversas para consulta posterior


---

### 6. Core Layer

O Core Layer é a fundação operacional da plataforma. Enquanto as camadas superiores (Access, Gateway, Security, Service) se ocupam da lógica de negócio e dos fluxos de IA, o Core Layer provê a infraestrutura de sustentação que garante que tudo funcione com consistência, rastreabilidade e segurança. Sem ele, não há onde armazenar estado, não há como promover código entre ambientes, não há como auditar mudanças e não há como entregar novas versões de agentes e orquestrações de forma confiável.

---

#### 6.1 Data & Messaging

Base de dados e mensageria da plataforma. Responsável por persistir todo o estado operacional — execuções, conversas, configurações, métricas, logs — e por prover o backbone de comunicação assíncrona entre os serviços internos e os fluxos de orquestração.

- A plataforma deve prover bancos de dados relacionais (PostgreSQL) para armazenamento transacional de agentes, orquestrações, execuções, configurações e catálogos
- A plataforma deve prover bancos vetoriais (pgvector, Pinecone, Qdrant, Weaviate, Neo4j) para persistência dos índices RAG utilizados pelos agentes
- A plataforma deve prover cache em memória (Redis) para sessões, rate limiting e dados de alta frequência de acesso
- A plataforma deve prover bancos analíticos (ClickHouse, BigQuery) para armazenamento de logs, traces e métricas de observabilidade de longa retenção
- A plataforma deve prover um broker de mensageria (Kafka, RabbitMQ, NATS) para comunicação assíncrona entre orquestrações e serviços externos, e para triggers de execução via Message Consumer
- A plataforma deve garantir isolamento de dados por ambiente (dev / staging / production), com schemas ou instâncias separadas conforme a criticidade
- A plataforma deve prover mecanismos de backup, retenção e purge de dados por tipo e ambiente

---

#### 6.2 Environment & Configuration

Configuração dos clusters e aplicações. Responsável por gerenciar variáveis de ambiente, segredos, configurações de runtime e o estado dos clusters Kubernetes onde agentes e orquestrações são executados.

- A plataforma deve gerenciar configurações de runtime por aplicação (agente / orquestração) e por ambiente (dev / staging / production) de forma centralizada
- A plataforma deve armazenar segredos (API keys, tokens, credenciais de banco, chaves SSH) em cofre seguro, sem exposição de valores em logs ou na Console UI
- A plataforma deve prover injeção automática de variáveis de ambiente nas aplicações no momento do deploy, com substituição por ambiente
- A plataforma deve gerenciar clusters Kubernetes com visibilidade de namespaces, réplicas, uso de CPU, memória e status de saúde por workload
- A plataforma deve suportar múltiplos provedores de cloud (AWS, GCP, Azure) e deploy on-premises, com configuração de região por ambiente
- A plataforma deve prover feature flags por ambiente para habilitar ou desabilitar capacidades de um agente ou orquestração sem novo deploy
- A plataforma deve expor o status de sincronização entre a configuração armazenada e o estado real dos clusters, alertando em caso de desvio (drift)

---

#### 6.3 Pipeline & Deploy

Esteiras de build e deploy das aplicações. Responsável por transformar código e fluxos versionados em artefatos executáveis e entregá-los nos ambientes de destino com rastreabilidade completa de cada etapa.

- A plataforma deve executar pipelines CI/CD por aplicação (agente / orquestração) com estágios: Checkout → Build → Test → Push image → Deploy
- Cada execução de pipeline deve ser rastreada a um commit específico do repositório Git de origem, garantindo reprodutibilidade total
- A plataforma deve suportar triggers de pipeline por: push no repositório (webhook), acionamento manual pela Console UI, agendamento (schedule) e promoção entre ambientes
- A plataforma deve publicar imagens Docker no registry interno com tag vinculada à versão semântica da aplicação (ex: `registry/agent-researcher:v1.0.2`)
- A plataforma deve suportar promoção de artefatos entre ambientes (dev → staging → production) sem rebuild, garantindo que o mesmo artefato testado em staging é o que vai para produção
- A plataforma deve exibir histórico de execuções de pipeline com trigger, commit, autor, duração, status e link para logs de cada estágio
- A plataforma deve expor KPIs agregados de pipeline por ambiente: total de pipelines ativas, runs em 24h, taxa de sucesso e duração média
- A plataforma deve suportar rollback de deploy para versão anterior com um clique, acionando redeploy do artefato correspondente

---

#### 6.4 Repository & Versioning

Repositório e versionamento de código das aplicações. Responsável por ser a fonte de verdade de toda a lógica implementada na plataforma — grafos de fluxo, código Python/TypeScript, templates e prompts — garantindo auditabilidade, colaboração e rastreabilidade de qualquer alteração ao longo do ciclo de vida das aplicações de IA.

- A plataforma deve permitir conectar um repositório Git externo (GitHub, GitLab, Bitbucket, Azure DevOps) a cada agente, orquestração e template
- A plataforma deve sincronizar automaticamente o grafo de fluxo (JSON) para o repositório ao salvar uma nova versão no editor visual, com commit padronizado (ex: `feat(agent/researcher): bump v1.0.2`)
- A plataforma deve suportar o fluxo inverso: ao receber um push via webhook do repositório, disparar automaticamente o pipeline de CI/CD da aplicação vinculada
- Cada versão de agente ou orquestração deve registrar o commit SHA de origem, branch, autor e mensagem de commit correspondentes para auditoria completa
- A plataforma deve suportar estratégias de branching alinhadas aos ambientes: branch `develop` → dev, `staging` → staging, `main` → production
- A plataforma deve expor o status de sincronização entre a versão ativa na plataforma e o HEAD do repositório, alertando quando houver divergência
- Templates highcode devem ter o repositório Git como artefato principal; a plataforma clona o repositório no momento de instanciação do template
- A plataforma deve garantir que todo deploy em produção seja rastreável a um commit imutável, assegurando reprodutibilidade e auditabilidade completa do ciclo de vida dos fluxos de IA
- A plataforma deve permitir navegar pelo histórico de commits do repositório vinculado diretamente na tela de detalhe do agente ou orquestração, com link para diff no provedor Git
- A plataforma deve versionar prompts independentemente do grafo de fluxo, armazenando cada versão com conteúdo, autor, timestamp, nota de alteração e referência ao commit Git quando alterado via editor de código
