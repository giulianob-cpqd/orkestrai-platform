# Platform Services Mapping — Requisitos

## Visão Geral

Mapeamento completo dos recursos implementados na plataforma OrkestrAI para os serviços definidos na arquitetura de longo prazo (`estrutura-longo-prazo.md`). O documento organiza os requisitos por camada arquitetural — Access, Gateway, Security e Service — detalhando o que cada serviço deve oferecer com base no que já está implementado na Console UI.

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

**Build**
- O sistema deve exibir lista de orquestrações com nome, versão, status, time e quantidade de agentes referenciados
- O sistema deve exibir detalhe de orquestração com: metadados (nome, descrição, versão, time, responsável, tags), diagrama fan-in/fan-out, lista de agentes referenciados, aba Pipeline & Deploy, aba Observability e aba **Prompt Versions**
- O sistema deve exibir lista de agentes com nome, versão, status, time e quantidade de RAGs vinculados
- O sistema deve exibir detalhe de agente com: metadados, diagrama fan-in/fan-out, lista de RAGs vinculados, aba Pipeline & Deploy, aba Observability e aba **Prompt Versions**
- O sistema deve oferecer editor visual drag-and-drop (FlowBuilder) para criar e editar orquestrações e agentes com paleta de componentes, canvas, mini-map, zoom/pan e salvamento automático de versão por ambiente
- O editor deve oferecer painel de propriedades lateral para configuração de cada nó selecionado
- O editor deve oferecer assistente de IA integrado para geração de fluxos a partir de linguagem natural
- O editor deve suportar botão de validação, teste e deploy do fluxo
- O sistema deve exibir lista de templates reutilizáveis com filtro por tipo (agent / orchestration) e fonte (lowcode / highcode)
- O sistema deve oferecer modal de detalhes do template exibindo parâmetros configuráveis, autor, tags e repositório
- O sistema deve oferecer wizard para instanciar um template com preenchimento de parâmetros
- O sistema deve oferecer diálogo para criação de novo template a partir de fluxo existente ou repositório Git
- O sistema deve exibir bases de conhecimento organizadas em grupos de documentos com estratégia de indexação, modelo de embedding, chunk size e vector store
- O sistema deve permitir criar e editar grupos de documentos com estratégia de indexação configurável
- O sistema deve permitir upload de documentos com pipeline visual de indexação em etapas (Parsing → Chunking → Embedding → Indexing → Validation)
- O sistema deve suportar versionamento de documentos com ativação de versão específica
- O sistema deve exibir RAG interna criada automaticamente para cada grupo de conhecimento
- O sistema deve exibir jobs de treinamento com status, progresso, métricas (loss, accuracy, f1, perplexity) e custo
- O sistema deve permitir criar job de treinamento com seleção de tipo, framework, modelo base, dataset, hiperparâmetros e hardware (GPU/nodes)
- O sistema deve permitir iniciar, pausar e remover jobs de treinamento
- O sistema deve exibir KPIs de treinamento: total de runs, runs em execução, runs com sucesso, gasto total e GPU·hours

**Prompt Versions (aba nas telas de detalhe de agente e orquestração):**
- O sistema deve exibir histórico de versões de cada prompt da aplicação com conteúdo, autor, timestamp e nota
- O sistema deve permitir criar nova versão de prompt a partir de editor de texto inline, sem abrir o editor visual
- O sistema deve exibir o prompt atualmente ativo destacado no histórico
- O sistema deve permitir ativar qualquer versão anterior com confirmação
- O sistema deve permitir comparar duas versões de prompt em visualização diff lado a lado
- O sistema deve exibir, para orquestrações, a lista de nós que possuem prompts (identificados por ID e label do nó) para seleção antes de editar

**Tests**
- O sistema deve exibir suites de testes com alvo (orchestration / agent / rag), ambiente, agendamento e resultado da última execução
- O sistema deve exibir casos de teste com tipo (functional, quality, guardrails, performance), status, duração e severidade
- O sistema deve permitir habilitar/desabilitar casos de teste individualmente
- O sistema deve exibir histórico de execuções por suite com percentual de casos passados
- O sistema deve oferecer playground com três modos: LLM (comparação de modelos lado a lado), Machine Learning (inferência simples e batch) e RAG (retrieve → grounded answer)
- O playground LLM deve suportar até 4 painéis simultâneos com seleção de modelo, temperatura, top-p e max tokens, com histórico de mensagens e métricas de latência, tokens e custo por resposta
- O playground ML deve suportar inferência single (com contribuições SHAP) e inferência batch (CSV)
- O playground RAG deve suportar configuração de estratégia de retrieval, top-k, reranking e seleção de LLM gerador, exibindo chunks recuperados e resposta fundamentada

**Uses**
- O sistema deve exibir histórico de execuções com ID, trigger, ambiente, duração, status e timestamp
- O sistema deve exibir modal de detalhe de execução com: parâmetros de entrada, saída final, agentes chamados (com input/output e duração), chamadas externas (API/MCP/RAG/DB com request/response), Human Infos e Human Tasks
- O sistema deve permitir interagir com Human Tasks pendentes: preencher formulários com campos do tipo text, textarea, select, checkbox e checkbox-group
- O sistema deve exibir histórico de conversas com agentes filtrado por agente, com busca por título
- O sistema deve permitir criar nova conversa, selecionar agente, enviar mensagens e receber respostas com suporte a Markdown

**Catalog**
- O sistema deve exibir catálogo de modelos segmentado por tipo: LLM, ML e Embedding, com nome, provedor, endpoint, tags e status
- O sistema deve exibir catálogo de APIs externas com autenticação, endpoints e status, com configuração por ambiente (dev/staging/production)
- O sistema deve exibir catálogo de MCP Servers com transporte, ferramentas disponíveis e status
- O sistema deve exibir catálogo de bancos de dados externos com tipo (PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, ClickHouse, etc.) e configuração de conexão por ambiente
- O sistema deve exibir catálogo de RAGs mostrando índices internos (vinculados a grupos de conhecimento, somente leitura) e externos (editáveis), com store vetorial, modelo de embedding e configuração por ambiente
- O sistema deve exibir catálogo de datasets com nome, formato (CSV, JSONL, Parquet, etc.), path, tamanho, número de linhas, tags e status
- O sistema deve permitir registrar, editar e remover datasets
- O sistema deve oferecer capacidade de **Build Dataset**: construção de datasets a partir de fontes da plataforma com pipelines de coleta, transformação, limpeza e splitting
- O sistema deve exibir e gerenciar a **Feature Store**: grupos de features com definição, versionamento e linhagem, acessíveis em modo offline (treinamento) e online (inferência)

**Governance**
- O sistema deve exibir análise de custos (FinOps) com breakdown por área, equipe, orquestração, agente, treinamento, LLM e infraestrutura Kubernetes, com filtro por período (7d / 30d / 90d) e área
- O sistema deve exibir detalhe de custo por orquestração: K8s, agentes utilizados, APIs externas e custo por agente
- O sistema deve exibir detalhe de custo por agente: K8s, LLM, invocações, tokens in/out e modelos utilizados
- O sistema deve exibir e gerenciar quotas por escopo (usuário, time, área) com métricas de consumo atual vs limite
- O sistema deve exibir e gerenciar rate limits por escopo e tipo (requests/s, requests/min, concurrent connections, bandwidth)
- O sistema deve exibir e gerenciar regras de alerta com severidade, condição, escopo, janela de avaliação e canais de notificação
- O sistema deve exibir eventos de alerta ativos com estado (firing, acknowledged, resolved, silenced) e timestamp da última ocorrência

#### 1.2 CLI

- O sistema deve oferecer interface de linha de comando para criação e deploy de agentes e orquestrações
- O sistema deve oferecer comandos para consulta de execuções, logs e status de ambientes
- O sistema deve oferecer comandos para gerenciamento de catálogos (modelos, APIs, MCPs, RAGs, datasets)

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
- O serviço deve armazenar a composição do agente como grafo de nós e arestas (JSON ReactFlow) com persistência por ambiente
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

**Paleta de nós do editor de agentes (agentNodeCatalog):**
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

*Message / Communication:*
- **REST Request** (endpoint) — propriedades: protocolo (REST/GraphQL/gRPC/SSE/WebSocket), path
- **REST Response** (output) — formato segue automaticamente o protocolo do Request conectado
- **gRPC Request** (grpcreq) — proto · unary
- **gRPC Response** (grpcres) — proto · stream
- **WebSocket Request** (wsreq) — ws:// · wss://
- **WebSocket Response** (wsres) — frames · json
- **Message Consumer** (consumer) — propriedades: broker (Kafka/RabbitMQ/NATS/SQS/Pub-Sub/Redis Streams), topic/queue, consumer group
- **Message Producer** (producer) — propriedades: broker, topic/queue

*Triggers:*
- **Cron Job** (cron) — propriedades: expressão cron (texto livre) e presets pré-definidos

*Tasks:*
- **Agent Task** (agentref) — propriedades: agentId (seleção do catálogo), taskId (se agente expõe múltiplas tasks), agentInputData (JSON)
- **Script Task** (scripttask) — propriedades: linguagem (JavaScript / Python), script (editor modal)
- **Human Task** (humantask) — propriedades: assignedTo (email), taskFields (JSON com campos do formulário e suporte a parâmetros `{{param}}`)

*Coordination:*
- **Router** (router) — branching condicional: if / switch / intent
- **Loop** (loop) — repetição: for / while / retry
- **Validator** (validator) — verificação de qualidade: modo AI (LLM + prompt de validação) ou Template (JSON Schema)
- **Wait / Merge** (merge) — aguarda branches paralelas: all / any / first

*Tools:*
- **Database** (db) — propriedades: dbCatalogId (PostgreSQL/MySQL/MongoDB/Redis/etc.), dbInstructions (SQL/DSL)
- **Cloud Service** (cloud) — S3 / Lambda / BigQuery; AWS, GCP, Azure
- **API** (tool) — chamada REST third-party; propriedade: apiId (seleção do catálogo)

*Information:*
- **Human Info** (humaninfo) — propriedades: infoTemplate (Markdown com parâmetros `{{param}}`)

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

##### 4.1.6 Pipeline & Deploy Service

- O serviço deve gerenciar pipelines CI/CD por fluxo (orquestração / agente) e ambiente com estágios: Build → Test → Push → Deploy
- O serviço deve exibir pipelines ativas com status (running / success / failed / pending), cluster, namespace, branch, réplicas e imagem Docker
- O serviço deve exibir histórico de runs de pipeline com trigger (git push / manual / schedule / webhook), commit, mensagem, autor, duração e status
- O serviço deve expor KPIs de pipeline por ambiente: pipelines ativas, runs em 24h, taxa de sucesso e duração média
- O serviço deve gerenciar ambientes de deploy com configuração Kubernetes detalhada: cluster, namespace, região, imagem, réplicas (prontas/desejadas), uso de CPU, memória, status de saúde (healthy/degraded/down) e timestamp do último deploy
- O serviço deve expor gráficos históricos de uso de CPU, memória e pods ativos por ambiente (últimas 24h)
- O serviço deve expor variáveis de ambiente configuradas por ambiente (envVars)
- O serviço deve suportar ação de redeploy por ambiente
- O serviço deve suportar ação de promoção entre ambientes (dev → staging → production)
- O serviço deve suportar conexão de repositório Git ao fluxo
- O serviço deve executar pipeline de deploy animado com progresso por estágio (Checkout → Build → Test → Push image → Deploy) ao salvar e fazer deploy via editor visual
- O serviço deve atualizar o status e versão do fluxo ao concluir o deploy

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

##### 4.3.6 Dataset Service

- O serviço deve registrar datasets com nome, descrição, path (local ou cloud: S3, GCS, etc.), formato (CSV, JSON, JSONL, Parquet, Delta Lake, Avro, ORC, HDF5, Arrow, TFRecord, Protobuf, XML, Excel, SQLite), tamanho e número de linhas
- O serviço deve suportar tags para categorização
- O serviço deve expor datasets ativos para seleção em jobs de treinamento e suites de testes
- O serviço deve permitir registrar, editar e remover datasets; campos de tamanho e número de linhas são somente leitura após criação

**Build Dataset:**
- O serviço deve oferecer capacidade de construção de datasets a partir de fontes de dados da plataforma (execuções, conversas, logs, bases RAG, APIs externas e bancos registrados)
- O serviço deve permitir definir pipelines de coleta, transformação e limpeza de dados (filtros, deduplicação, anotação e splitting em train/validation/test)
- O serviço deve suportar geração de datasets sintéticos a partir de LLMs cadastrados no catálogo
- O serviço deve versionar datasets construídos, registrando origem, transformações aplicadas, autor e timestamp
- O serviço deve expor datasets construídos para seleção em jobs de treinamento, suites de testes e na Feature Store

**Feature Store:**
- O serviço deve gerenciar uma Feature Store centralizada para armazenar, versionar e servir features calculadas para projetos de Machine Learning
- O serviço deve suportar definição de features com nome, tipo (numérico, categórico, embedding, texto), fonte de dados de origem e lógica de transformação
- O serviço deve suportar feature groups (grupos de features relacionadas a uma entidade: usuário, agente, orquestração, etc.)
- O serviço deve disponibilizar features em dois modos: **offline** (batch, para treinamento) e **online** (baixa latência, para inferência em tempo real)
- O serviço deve versionar feature groups e rastrear linhagem (quais datasets e transformações geraram cada feature)
- O serviço deve expor features para seleção em jobs de treinamento do Training Service e para consumo pelo Model Gateway em tempo de inferência

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

### 5. Componentes Transversais

#### 5.0 AI Assistant (Editor Visual)

- O assistente deve estar disponível como painel lateral retrátil no editor visual (FlowBuilder)
- O assistente deve operar em dois modos: **agent** (gera topologia hub-and-spoke: inputs → Prompt → LLM → Output) e **orchestration** (gera cadeia linear com nós de ingresso, agentes, coordenação e egresso)
- O assistente deve interpretar linguagem natural em português e inglês para detectar: RAG (rag, knowledge, documento, pdf), memória (memória, memory, histórico), tools (api, rest, serviço), MCP (mcp, filesystem, protocol), triggers (cron, agendado, kafka, consumer), e coordenação (paralelo, router, debate)
- O assistente deve gerar automaticamente nós e arestas no canvas a partir da descrição
- O assistente deve informar a quantidade de nós e conexões gerados após cada operação
- O assistente deve manter histórico de mensagens da sessão
- O assistente deve oferecer sugestões contextuais pré-definidas por modo (3 sugestões para agent, 3 para orchestration)
- O assistente deve permitir refinamento iterativo do fluxo gerado via mensagens de acompanhamento

#### 5.1 Flow Store (Persistência de Fluxos)

- O serviço deve persistir grafos de fluxo (nós e arestas) por ID de aplicação e ambiente (chave: `appId:environment`)
- O serviço deve controlar versionamento semântico com histórico de versões por chave
- O serviço deve derivar itens fan-in (endpoint, cron, consumer, grpcreq, wsreq para orquestrações; input para agentes) a partir dos nós salvos
- O serviço deve derivar itens fan-out (producer, humantask, db, cloud, tool para orquestrações; llm, memory, tool, mcp para agentes) a partir dos nós salvos
- O serviço deve derivar RAGs vinculados a um agente a partir dos nós do tipo "rag" salvos no fluxo
- O serviço deve armazenar parâmetros de configuração associados ao fluxo por ambiente

#### 5.2 Registry (Catálogos de Referência para o Editor)

- O serviço deve expor listas de referência para população dos selects no painel de propriedades do editor visual:
  - RAGs disponíveis (registeredRags)
  - APIs disponíveis (registeredApis)
  - MCP Servers disponíveis (registeredMcpServers)
  - Agentes publicados (registeredAgents) com suas tasks disponíveis (agentTasks)
  - Modelos LLM disponíveis (registeredLlms)
  - Tipos de banco de dados (databaseTypes)
  - Protocolos de request (requestProtocols)
  - Estratégias de coordenação (coordinationStrategies)
  - Brokers de mensageria (messagingBrokers): Kafka, RabbitMQ, NATS, SQS, Pub/Sub, Redis Streams
  - Operações de banco (dbOperations): insert, update, upsert, delete, search
  - Presets de expressão Cron (cronPresets)

#### 5.3 Authentication Context

- O serviço deve prover contexto de autenticação com perfil do usuário: nome, e-mail, telefone, gerente, área, time e papel (role)
- O serviço deve persistir sessão de autenticação no localStorage
- O serviço deve redirecionar para /login ao detectar acesso não autenticado a rotas protegidas
- O serviço deve expor hook useAuth para acesso ao usuário autenticado em qualquer componente

#### 5.4 Environment Context

- O serviço deve prover contexto global de ambiente ativo (dev / staging / production) compartilhado entre todos os componentes
- O ambiente ativo deve influenciar dados exibidos no dashboard, detalhe de orquestração/agente, pipeline, observabilidade, finops, quotas e editor visual
- O sistema deve exibir seletor de ambiente persistente no header da aplicação

#### 5.5 Test Flow Dialog (Teste do Editor)

- O editor visual deve oferecer diálogo de teste que detecta automaticamente os inbounds do fluxo: endpoint (REST/gRPC/WebSocket), consumer (mensageria) e cron (agendamento) para orquestrações; input para agentes
- O diálogo deve classificar inbounds como **sync** (endpoint) ou **async** (consumer / cron) e exibir detalhes do protocolo, path, broker, topic e expressão cron
- O diálogo deve permitir editar payload JSON e headers para testes de endpoint; message key para consumer; e simular trigger para cron
- O diálogo deve exibir log de execução linha a linha com resultado do teste
- O diálogo deve gerar snippets de código prontos para uso em quatro formatos: Interface (UI), **cURL**, **Python** (requests) e **JavaScript** (fetch) com autenticação Bearer via API key
- Os snippets devem ser copiáveis para área de transferência
