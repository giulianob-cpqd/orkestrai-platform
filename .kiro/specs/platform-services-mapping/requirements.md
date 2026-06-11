# Platform Services Mapping

## Visão Geral

Mapeamento completo dos recursos implementados na plataforma de IA para os serviços definidos na arquitetura de longo prazo. O documento organiza os requisitos por camada arquitetural — Access, Gateway, Security, Service (Build, Test, Use, Catalog e Governance) e Core.

---

## Requisitos

### 1. Access Layer

O Access Layer é o ponto de entrada humano da plataforma. É por aqui que engenheiros, admins e operadores interagem com os serviços — seja via interface visual, linha de comando ou integração programática. Seu papel é tornar toda a capacidade da plataforma acessível de forma consistente, independentemente do canal escolhido. A Console UI cobre o uso cotidiano guiado; o CLI atende automação e scripting em pipelines externos; o SDK/API viabiliza integração com sistemas corporativos. Juntos, esses três canais garantem que nenhum perfil de usuário precise escalar para camadas mais baixas da arquitetura para operar a plataforma.

#### 1.1 Console UI (Aplicação Web)

- O sistema deve exibir um dashboard principal com métricas globais da plataforma
- O sistema deve oferecer navegação lateral colapsável organizada nas seções: Overview, Build, Tests, Uses, Catalog e Governance
- Na seção **Catalog**, o sistema deve incluir os itens: Models, APIs, MCP Servers, Databases, RAGs, Datasets, **Connectors**, **Build Dataset** e **Feature Store**
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

O Gateway Layer é a camada de abstração entre os consumidores externos e os serviços internos da plataforma. Cada gateway atua como um ponto de entrada especializado — para agentes, modelos, RAGs, MCP Servers ou orquestrações — aplicando autenticação, autorização, roteamento por versão e ambiente, controle de quota e coleta de telemetria antes de encaminhar a requisição ao serviço correspondente. Sem essa camada, cada consumidor precisaria conhecer a topologia interna da plataforma. Com ela, a superfície de exposição é uniforme, segura e observável independentemente de quantos provedores ou implementações existam por trás.

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

O Security Layer é o guardião transversal da plataforma. Toda requisição que atravessa o Access Layer ou o Gateway Layer passa primeiro pelo controle de identidade e permissão desta camada. Seu papel vai além de autenticar usuários: ele garante que cada ação — invocar um agente, consultar uma execução, alterar um catálogo, configurar um alerta — só aconteça se o principal tiver a permissão correspondente. Em uma plataforma de IA onde agentes operam com autonomia e acessam dados sensíveis, a Security Layer é o que torna possível conceder poder sem perder controle.

#### 3.1 Authentication & Authorization

- O sistema deve oferecer autenticação via página de login com suporte a identity providers
- O sistema deve controlar acesso às rotas e recursos da Console UI por perfil de usuário
- O sistema deve aplicar autorização nas APIs dos Gateways antes de encaminhar requisições
- O sistema deve registrar falhas de autenticação e disparar alerta ao atingir threshold configurado

---

### 4. Service Layer

O Service Layer é onde a lógica de negócio da plataforma vive. É aqui que agentes e orquestrações são criados, versionados e publicados; onde execuções são registradas e conversas são conduzidas; onde catálogos de modelos, APIs, RAGs e datasets são mantidos; e onde governança — custos, quotas, alertas e observabilidade — é exercida. Enquanto as camadas anteriores cuidam de acesso, roteamento e segurança, o Service Layer é o coração funcional da plataforma: cada sub-serviço tem uma responsabilidade clara e delimitada, e a soma deles cobre o ciclo de vida completo de uma aplicação de IA — do design ao monitoramento em produção.

#### 4.1 Build Services

Os Build Services cobrem tudo o que é necessário para criar e preparar uma aplicação de IA antes de colocá-la em produção. É o grupo onde o trabalho de design acontece: modelar a lógica do agente ou da orquestração no editor visual, organizar as bases de conhecimento que alimentam o RAG, definir templates reutilizáveis que aceleram novos projetos e configurar jobs de treinamento para ajustar modelos. Esses serviços são usados principalmente pelo AI Engineer e pelo Platform Admin — perfis que projetam, constroem e publicam as aplicações. O output de cada Build Service é um artefato versionado e publicado que as outras camadas (Gateways, Use Services, Test Services) podem consumir.

##### 4.1.1 Agent Service

Serviço central do Build Layer. Gerencia todo o ciclo de vida de um agente de IA — desde o rascunho inicial no editor visual até a publicação no catálogo e o deploy em produção. Um agente é a unidade autônoma da plataforma: combina um modelo de linguagem com memória, bases de conhecimento (RAG), ferramentas e instruções de sistema para produzir comportamento especializado. O Agent Service é responsável por persistir a composição do agente como grafo versionado, expô-lo para invocação via Agent Gateway e manter os prompts atualizados de forma independente do fluxo — permitindo ajustes finos de comportamento sem necessidade de um novo deploy completo.

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
- **Model** — núcleo de raciocínio; propriedade: modelId (seleção do catálogo)
- **Memory** — buffer / summary / vector; propriedade: tipo de memória e janela de contexto
- **RAG Retriever** — lookup na base de conhecimento; propriedade: ragId (seleção do catálogo)
- **Tool / API** — capacidade externa REST/GraphQL; propriedade: apiId (seleção do catálogo)
- **Tool / Database** — consulta a banco registrado; propriedades: dbCatalogId e dbInstructions (SQL/DSL)
- **MCP Server** — Model Context Protocol stdio/http; propriedade: mcpId (seleção do catálogo)
- **Output** — saída do agente; propriedade: outputSchema (JSON)

##### 4.1.2 Orchestration Service

Enquanto o agente é uma unidade de raciocínio individual, a orquestração é o fluxo que coordena múltiplos agentes, sistemas externos e pontos de decisão para resolver problemas de maior escopo. O Orchestration Service gerencia a criação, o versionamento e o deploy de orquestrações — grafos que conectam ingressos (REST, gRPC, Kafka, Cron), agentes especializados, bancos de dados, serviços de nuvem e respostas. É aqui que padrões de colaboração entre agentes são modelados: roteamento por intenção, execução paralela, loops de retry, validação de qualidade e aprovação humana. Cada orquestração publicada é um fluxo executável e rastreável, com versionamento semântico e configuração de deploy por ambiente.

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

Reduz o custo de criação de novos agentes e orquestrações ao disponibilizar pontos de partida validados e reutilizáveis. Um template encapsula um padrão de design — como "agente RAG com memória conversacional" ou "pipeline Kafka → router → dois agentes em paralelo → PostgreSQL" — e expõe apenas os parâmetros que variam por instância (modelo, índice RAG, endpoint, tópico). Suporta templates lowcode (snapshot de fluxo com parâmetros) e highcode (link para repositório Git), cobrindo tanto equipes que constroem visualmente quanto times que trabalham com código. O resultado da instanciação é um novo agente ou orquestração já configurado, pronto para refinamento e deploy.

- O serviço deve armazenar e versionar templates do tipo agent e orchestration
- O serviço deve suportar templates lowcode (snapshot de fluxo com parâmetros configuráveis tipados: text, select, number) e highcode (link para repositório Git)
- O serviço deve expor catálogo de templates para listagem com filtro por tipo e fonte
- O serviço deve expor os parâmetros configuráveis de cada template para preenchimento no wizard de instanciação
- O serviço deve criar um novo agente ou orquestração a partir de um template instanciado, substituindo os parâmetros nos nós do fluxo

##### 4.1.4 Documents Service

Gerencia o ciclo de vida dos documentos que alimentam as bases de conhecimento (RAG) dos agentes. Organiza documentos em grupos com estratégia de indexação configurável — hybrid search, semantic chunking, parent-child retrieval ou graph RAG — e executa o pipeline de processamento completo ao receber um novo arquivo: parsing, chunking, geração de embeddings, indexação no vector store e validação. Cada grupo de documentos gera automaticamente uma RAG interna disponível para seleção nos agentes, criando um vínculo direto entre o conhecimento gerenciado e os agentes que o consomem. O versionamento de documentos garante que atualizações de conteúdo sejam rastreáveis e reversíveis.

- O serviço deve criar e gerenciar grupos de documentos com estratégia de indexação, modelo de embedding, chunk size, chunk overlap e vector store configuráveis
- O serviço deve suportar documentos nos formatos PDF, Markdown, HTML, DOCX e TXT
- O serviço deve versionar documentos, rastrear status de indexação (indexed / processing / failed) e permitir ativação de versão específica
- O serviço deve suportar estratégias: hybrid_search (BM25 + vetorial), semantic_chunking, parent_child e graph_rag
- O serviço deve acionar pipeline de indexação ao fazer upload de documento: Parsing → Chunking → Embedding → Indexing → Validation
- O serviço deve criar automaticamente uma RAG interna associada a cada grupo de documentos
- O serviço deve expor RAGs internas para seleção no editor visual de agentes e no RAG Gateway

##### 4.1.5 Training Service

Gerencia o ciclo de vida completo de jobs de treinamento e fine-tuning de modelos — de LLMs ajustados via LoRA ou RLHF a modelos de ML clássico (classificação, regressão, forecasting) e modelos de embedding. Cada job é rastreado do enfileiramento à conclusão, com registro de hiperparâmetros, hardware utilizado, métricas de progresso em tempo real e custo acumulado em GPU·hours. Ao concluir com sucesso, o artefato treinado é publicado no registry de modelos da plataforma, tornando-se imediatamente disponível para seleção no editor visual e no Model Gateway. É o serviço que fecha o loop entre dados coletados na operação e modelos melhorados em produção.


- O serviço deve suportar tipos: llm-finetune, llm-lora, llm-rlhf, ml-classification, ml-regression, ml-forecasting, ml-clustering e embeddings
- O serviço deve suportar frameworks LLM: transformers, trl, peft, unsloth e axolotl; e frameworks ML: sklearn, xgboost, lightgbm, pytorch e tensorflow
- O serviço deve registrar hiperparâmetros (epochs, batch size, learning rate, optimizer, seed), hardware (tipo de GPU, quantidade, nós), métricas de progresso (loss, val_loss, accuracy, f1, perplexity, rmse) e custo acumulado por job
- O serviço deve expor KPIs agregados: total de runs, runs em execução, runs com sucesso, total gasto e GPU·hours
- O serviço deve publicar artefatos treinados no registry de modelos (artifactRegistry)
- O serviço deve gerenciar tipos de GPU disponíveis (gpuTypes) para seleção ao criar um job

##### 4.1.5 Dataset Service

Responsável pela construção, curadoria e versionamento dos datasets que alimentam o Training Service e o Suite Cases Service. Diferentemente de simplesmente registrar arquivos existentes, o Dataset Service permite construir datasets a partir de fontes vivas da plataforma — execuções, conversas, logs, RAGs, APIs e bancos — aplicando pipelines de transformação e limpeza (filtros, deduplicação, anotação, splitting). Isso cria um ciclo virtuoso onde dados gerados em produção pelos agentes retroalimentam o treinamento de novos modelos. Cada dataset construído é versionado com rastreamento de origem e transformações aplicadas, garantindo reprodutibilidade dos experimentos de ML.

 (execuções, conversas, logs, bases RAG, APIs externas e bancos registrados)
- O serviço deve permitir definir pipelines de coleta, transformação e limpeza de dados (filtros, deduplicação, anotação e splitting em train/validation/test)
- O serviço deve versionar datasets construídos, registrando origem, transformações aplicadas, autor e timestamp
- O serviço deve expor datasets construídos para seleção em jobs de treinamento, suites de testes e na Feature Store

---

#### 4.2 Use Services

Os Use Services registram e expõem tudo o que acontece quando uma aplicação de IA está em operação. Enquanto os Build Services cuidam do que foi criado, os Use Services cuidam do que está sendo usado. O Execution Service captura o rastro completo de cada invocação de agente ou orquestração — triggers, chamadas externas, decisões, intervenções humanas, erros e outputs — formando a base de auditoria e depuração da plataforma. O Conversation Service mantém o histórico das trocas diretas com agentes conversacionais, permitindo que usuários e equipes acompanhem interações e identifiquem padrões de uso. Juntos, esses serviços fecham o ciclo de feedback entre o que foi construído e o que efetivamente acontece em produção.

##### 4.2.1 Execution Service

É o serviço de memória operacional da plataforma. Cada vez que um agente ou orquestração é invocado — por REST, gRPC, Kafka ou Cron — o Execution Service cria um registro completo do que aconteceu: o trigger de entrada, cada chamada a agentes, APIs, RAGs e bancos de dados com seus payloads de request e response, as intervenções humanas solicitadas e concluídas, os alertas emitidos pelo fluxo e o output final. Esse rastro é o que torna possível depurar uma falha em produção, auditar o comportamento de um agente, identificar gargalos de latência e dar visibilidade a stakeholders sobre o que os fluxos de IA estão fazendo.

- O serviço deve registrar cada execução de orquestração ou agente com ID de correlação, trigger, ambiente, status e duração total
- O serviço deve armazenar o trace completo: chamadas externas (API, MCP, RAG, DB com request/response, duração e status), chamadas a agentes (input, output, role, duração e status), Human Infos e Human Tasks
- O serviço deve suportar Human Tasks com formulários dinâmicos com campos do tipo text, textarea, select, checkbox e checkbox-group, estado (pending/completed) e submissão pelo usuário
- O serviço deve suportar Human Infos com mensagens Markdown de nível info, success e warning emitidas pelo fluxo
- O serviço deve suportar status: success, error, running e human_review
- O serviço deve suportar triggers: REST, Cron, Kafka consumer e gRPC
- O serviço deve armazenar parâmetros de entrada e saída final da execução
- O serviço deve expor filtros por ambiente, status, orquestração/agente e período

##### 4.2.2 Conversation Service

Gerencia o histórico de trocas diretas entre usuários e agentes conversacionais — aqueles que expõem uma interface de chat multi-turn. Enquanto o Execution Service registra o que aconteceu tecnicamente em uma execução, o Conversation Service preserva o contexto semântico das interações: o que o usuário perguntou, o que o agente respondeu, em que ordem, ao longo de múltiplas sessões. Esse histórico tem valor tanto operacional (debugging de comportamento conversacional) quanto de negócio (análise de padrões de uso, identificação de gaps de conhecimento dos agentes e base para geração de datasets de fine-tuning).

- O serviço deve registrar conversas com agentes que possuem rota de conversação (hasConversation = true)
- O serviço deve armazenar histórico de mensagens com role (user/agent), conteúdo Markdown e timestamp
- O serviço deve associar cada conversa a um agente, usuário e título auto-gerado a partir da primeira mensagem
- O serviço deve suportar múltiplas conversas por agente e por usuário
- O serviço deve expor histórico por agente para consulta e busca por título

---

#### 4.3 Catalog Services

Os Catalog Services são o repositório de recursos compartilhados da plataforma. Eles centralizam o registro e a governança de tudo que agentes e orquestrações podem consumir: modelos de linguagem e ML, APIs externas, servidores MCP, bancos de dados, índices RAG, conectores corporativos, datasets e features. Sem um catálogo, cada time criaria suas próprias integrações de forma isolada, duplicando esforço e introduzindo inconsistências. Com o catálogo, um modelo registrado uma vez está disponível para todos os agentes da plataforma; um conector SAP configurado pelo Platform Admin pode ser reutilizado em qualquer orquestração sem que o AI Engineer precise entender o protocolo de autenticação subjacente. Os Catalog Services são o que torna a plataforma escalável para múltiplos times e projetos simultâneos.

##### 4.3.1 Model Service

Registro centralizado de todos os modelos disponíveis na plataforma — LLMs, modelos de ML clássico e modelos de embedding. Cada modelo é cadastrado com seu provedor, endpoint, credenciais e tags descritivos, e o serviço garante que qualquer agente ou orquestração possa selecioná-lo sem precisar configurar manualmente a integração. Suporta provedores externos (OpenAI, Google, Anthropic, Cohere, Voyage AI, Hugging Face) e modelos self-hosted via endpoint customizado, como instâncias vLLM rodando on-premises. É o contrato entre quem administra os modelos (Platform Admin) e quem os usa (AI Engineer, Orchestration Service, Model Gateway).

- O serviço deve registrar modelos do tipo LLM, ML e Embedding com nome, provedor, endpoint e credenciais
- O serviço deve suportar provedores externos: OpenAI, Google, Anthropic, Cohere, Voyage AI, Hugging Face
- O serviço deve suportar modelos self-hosted via endpoint customizado (ex: vLLM)
- O serviço deve disponibilizar modelos ativos para seleção no editor visual e no Model Gateway

##### 4.3.2 External API Service

Registro de integrações HTTP simples que agentes e orquestrações podem utilizar como ferramentas. Uma API cadastrada aqui representa um endpoint externo com URL base, lista de operações, tipo de autenticação e credenciais por ambiente. Diferentemente do Connector Service (que encapsula fluxos multi-step com sistemas corporativos complexos), o External API Service atende APIs mais diretas — um serviço de busca web, um endpoint de cotação de câmbio, uma API de notificação — onde uma única chamada HTTP já produz o resultado desejado. O registro centralizado evita que cada agente configure a mesma integração de forma independente e garante rotação de credenciais em um único ponto.

- O serviço deve registrar APIs externas com nome, descrição, URL base, endpoints e tipo de autenticação
- O serviço deve suportar autenticações: API key, OAuth2, JWT, PAT e sem autenticação
- O serviço deve disponibilizar APIs ativas para seleção no editor visual

##### 4.3.3 MCP Server Service

Registro dos servidores Model Context Protocol disponíveis na plataforma. Um servidor MCP expõe um catálogo de ferramentas que agentes podem invocar de forma padronizada — acesso ao sistema de arquivos, integração com Slack, operações no GitHub, consultas a um banco de dados — sem que o agente precise conhecer os detalhes de autenticação ou o protocolo de cada ferramenta. O MCP Server Service centraliza o cadastro desses servidores (com suporte a transportes stdio e HTTP), verifica sua conectividade e os disponibiliza para seleção no editor visual, tornando o ecossistema de ferramentas dos agentes extensível sem mudanças no código da plataforma.

- O serviço deve registrar servidores MCP com nome, transporte (stdio / HTTP) e lista de ferramentas
- O serviço deve verificar conectividade ao registrar ou atualizar um servidor
- O serviço deve disponibilizar servidores ativos para seleção no editor visual

##### 4.3.4 External DB Service

Registro dos bancos de dados externos que agentes e orquestrações podem consultar ou modificar como parte de seus fluxos. Centraliza as credenciais de conexão (host, porta, usuário, senha, opções TLS) por ambiente, de forma que o AI Engineer selecione o banco no editor visual sem precisar gerenciar segredos diretamente. Suporta os principais tipos de banco — relacionais (PostgreSQL, MySQL), documentais (MongoDB), chave-valor (Redis), serverless (DynamoDB) e analíticos (ClickHouse) — cobrindo os padrões de acesso mais comuns em fluxos de IA: leitura de contexto, persistência de resultados e consultas analíticas.

- O serviço deve registrar bancos de dados externos com tipo (PostgreSQL, MySQL, MongoDB, Redis, BigQuery, Elasticsearch), operação e credenciais
- O serviço deve disponibilizar bancos registrados para seleção no editor visual

##### 4.3.5 Knowledge Service

Registro centralizado das bases RAG disponíveis para os agentes — tanto as internas (geradas automaticamente pelo Documents Service a partir de grupos de documentos) quanto as externas (índices vetoriais pré-existentes como bases de produtos, wikis corporativas ou coleções de papers). Para cada base, o serviço armazena o store vetorial, o endpoint, o índice, o modelo de embedding e a configuração por ambiente, garantindo que o agente use o índice correto em cada contexto. É o ponto de articulação entre o Documents Service (que cria e atualiza as bases) e o RAG Gateway (que as serve em tempo de execução).

- O serviço deve registrar bases de conhecimento  store vetorial/graph, endpoint, índice e modelo de embedding
- O serviço deve suportar stores: pgvector, Pinecone, Qdrant, Weaviate e Neo4j
- O serviço deve permitir configuração independente por ambiente (dev / staging / production)
- O serviço deve disponibilizar RAGs ativos para seleção no editor visual de agentes

##### 4.3.6 Connector Service

Catálogo de conectores de negócio reutilizáveis que abstraem integrações com sistemas corporativos. Diferentemente de uma API simples (que expõe um único endpoint HTTP), um conector encapsula todo o protocolo de integração com um sistema de negócio — autenticação multi-step, descoberta de schema, mapeamento de entidades, paginação, retry com backoff e normalização de resposta — em uma unidade reutilizável e parametrizável. Um conector SAP, por exemplo, sabe como autenticar via OAuth2 com o sistema, descobrir os módulos disponíveis, mapear objetos de negócio (pedido, fornecedor, material) e lidar com as particularidades do protocolo OData — tudo isso transparente para o agente ou orquestração que o utiliza.

- O serviço deve registrar conectores de negócio com nome, sistema-alvo (SAP, Salesforce, ServiceNow, HubSpot, Oracle, etc.), descrição, versão e status
- O serviço deve armazenar o fluxo de autenticação do conector (OAuth2, SAML, API key, Basic Auth, token exchange) com credenciais por ambiente (dev / staging / production)
- O serviço deve suportar operações multi-step: authenticate → discover schema → map entities → execute operation → handle pagination → normalize response → retry on failure
- O serviço deve expor um catálogo de operações de alto nível por conector (ex: para Salesforce: `list_leads`, `create_opportunity`, `update_account`; para SAP: `get_purchase_orders`, `create_goods_receipt`)
- O serviço deve permitir parametrizar operações com inputs tipados (filtros, campos, datas, IDs de entidade)
- O serviço deve tratar automaticamente paginação, timeouts e retry com backoff exponencial, abstraindo esses detalhes do consumidor
- O serviço deve normalizar respostas para um schema canônico da plataforma, independentemente do formato proprietário do sistema-alvo
- O serviço deve disponibilizar conectores ativos para seleção no editor visual (como nó Tool/API especializado) e nas orquestrações via Agent Task
- O serviço deve permitir testar a conectividade e autenticação de um conector diretamente na Console UI antes de usá-lo em produção

---

#### 4.4 Governance Services

Os Governance Services garantem que a plataforma opere dentro dos limites definidos pela organização — financeiros, operacionais, de segurança e de conformidade. Conforme a adoção de IA cresce, cresce também a necessidade de visibilidade e controle: quanto estamos gastando com LLMs? Quais times estão consumindo mais recursos? Os agentes estão produzindo conteúdo dentro das políticas da empresa? Há anomalias que precisam de atenção? Cada serviço deste grupo responde a uma dessas perguntas de forma dedicada: o FinOps Service para custo, o Quota Service para limites de uso, o Alert Service para anomalias operacionais, o Watch Service para observabilidade em tempo real e o Guardrail Service para conformidade de conteúdo. Juntos, eles permitem que a organização escale o uso de IA sem perder controle sobre o que está acontecendo.

##### 4.4.1 FinOps Service

Provê visibilidade financeira completa sobre o uso da plataforma. Consolida e detalha os gastos gerados pelos fluxos de IA — LLMs (tokens in/out por modelo e provedor), infraestrutura Kubernetes (CPU, memória, GPU, storage, rede por namespace) e APIs externas (chamadas por serviço) — organizados em diferentes granularidades: da visão macro por área e equipe até o detalhe por agente e modelo específico. Permite filtrar por período (7, 30 ou 90 dias) e integra com o Quota Service para exibir o quanto de cada limite já foi consumido. O objetivo é dar ao Platform Admin e ao Team Lead a informação necessária para tomar decisões conscientes sobre modelos, arquitetura e alocação de orçamento.

- O serviço deve calcular e consolidar custos por área, equipe, orquestração (fluxo), agente e job de treinamento
- O serviço deve discriminar custos por categoria: Kubernetes (CPU, memória, GPU, storage, rede), LLM (tokens in/out por modelo) e External API (chamadas por serviço)
- O serviço deve suportar filtro por período (7d, 30d, 90d), com escalonamento proporcional de invocações, tokens e custos
- O serviço deve expor ranking de modelos LLM por custo total, chamadas e tokens consumidos
- O serviço deve expor breakdown de infraestrutura Kubernetes por aplicação (namespace, CPU, memória, GPU, storage, rede)
- O serviço deve integrar com o Quota Service para comparar gasto realizado vs limite configurado

##### 4.4.2 Quota Service

Controla os limites de uso da plataforma por usuário, time e área, evitando que um único agente, orquestração ou equipe consuma recursos de forma descontrolada. Cada regra define uma métrica (tokens, requests, custo, execuções, CPU, GPU·hours), um escopo (quem está sujeito ao limite), um período de apuração e uma ação ao ultrapassar o teto (block, warn ou throttle). Além das quotas por volume, suporta rate limits para controlar a velocidade de consumo (requisições por segundo, conexões concorrentes). É a camada que transforma a política de uso da organização em controle técnico automatizado, sem depender de intervenção manual para cada violação.

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

Sistema de alertas baseado em regras que monitora métricas de infraestrutura, aplicação, custo e segurança e notifica os responsáveis quando condições de interesse são detectadas. Cada regra define uma métrica a observar, um operador de comparação, um threshold, uma janela de avaliação, um escopo (global, namespace, flow, agent ou team) e os canais de notificação (e-mail, Slack, Teams, PagerDuty, webhook). Quando uma condição é atendida, um evento é disparado e percorre o ciclo de vida firing → acknowledged → resolved, com registro de quem atuou e quando. É o serviço que mantém a equipe informada proativamente, sem que precisem monitorar dashboards manualmente.

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

Provê observabilidade em tempo real e histórica dos fluxos de IA em execução. Coleta e expõe métricas de performance (requests/min, latência p50/p99, taxa de erro, throughput), métricas de custo (tokens in/out, gasto em 24h) e métricas de infraestrutura Kubernetes (réplicas, CPU, memória, saúde por ambiente). Além das séries temporais, mantém os traces das execuções recentes com timeline por estágio — incluindo input e output de cada etapa — e logs estruturados por nível e fonte. É a ferramenta de diagnóstico do dia a dia: quando algo está lento, caro ou falhando, o Watch Service é o primeiro lugar para investigar.

- O serviço deve coletar e expor métricas em tempo real: requests/min, latência p50/p99, taxa de erro, taxa de sucesso, throughput e custo de tokens em 24h
- O serviço deve armazenar série histórica de latência (p50 vs p99), taxa de erro, taxa de sucesso, throughput e consumo de tokens (input vs output) por dia para os últimos 12 dias
- O serviço deve coletar e expor traces de execução com ID, duração por estágio (com timeline), tokens, status e timestamp; cada estágio deve expor input e output expandíveis
- O serviço deve coletar e expor logs estruturados de execução com timestamp, nível (info/warn/error) e source (orchestration/agent)
- O serviço deve suportar auto-refresh de traces a cada 5 segundos na Console UI
- O serviço deve expor métricas de infraestrutura Kubernetes: réplicas ativas/desejadas, CPU, memória, pods e status de saúde por ambiente (healthy/degraded/down)
- O serviço deve expor estatísticas de tempo médio por componente/estágio da orquestração para identificação de gargalos

##### 4.4.5 Guardrail Service

O Guardrail Service é a camada de proteção de conteúdo e conformidade da plataforma. Ele opera de forma transversal ao ciclo de execução dos agentes e orquestrações — inspecionando entradas antes de chegarem ao LLM, saídas antes de serem entregues ao usuário, e dados em trânsito entre componentes. Enquanto o Alert Service monitora métricas de infraestrutura e custo, o Guardrail Service monitora o *conteúdo* e o *comportamento* dos fluxos de IA, garantindo que as respostas produzidas estejam dentro dos limites de segurança, privacidade e conformidade definidos pela organização. Em contextos regulados (saúde, finanças, governo), essa camada é o que torna viável operar agentes autônomos em produção.

- O serviço deve avaliar entradas (prompts) e saídas (respostas) de agentes e orquestrações em tempo real antes da entrega ao usuário ou ao próximo componente do fluxo
- O serviço deve suportar detecção e bloqueio de **prompt injection**: tentativas de manipular o comportamento do agente via instruções embutidas no input do usuário
- O serviço deve suportar detecção e bloqueio de **jailbreak**: tentativas de contornar as instruções de sistema e forçar o agente a operar fora das diretrizes configuradas
- O serviço deve suportar **PII masking**: identificação e mascaramento automático de dados pessoais (CPF, e-mail, telefone, nome completo, número de cartão) em entradas e saídas
- O serviço deve suportar detecção de **toxicidade**: classificação de conteúdo ofensivo, discriminatório ou inadequado com limiar configurável por aplicação
- O serviço deve suportar detecção de **alucinação**: verificação de aderência da resposta ao contexto fornecido (RAG, prompt, histórico), com score de groundedness
- O serviço deve suportar **blocked terms**: listas de termos ou padrões proibidos configuráveis por organização, time ou aplicação
- O serviço deve suportar **off-topic detection**: verificação de que a resposta está dentro do escopo temático definido para o agente
- O serviço deve suportar **max tokens enforcement**: truncamento ou bloqueio de respostas que ultrapassem o limite de tokens configurado
- O serviço deve suportar **compliance policies**: regras de conformidade customizáveis por setor (ex: não citar concorrentes, não dar conselhos médicos, não recomendar investimentos)
- O serviço deve registrar cada avaliação de guardrail com: tipo de regra, resultado (pass/fail), score, fragmento ofensivo (quando aplicável), ID da execução e timestamp
- O serviço deve permitir configurar a ação ao detectar violação: **block** (bloqueia a resposta e retorna erro), **redact** (remove ou mascara o trecho problemático) ou **warn** (permite passar mas registra e alerta)
- O serviço deve expor métricas de guardrail na observabilidade: taxa de violações por tipo de regra, por agente e por período
- O serviço deve integrar com o Suite Cases Service, permitindo que testes de guardrail executem as mesmas políticas definidas para produção

---

#### 4.5 Test Services

Os Test Services fecham o ciclo de qualidade da plataforma. Antes de um agente ou orquestração ir para produção — ou permanecer lá — é preciso ter confiança de que ele se comporta como esperado em diferentes cenários: responde corretamente às perguntas do domínio, não produz conteúdo inadequado, resiste a tentativas de manipulação e opera dentro dos limites de latência e throughput definidos. O Suite Cases Service oferece a infraestrutura para definir, executar e rastrear esses testes de forma sistemática e repetível. O Playground Service complementa com experimentação interativa, permitindo comparar modelos, testar pipelines RAG e validar modelos de ML antes de integrá-los em produção.

##### 4.5.1 Suite Cases Service

Infraestrutura de testes automatizados para agentes, orquestrações e bases RAG. Organiza os testes em suites com alvo definido, ambiente de execução e agendamento, e suporta quatro tipos de caso: **functional** (validação de comportamento esperado), **quality** (avaliação por LLM-judge com métricas como faithfulness e relevância), **guardrails** (verificação de conformidade com políticas de conteúdo, PII e segurança) e **performance** (latência, throughput e concorrência). A separação por tipo permite que equipes diferentes — QA, segurança, engenharia — contribuam com casos no mesmo conjunto de testes. Os resultados são rastreados historicamente, tornando visível a evolução da qualidade do agente ao longo do tempo.

- O serviço deve criar e gerenciar suites de testes com alvo (orchestration / agent / rag), ambiente e agendamento
- O serviço deve suportar casos de teste do tipo: functional, quality (LLM-judge), guardrails e performance
- O serviço deve suportar métricas de qualidade: faithfulness, answer_relevancy, context_precision, context_recall, toxicity, bias, coherence e groundedness
- O serviço deve suportar guardrails: no_pii, no_secrets, no_prompt_injection, no_jailbreak, no_hallucination, no_offtopic, max_tokens e blocked_terms
- O serviço deve suportar métricas de performance: p95_latency, max_latency, min_throughput_rps e concurrency
- O serviço deve suportar métricas RAG: recall mínimo, precisão mínima e documentos esperados
- O serviço deve registrar resultado de cada execução de teste com status, duração e timestamp
- O serviço deve expor histórico de execuções por suite e por caso de teste

##### 4.5.2 Playground Service

Ambiente de experimentação interativa que permite testar e comparar recursos da plataforma antes de integrá-los em agentes ou orquestrações. Opera em três modos independentes: **LLM** (compara até 4 modelos lado a lado com o mesmo prompt, exibindo latência, tokens e custo por resposta), **Machine Learning** (executa inferência single com explicabilidade via contribuições SHAP ou inferência batch a partir de CSV) e **RAG** (testa pipelines de retrieval com controle de estratégia, top-k e reranking, exibindo chunks recuperados e a resposta fundamentada). O resultado de cada sessão é registrado como conversa, criando histórico de experimentos e base para decisões de arquitetura.

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

---

## Complemento — ML & Deep Learning em Completude

As seções a seguir cobrem os componentes e features ausentes do arquivo de requisitos original para atender Machine Learning clássico e Deep Learning em sua completude. O diagnóstico de lacunas é baseado no mapeamento `MAPEAMENTO_GENAI_VS_ML.md`, que identificou que o pipeline completo de ML operacional (feature engineering → experiment tracking → model registry → serving dedicado → monitoramento de drift) ainda não possuía requisitos formalizados.

---

### A. Build Services — Complementos ML/DL

#### A.1 Experiment Tracking Service

Rastreia cada run de treinamento como um experimento reprodutível — capturando código, hiperparâmetros, métricas, artefatos e ambiente de execução em um único registro imutável. É o equivalente ao MLflow Tracking ou Weights & Biases para a plataforma: qualquer job executado pelo Training Service gera automaticamente um run no Experiment Tracking Service, permitindo que o Data Scientist compare runs, reproduza resultados e promova o melhor artefato para o Model Registry sem perda de rastreabilidade. Sem ele, experimentos ficam dispersos em notebooks e pastas locais, tornando inviável a governança de modelos em escala.

- O serviço deve criar e gerenciar **projetos** de experimentação agrupando runs relacionados por objetivo (ex: "churn-prediction-q3", "bert-classification-v2")
- O serviço deve registrar cada **run** com: ID único, projeto, status (running / completed / failed / killed), duração, autor, timestamp de início e fim
- O serviço deve capturar e armazenar **hiperparâmetros** por run: todos os valores informados ao criar o job no Training Service (epochs, batch size, learning rate, optimizer, seed, arquitetura, etc.)
- O serviço deve capturar e armazenar **métricas por epoch/step** com suporte a séries temporais para visualização de curvas de aprendizado (loss, val_loss, accuracy, f1, rmse, mae, auc, perplexity)
- O serviço deve suportar registro de **métricas customizadas** definidas pelo usuário além das métricas padrão do Training Service
- O serviço deve armazenar **artefatos** produzidos por cada run: pesos do modelo, checkpoints, gráficos de confusão, curvas ROC, relatórios SHAP e arquivos de configuração
- O serviço deve registrar o **ambiente de execução** do run: versão de Python, versão de frameworks (sklearn, pytorch, etc.), tipo de hardware (CPU/GPU, quantidade), imagem Docker usada
- O serviço deve registrar o **código-fonte** vinculado ao run: commit SHA, branch e repositório Git de origem
- O serviço deve permitir **comparação lado a lado** de múltiplos runs dentro do mesmo projeto, com visualização de métricas em gráficos sobrepostos e tabela de hiperparâmetros
- O serviço deve permitir **filtrar e ordenar** runs por métrica, status, autor e período
- O serviço deve suportar **tags** por run para classificação livre (ex: `baseline`, `candidate`, `producao`)
- O serviço deve permitir **promover um run** para o Model Registry diretamente da tela de detalhes do experimento, registrando a linhagem run → artefato → versão de modelo
- O serviço deve expor KPIs agregados por projeto: total de runs, runs completados, melhor métrica principal e último run ativo
- O serviço deve integrar com o Training Service, criando automaticamente um run ao iniciar um job de treinamento

#### A.2 Feature Store Service

Centraliza a engenharia, persistência, versionamento e servimento de features para modelos de ML e DL. É o serviço que elimina o "training-serving skew" — a diferença entre as features calculadas no treinamento e as disponíveis em produção — e viabiliza o reaproveitamento de features entre projetos diferentes. Sem um Feature Store, cada pipeline de ML recalcula as mesmas features de forma independente, criando duplicação, inconsistência e impossibilidade de rastreabilidade entre o modelo treinado e os dados que ele efetivamente consumiu. O Feature Store é o contrato entre quem gera features (Data Engineer, Feature Pipeline) e quem as consome (Training Service, Model Serving).

- O serviço deve criar e gerenciar **Feature Groups**: coleções nomeadas de features relacionadas a uma entidade (ex: `customer_features`, `transaction_features`, `product_features`)
- Cada Feature Group deve definir: nome, descrição, entidade principal (entity key), lista de features com tipo (int, float, string, boolean, array, embedding), owner, tags e status (active / deprecated)
- O serviço deve suportar **Feature Pipelines**: definição de como cada Feature Group é calculado a partir de fontes de dados (External DB, Kafka, API, S3/GCS, Dataset) com agendamento (batch periódico, streaming contínuo ou on-demand)
- O serviço deve persistir features em **offline store** (Parquet em S3/GCS ou ClickHouse) para uso em treinamento com queries por entidade e por ponto no tempo (point-in-time correct join)
- O serviço deve persistir features em **online store** (Redis ou DynamoDB) para servimento de baixa latência em tempo de inferência (<10ms p99)
- O serviço deve garantir consistência entre offline e online store, eliminando training-serving skew
- O serviço deve versionar Feature Groups: cada alteração de schema cria uma nova versão, mantendo compatibilidade retroativa para modelos que dependem da versão anterior
- O serviço deve registrar **linhagem de features**: quais datasets, queries e transformações geraram cada Feature Group, com rastreabilidade bidirecional (feature → origem, modelo → features usadas)
- O serviço deve expor **catálogo de features** com busca por nome, entidade e tag para reaproveitamento entre projetos
- O serviço deve disponibilizar features para seleção no Training Service (offline) e no Model Serving Service (online) via API tipada
- O serviço deve registrar **estatísticas de features** por pipeline run: distribuição de valores, % de nulos, min/max/média/desvio para detecção de data drift
- O serviço deve expor API de **point-in-time retrieval**: dado um conjunto de entidades e um timestamp, retorna o valor das features como estavam naquele momento — essencial para reprodutibilidade de treinamento
- O serviço deve suportar tipos de features: **batch** (calculadas periodicamente), **streaming** (atualizadas em tempo real via Kafka) e **on-demand** (calculadas na hora da requisição a partir de features existentes)

#### A.3 ML Pipeline Service

Orquestra pipelines de dados e ML estruturados em DAGs — diferente do Orchestration Service (que coordena agentes e fluxos de negócio), o ML Pipeline Service foca em pipelines reprodutíveis de pré-processamento, treinamento, avaliação e validação de modelos. É o equivalente ao Kubeflow Pipelines ou Apache Airflow especializado para workloads de ML: cada etapa é um step isolado com inputs, outputs e dependências declaradas, executado em container próprio com rastreabilidade completa de artefatos entre steps. O resultado de um pipeline é sempre um artefato candidato a promoção no Model Registry.

- O serviço deve criar e gerenciar **pipelines de ML** como DAGs de steps com dependências declaradas, inputs/outputs tipados e parâmetros configuráveis
- O serviço deve suportar os seguintes tipos de step nativos:
  - **Data Ingestion**: coleta de dados de External DB, S3/GCS, Kafka ou API do catálogo
  - **Feature Engineering**: transformações tabulares (normalização, encoding, imputação, PCA, binning)
  - **Data Validation**: validação de schema, distribuição de features e data quality com Great Expectations
  - **Train**: invoca o Training Service com configuração de hiperparâmetros e registra o run no Experiment Tracking Service
  - **Evaluate**: calcula métricas de avaliação (accuracy, F1, AUC-ROC, RMSE, MAE) sobre conjunto de teste
  - **Compare**: compara métricas do run atual com o modelo campeão no Model Registry e define se o candidato deve ser promovido
  - **Register**: publica o artefato no Model Registry com status `staging` ou `production`
  - **Deploy**: aciona o deploy do modelo no ML Serving Service
  - **Notify**: envia notificação (e-mail, Slack) ao completar ou falhar o pipeline
- O serviço deve suportar **step customizado** via Script Task (Python/Shell) com imagem Docker configurável
- O serviço deve versionar pipelines com histórico de runs, status e duração por step
- O serviço deve suportar passagem de **artefatos entre steps** (datasets, modelos, relatórios) com armazenamento em object storage (S3/GCS) e referência por URI
- O serviço deve suportar **triggers**: manual, agendamento (cron), push em repositório Git e conclusão de job no Training Service
- O serviço deve exibir DAG visual do pipeline com status de cada step em tempo real durante a execução
- O serviço deve registrar logs por step com nível (info/warn/error) e suporte a download
- O serviço deve registrar **parâmetros e métricas** de cada run de pipeline, integrado ao Experiment Tracking Service
- O serviço deve suportar **paralelismo de steps** independentes para otimizar tempo de execução do pipeline
- O serviço deve integrar com a Feature Store para consumo de features em steps de treinamento e avaliação

---

### B. Catalog Services — Complementos ML/DL

#### B.1 Model Registry Service

Repositório central de todos os artefatos de modelos treinados — LLMs fine-tuned, modelos de ML clássico, redes neurais DL e modelos de embedding. É o contrato entre quem treina (Training Service, ML Pipeline) e quem serve (ML Serving, Model Gateway): um artefato só pode ser invocado em produção se foi registrado, versionado e promovido neste registry. Diferentemente do Model Service (que registra modelos de provedores externos para uso no editor visual), o Model Registry gerencia o ciclo de vida dos modelos produzidos internamente na plataforma — com linhagem completa de origem, métricas de avaliação, aprovação e status por ambiente.

- O serviço deve registrar **versões de modelos** produzidas pelo Training Service e pelo ML Pipeline Service, com nome, versão semântica, tipo (llm, ml-classification, ml-regression, ml-forecasting, ml-clustering, dl-vision, dl-nlp, dl-multimodal, embedding), framework, autor e timestamp
- Cada versão de modelo deve armazenar: URI do artefato (weights, pickle, ONNX, savedmodel), métricas de avaliação, hiperparâmetros, dataset de treinamento (referência ao Dataset Service), run do Experiment Tracking de origem e hardware usado
- O serviço deve gerenciar **status por ambiente**: `none` → `staging` → `production` → `archived`, com histórico de promoções e aprovações
- O serviço deve suportar **aprovação de promoção** para produção: requer aprovação explícita de um responsável (workflow de aprovação com e-mail e registro de quem aprovou, quando e com qual justificativa)
- O serviço deve exibir **linhagem completa** do modelo: dataset → pipeline / training job → experimento → artefato → serving endpoint
- O serviço deve suportar **comparação de versões**: lado a lado com métricas, hiperparâmetros e distribuição de features entre a versão candidata e o campeão atual em produção
- O serviço deve suportar **modelo campeão / challenger**: marcar uma versão como campeão e uma como challenger para A/B testing ou shadow deployment no ML Serving
- O serviço deve permitir **rollback** de versão de produção para a versão anterior com registro da operação
- O serviço deve suportar tags e descrição livre por versão para facilitar busca no catálogo
- O serviço deve disponibilizar modelos registrados para seleção no ML Serving Service, no Playground e no Model Gateway
- O serviço deve registrar **dependências de runtime** por versão: versão de Python, pacotes instalados (requirements.txt), variáveis de ambiente necessárias para servimento correto
- O serviço deve expor KPIs: total de modelos registrados, versões em produção, versões em staging e modelos arquivados

#### B.2 Dataset Catalog Service

Registro centralizado de todos os datasets disponíveis na plataforma — tanto os construídos pelo Dataset Service quanto os registrados externamente (S3, GCS, repositório Git, banco de dados). Complementa o Dataset Service (que constrói e versiona datasets) com uma camada de descoberta e governança: qualquer dataset, independentemente de onde está armazenado, pode ser catalogado aqui com schema, estatísticas, linhagem e permissões de acesso. É o ponto de partida para Data Scientists descobrirem dados disponíveis sem precisar ir a múltiplos sistemas.

- O serviço deve registrar datasets com nome, descrição, modalidade (tabular, timeseries, text, text+image, audio, video, multimodal), formato (CSV, Parquet, Delta Lake, JSONL, TFRecord, HDF5, Arrow), localização (S3 URI, GCS URI, banco de dados, path local) e owner
- O serviço deve armazenar **schema inferido ou declarado** por dataset: nomes de colunas, tipos e cardinalidade para datasets tabulares; estrutura de campos para JSONL; dimensões de tensores para TFRecord/HDF5
- O serviço deve calcular e armazenar **estatísticas por dataset**: número de registros, tamanho em bytes, % de nulos por coluna, distribuição de classes (para classificação), range de datas (para séries temporais)
- O serviço deve registrar **linhagem de datasets**: origem dos dados (fontes), transformações aplicadas (filtros, splits, anonimização) e datasets derivados
- O serviço deve suportar **versionamento de datasets**: cada novo build ou upload cria uma nova versão com histórico de mudanças
- O serviço deve suportar **splits declarados**: registro dos subconjuntos train/validation/test com proporção e número de amostras por split
- O serviço deve expor datasets para seleção no Training Service, no ML Pipeline Service e no Feature Store Service
- O serviço deve suportar **data cards**: documentação estruturada do dataset com descrição de uso pretendido, limitações conhecidas, vieses identificados e informações de licença
- O serviço deve controlar **permissões de acesso** por dataset: público (toda a organização), restrito (times específicos) ou privado (apenas o owner)
- O serviço deve registrar **lineage de uso**: quais jobs de treinamento e pipelines consumiram cada versão de dataset, com rastreabilidade bidirecional

#### B.3 Broker Service (Catalog)

Registro centralizado dos brokers de mensageria disponíveis na plataforma, consumidos por orquestrações (Message Consumer / Producer), pelo Feature Store (streaming features) e pelo ML Pipeline Service (triggers). Centraliza credenciais de conexão por ambiente de forma que nenhum serviço precise configurar acesso ao broker de forma individual.

- O serviço deve registrar brokers de mensageria com tipo (Kafka, RabbitMQ, NATS, SQS, Pub/Sub, Redis Streams), nome, host/endpoint, credenciais por ambiente (dev / staging / production) e status de conectividade
- O serviço deve suportar registro de **tópicos e filas** por broker, com nome, partições (Kafka) e tipo de payload esperado (JSON, Avro, Protobuf)
- O serviço deve verificar conectividade do broker e expor status na Console UI (connected / degraded / disconnected)
- O serviço deve disponibilizar brokers registrados para seleção nos nós Message Consumer e Message Producer do editor de orquestração e nas Feature Pipelines do Feature Store

---

### C. Build Services — ML Serving

#### C.1 ML Serving Service

Gerencia o deploy e o ciclo de vida de endpoints de inferência para modelos de ML e DL registrados no Model Registry. É o serviço que transforma um artefato versionado em um endpoint REST chamável com SLA definido, autoscaling e rollout controlado. Enquanto o Model Gateway expõe uma fachada unificada para chamadas de modelos (LLM, ML e Embedding), o ML Serving Service é a camada de gerenciamento dos deployments físicos dos modelos ML/DL — com suporte a estratégias de deploy seguro (canary, blue-green, shadow) e integração nativa com o Model Monitoring Service para detecção de degradação em produção.

- O serviço deve criar e gerenciar **endpoints de inferência** para modelos registrados no Model Registry, com nome, modelo vinculado, versão, ambiente, instância (CPU/GPU, memória), número de réplicas e SLA alvo
- O serviço deve suportar **frameworks de serving**: scikit-learn (pickle/joblib), XGBoost (`.ubj`), LightGBM, PyTorch (TorchServe), TensorFlow (TF Serving), ONNX Runtime e modelos customizados via contêiner Docker
- O serviço deve suportar **estratégias de deploy**:
  - **Recreate**: substitui a versão anterior diretamente (downtime aceito)
  - **Rolling**: atualiza pods gradualmente com verificação de saúde entre batches
  - **Canary**: envia uma porcentagem configurável de tráfego para a nova versão, com monitoramento automático antes de promover 100%
  - **Blue-Green**: mantém duas versões ativas e alterna o tráfego instantaneamente
  - **Shadow**: envia tráfego de produção para a nova versão em paralelo sem afetar respostas ao cliente (shadow mode para validação)
- O serviço deve configurar **autoscaling** por endpoint: mínimo e máximo de réplicas, métrica de escala (CPU, requests/s, latência p99) e cool-down
- O serviço deve expor **endpoint REST** para inferência single (JSON in → JSON out) com latência alvo <100ms p99 para modelos tabulares
- O serviço deve suportar **inferência batch assíncrona**: aceita arquivo CSV/Parquet, processa em background e notifica ao concluir com URL do resultado
- O serviço deve gerenciar status de ciclo de vida do endpoint: `creating` → `active` → `updating` → `degraded` → `stopped`
- O serviço deve registrar métricas de runtime por endpoint: requests/s, latência p50/p95/p99, taxa de erro, uso de CPU/GPU e memória
- O serviço deve integrar com o Model Registry para garantir que apenas versões aprovadas para o ambiente sejam servidas
- O serviço deve suportar **A/B testing e canary automático**: divide tráfego entre versão campeão e challenger com roteamento por peso configurável, registrando métricas independentes por versão
- O serviço deve suportar **pre-processing e post-processing hooks**: scripts Python executados antes e depois da inferência para feature transformation e formatação de resposta
- O serviço deve expor o endpoint ativo para seleção no nó **Agent Task** do editor de orquestração como ferramenta ML e no Model Gateway

---

### D. Governance Services — Complementos ML/DL

#### D.1 Model Monitoring Service

Monitora modelos de ML e DL em produção para detecção de degradação de performance, drift de dados e anomalias de comportamento. É o serviço que fecha o ciclo MLOps: após o deploy, o modelo precisa ser observado continuamente para que degradações sejam detectadas antes de impactarem o negócio. Enquanto o Watch Service monitora a infraestrutura de runtime (latência, CPU, erros), o Model Monitoring Service monitora a *qualidade estatística* das predições — drift de features, drift de predições e, quando rótulos estão disponíveis, drift de performance real.

- O serviço deve criar **monitores por endpoint de serving** com frequência de verificação (por batch, diária, semanal) e thresholds de alerta configuráveis
- O serviço deve detectar **data drift** nas features de entrada: comparação da distribuição de features em produção versus a distribuição de referência do dataset de treinamento, com métricas por tipo de feature:
  - Features numéricas: KL divergence, PSI (Population Stability Index), Wasserstein distance
  - Features categóricas: chi-square test, Jensen-Shannon divergence
  - Features de embedding: cosine similarity drift
- O serviço deve detectar **prediction drift**: monitorar a distribuição das predições ao longo do tempo e alertar quando desviar do baseline registrado no treinamento
- O serviço deve suportar **performance monitoring** quando rótulos reais (ground truth) estão disponíveis: calcular accuracy, F1, AUC-ROC (classificação) ou RMSE, MAE, MAPE (regressão/forecasting) por janela de tempo e comparar com o baseline do treinamento
- O serviço deve suportar **concept drift detection**: monitorar a relação entre features e target ao longo do tempo para identificar mudanças na relação features → predição que indiquem necessidade de retraining
- O serviço deve registrar **baseline de referência** no momento do deploy: distribuição de features de treinamento, distribuição de predições e métricas de avaliação do conjunto de teste
- O serviço deve exibir **dashboards de monitoramento** por modelo: série temporal de drift scores, distribuição de features (atual vs referência), distribuição de predições (atual vs referência) e evolução de métricas de performance
- O serviço deve suportar **alertas automáticos** integrados ao Alert Service: disparar alerta quando drift score ultrapassar threshold configurado ou quando performance cair abaixo do mínimo aceitável
- O serviço deve suportar **feedback loop de rótulos**: interface para submissão de ground truth (rótulos reais) para amostras já preditas, viabilizando cálculo de performance real e geração de novos datasets de retraining
- O serviço deve suportar **detecção de outliers** em inferência: identificar amostras de entrada com características fora da distribuição de treinamento (out-of-distribution detection) e registrá-las para revisão
- O serviço deve registrar **explicações de predição** por amostra quando SHAP ou LIME estiver habilitado no serving, com armazenamento e consulta de importância de features por predição
- O serviço deve disparar **retraining automático** ao atingir threshold de drift configurado: cria novo job no Training Service ou aciona novo run no ML Pipeline Service com flag de origem `auto-retrain`
- O serviço deve integrar com o Model Registry para registrar eventos de degradação no histórico da versão em produção

#### D.2 Bias & Fairness Service

Avalia e monitora viés e equidade em modelos de ML e DL — crítico para modelos que tomam decisões sobre pessoas (crédito, contratação, triagem médica, judicialização). O serviço analisa se o modelo produz predições sistematicamente diferentes para grupos protegidos (gênero, raça, faixa etária, região) e registra métricas de fairness formais, tanto em avaliação offline (sobre dataset de teste) quanto em monitoramento contínuo em produção.

- O serviço deve calcular **métricas de fairness por grupo protegido** (atributo sensível configurável) sobre datasets de avaliação:
  - **Demographic Parity**: diferença na taxa de predição positiva entre grupos
  - **Equalized Odds**: diferença em TPR e FPR entre grupos
  - **Equal Opportunity**: diferença em TPR entre grupos
  - **Predictive Parity**: diferença em precision entre grupos
  - **Individual Fairness**: consistência de predição para indivíduos similares
- O serviço deve suportar **análise interseccional**: combinação de múltiplos atributos sensíveis (ex: gênero + faixa etária)
- O serviço deve integrar com o Experiment Tracking Service para registrar métricas de fairness nos runs de treinamento
- O serviço deve integrar com o Model Registry para bloquear promoção de modelos que excedam thresholds de unfairness configurados pela organização
- O serviço deve suportar **monitoramento contínuo de fairness** em produção: calcular métricas de fairness por janela de tempo sobre predições reais e alertar em caso de degradação
- O serviço deve gerar **relatórios de fairness** exportáveis (PDF/HTML) com visualizações de distribuição por grupo e métricas detalhadas por atributo sensível

#### D.3 Complementos ao Alert Service para ML/DL

Os itens abaixo complementam os requisitos existentes do Alert Service (seção 4.4.3) com categorias e métricas específicas de ML/DL:

- O serviço deve suportar categoria `ml_monitoring` com as seguintes métricas:
  - `data_drift_score` — PSI / KL divergence de features de entrada
  - `prediction_drift_score` — drift da distribuição de predições
  - `model_accuracy` — accuracy / F1 / RMSE realizado (quando ground truth disponível)
  - `ood_rate` — taxa de amostras out-of-distribution detectadas
  - `retraining_needed` — flag booleano disparado pelo Model Monitoring Service
- O serviço deve suportar categoria `ml_pipeline` com as seguintes métricas:
  - `pipeline_failure` — falha em qualquer step do ML Pipeline
  - `feature_pipeline_lag` — atraso no processamento de Feature Pipelines do Feature Store
  - `training_job_failure` — falha de job no Training Service
  - `data_quality_failure` — violação de regras de data quality no step de Data Validation
- O serviço deve suportar escopo de regra `model` (um modelo específico do Model Registry) e `feature_group` (um Feature Group específico do Feature Store) além dos escopos já existentes

#### D.4 Complementos ao FinOps Service para ML/DL

Os itens abaixo complementam os requisitos existentes do FinOps Service (seção 4.4.1) com categorias de custo específicas de ML/DL:

- O serviço deve calcular e discriminar custo por **endpoint de ML Serving**: horas de instância ativas, tipo de hardware (CPU/GPU), requests processados e custo por predição
- O serviço deve calcular e discriminar custo por **Feature Pipeline**: custo de processamento de feature engineering em batch e streaming (compute, storage de features no offline/online store)
- O serviço deve calcular e discriminar custo por **ML Pipeline run**: custo agregado de cada step (compute por duração, storage de artefatos intermediários)
- O serviço deve expor **custo de armazenamento de artefatos** no Model Registry: tamanho total de pesos, checkpoints e artefatos por modelo e por versão
- O serviço deve expor **custo de armazenamento de features**: offline store (S3/GCS) e online store (Redis/DynamoDB) por Feature Group

---

### E. Test Services — Complementos ML/DL

#### E.1 Complementos ao Suite Cases Service para ML/DL

Os itens abaixo complementam os requisitos existentes do Suite Cases Service (seção 4.5.1) para cobrir testes específicos de modelos de ML e DL:

- O serviço deve suportar target `model` (modelo registrado no Model Registry) e target `feature_group` (Feature Group do Feature Store) além dos targets já existentes
- O serviço deve suportar tipo de caso `ml_evaluation` com as seguintes métricas configuráveis:
  - Classificação: `accuracy`, `precision`, `recall`, `f1_score`, `auc_roc`, `log_loss`, `confusion_matrix`
  - Regressão: `rmse`, `mae`, `mape`, `r2_score`, `max_error`
  - Forecasting: `mape`, `smape`, `wape`, `coverage_interval`
  - Clustering: `silhouette_score`, `davies_bouldin`, `calinski_harabasz`
  - DL — Visão: `top1_accuracy`, `top5_accuracy`, `mean_iou` (detecção/segmentação), `map` (object detection)
  - DL — NLP: `bleu`, `rouge_l`, `bert_score`, `exact_match`
  - Embedding: `mrr` (Mean Reciprocal Rank), `ndcg`, `recall_at_k`
- O serviço deve suportar tipo de caso `ml_fairness` integrado ao Bias & Fairness Service: validar que métricas de fairness estão dentro de thresholds aceitáveis para um conjunto de avaliação com atributos sensíveis declarados
- O serviço deve suportar tipo de caso `data_quality` integrado ao Feature Store: validar regras de qualidade de dados (schema, nulos, range, unicidade) sobre uma amostra do Feature Group antes de usá-lo em treinamento
- O serviço deve suportar tipo de caso `model_robustness` para validação de comportamento sob perturbação de entrada:
  - **Adversarial inputs**: inputs modificados levemente para testar estabilidade de predição
  - **Missing features**: substituição de features por nulo para testar fallback
  - **Distribution shift**: amostras sintetizadas de distribuições deslocadas para testar generalização
- O serviço deve suportar configuração de **dataset de referência** por suite ML: selecionar o conjunto de teste a ser usado na avaliação (referência ao Dataset Catalog Service)
- O serviço deve registrar **curva de performance histórica** por suite: evolução de métricas de avaliação ao longo de múltiplos runs, tornando visível a trajetória de qualidade do modelo

#### E.2 Complementos ao Playground Service para ML/DL

Os itens abaixo complementam os requisitos existentes do Playground Service (seção 4.5.2) para Deep Learning:

- O modo **Machine Learning** deve ser expandido para suportar modelos de DL com inferência single e batch:
  - **DL — Visão**: upload de imagem, seleção de modelo (classificação, detecção de objetos, segmentação), exibição de predição com bounding boxes / máscara e score de confiança por classe
  - **DL — NLP**: input de texto livre ou upload de arquivo, seleção de modelo (classificação de texto, NER, summarization, translation), exibição de predição com highlighting de entidades ou span de saída
  - **DL — Tabular / Estruturado**: input manual de features ou upload de CSV, exibição de predição com SHAP values e visualização de feature importance
- O serviço deve suportar **comparação de versões de modelo** no Playground: testar o mesmo input na versão atual em produção e em versão candidata lado a lado, com métricas de latência e confiança por versão
- O serviço deve suportar **stress test interativo** no Playground ML: executar N requisições concorrentes configuráveis e exibir distribuição de latência (p50/p95/p99) e throughput
- O serviço deve exibir **perfil de inferência** para modelos DL quando disponível: tempo por camada, uso de memória de GPU e FLOPS estimados

---

### F. Access Layer — Complementos ML/DL

#### F.1 Console UI — Navegação e Dashboard ML/DL

Os itens abaixo complementam os requisitos de Console UI (seção 1.1) para cobrir os novos serviços ML/DL:

- Na seção **Build**, o sistema deve incluir os itens:
  - **ML Pipelines** — criação e monitoramento de pipelines de ML (ML Pipeline Service)
  - **Experiments** — listagem e comparação de experimentos (Experiment Tracking Service)
  - **Feature Store** — gerenciamento de Feature Groups e Feature Pipelines
- Na seção **Catalog**, o sistema deve incluir o item **Model Registry** (separado do Model Service de provedores externos)
- Na seção **Governance**, o sistema deve incluir o item **Model Monitoring** — dashboard de drift, performance e fairness de modelos em produção
- O dashboard principal deve exibir métricas ML globais adicionais: modelos ativos em produção, endpoints de serving ativos, taxa média de drift detectado na última semana e jobs de retraining automático disparados no período

#### F.2 CLI — Complementos ML/DL

Os itens abaixo complementam os requisitos de CLI (seção 1.2):

- O sistema deve oferecer comandos para **gerenciamento do Model Registry**: listar versões, promover versão (staging → production), fazer rollback e arquivar versão
- O sistema deve oferecer comandos para **execução de ML Pipelines**: iniciar run, cancelar, listar runs e consultar status e logs por step
- O sistema deve oferecer comandos para **gerenciamento de Feature Groups**: criar, atualizar e disparar Feature Pipeline manualmente
- O sistema deve oferecer comandos para **consulta de experimentos**: listar runs por projeto, filtrar por métrica e baixar artefatos de um run específico
- O sistema deve oferecer comandos para **deploy de modelo**: criar ou atualizar endpoint de serving com configuração de canary ou blue-green

#### F.3 SDK / API — Complementos ML/DL

Os itens abaixo complementam os requisitos de SDK/API (seção 1.3):

- O sistema deve expor API programática para **Experiment Tracking**: criar projeto, registrar run, logar métricas/parâmetros/artefatos e consultar histórico de runs (compatível com o protocolo MLflow REST API para migração facilitada)
- O sistema deve expor API para **Feature Store**: ler features por entidade em tempo real (online serving), submeter batch de features (offline ingestion) e consultar histórico de feature values por entidade e timestamp
- O sistema deve expor API para **Model Registry**: listar versões, promover e fazer rollback de versões, baixar artefatos e consultar linhagem
- O sistema deve expor API para **ML Serving**: invocar predição single, submeter job de batch inference e consultar status de endpoints
- O sistema deve expor API para **Model Monitoring**: consultar drift scores, submeter ground truth (feedback loop) e consultar relatórios de fairness

---

### G. Gateway Layer — Complementos ML/DL

#### G.1 Complementos ao Model Gateway para ML/DL

Os itens abaixo complementam os requisitos existentes do Model Gateway (seção 2.4) para cobrir inferência ML e DL de forma completa:

- O gateway deve rotear requisições de inferência ML para endpoints do **ML Serving Service** além dos provedores externos, com seleção por modelo e versão
- O gateway deve suportar **inferência batch assíncrona** para modelos ML: aceitar arquivo de input, delegar ao ML Serving Service e retornar ID de job para polling de status
- O gateway deve suportar **feature enrichment automático**: ao receber uma requisição de inferência com entity key declarada, consultar o Feature Store online e enriquecer o payload de entrada com as features registradas antes de encaminhar ao modelo
- O gateway deve registrar **custo de inferência ML por predição**: compute time, tipo de hardware e versão do modelo servido
- O gateway deve suportar **A/B routing**: ao estar em modo canary, rotear porcentagem configurável de requisições para a versão challenger do modelo com registro separado de métricas

---

### H. Core Layer — Complementos ML/DL

#### H.1 Complementos à Data & Messaging Layer para ML/DL

Os itens abaixo complementam os requisitos existentes de Data & Messaging (seção 6.1):

- A plataforma deve prover **object storage** (S3 ou GCS) para armazenamento de artefatos de modelos (pesos, checkpoints, ONNX exports), datasets versionados, artefatos de pipelines ML e relatórios de avaliação
- A plataforma deve prover **offline feature store** com suporte a queries point-in-time sobre Parquet/Delta Lake em object storage ou ClickHouse para uso em treinamento
- A plataforma deve prover **online feature store** com suporte a leitura de baixa latência (<10ms p99) via Redis ou DynamoDB para uso em inferência
- A plataforma deve suportar **streaming ingestion** via Kafka para atualização em tempo real de features no online store
- A plataforma deve prover **artifact tracking store** (PostgreSQL + object storage) para o Experiment Tracking Service, indexando metadados de runs, métricas e referências URI de artefatos

#### H.2 Complementos ao Pipeline & Deploy para ML/DL

Os itens abaixo complementam os requisitos existentes de Pipeline & Deploy (seção 6.3):

- A plataforma deve executar pipelines de deploy para **endpoints de ML Serving** com estágios: Build image → Push → Deploy canary (N%) → Monitor → Promote 100% ou Rollback
- A plataforma deve suportar **rollout de modelos com gates automáticos**: a promoção de canary para 100% só ocorre se métricas de latência e drift estiverem dentro dos thresholds configurados durante a janela de observação
- A plataforma deve suportar **deploy de ML Pipelines** como jobs Kubernetes com isolamento de namespace por ambiente e configuração de resource quotas por step

---

### I. Deep Learning — Tipos e Arquiteturas

#### I.1 Complementos ao Training Service para Deep Learning

Os itens abaixo complementam os requisitos existentes do Training Service (seção 4.1.5) para cobrir Deep Learning de forma completa:

**Tipos de tarefa DL adicionais:**
- O serviço deve suportar tipo `dl-image-classification` — treinamento de CNNs e ViTs para classificação de imagens
- O serviço deve suportar tipo `dl-object-detection` — treinamento de modelos como YOLO, DETR para detecção de objetos
- O serviço deve suportar tipo `dl-segmentation` — segmentação semântica e de instâncias (UNet, Mask R-CNN, SAM fine-tuning)
- O serviço deve suportar tipo `dl-nlp-classification` — classificação de texto com BERT, RoBERTa, DeBERTa
- O serviço deve suportar tipo `dl-ner` — Named Entity Recognition com modelos sequence-to-label
- O serviço deve suportar tipo `dl-summarization` — sumarização extrativa e abstrativa (BART, T5, Pegasus)
- O serviço deve suportar tipo `dl-translation` — tradução neural (mBART, NLLB, M2M)
- O serviço deve suportar tipo `dl-tabular` — deep learning para dados tabulares (TabNet, FT-Transformer)
- O serviço deve suportar tipo `dl-timeseries` — forecasting com redes neurais (LSTM, Temporal Fusion Transformer, PatchTST, TimesFM)
- O serviço deve suportar tipo `dl-multimodal` — modelos que combinam imagem + texto (CLIP fine-tuning, LLaVA, PaliGemma)
- O serviço deve suportar tipo `dl-audio` — classificação de áudio, ASR fine-tuning, speaker diarization (Whisper, wav2vec)

**Frameworks DL adicionais:**
- O serviço deve suportar frameworks adicionais: `timm` (PyTorch Image Models), `ultralytics` (YOLO), `detectron2`, `huggingface-trainer` para tasks DL de visão e NLP
- O serviço deve suportar `torchvision`, `torchaudio` e `torchtext` como bibliotecas de dados para DL

**Hiperparâmetros DL adicionais:**
- O serviço deve suportar hiperparâmetros específicos de DL: arquitetura (`resnet50`, `vit-base-patch16`, `bert-base-uncased`, etc.), `pretrained_weights` (caminho ou nome do checkpoint de partida), `warmup_steps`, `weight_decay`, `dropout`, `grad_clip`, `mixed_precision` (fp16, bf16, fp32)
- O serviço deve suportar hiperparâmetros de data augmentation para visão: `random_crop`, `random_flip`, `color_jitter`, `random_erasing`, `mixup`, `cutmix`
- O serviço deve suportar configuração de `gradient_checkpointing` e `gradient_accumulation_steps` para treinamento de modelos grandes em hardware limitado

**Métricas DL adicionais:**
- O serviço deve registrar métricas específicas de DL por task: `top1_accuracy`, `top5_accuracy` (visão), `mean_iou`, `map@50`, `map@75` (detecção/segmentação), `cer`, `wer` (ASR), `bleu`, `rouge_l`, `bert_score` (NLP generativo), `mcd` (síntese de voz)

**Hardware DL:**
- O serviço deve suportar configuração de **multi-GPU training** com estratégias: `ddp` (DistributedDataParallel), `fsdp` (Fully Sharded Data Parallel), `deepspeed` (ZeRO stages 1/2/3)
- O serviço deve suportar configuração de **mixed precision**: fp16, bf16 e fp32 por job
- O serviço deve registrar **profiling de GPU** por job: utilização média de GPU%, memória de VRAM usada, throughput de amostras/segundo e tempo de iteração por step

#### I.2 Complementos ao Model Service (Catalog) para DL

Os itens abaixo complementam os requisitos existentes do Model Service (seção 4.3.1) para registrar modelos DL de provedores externos:

- O serviço deve suportar tipo de modelo `dl-vision` para modelos de visão computacional (classificação, detecção, segmentação) de provedores como Google Cloud Vision, AWS Rekognition e Hugging Face Hub
- O serviço deve suportar tipo de modelo `dl-audio` para modelos de áudio (ASR, TTS, classificação) de provedores como OpenAI Whisper API, Google Speech-to-Text, ElevenLabs
- O serviço deve suportar tipo de modelo `dl-multimodal` para modelos que combinam texto e imagem (GPT-4o, Gemini Pro Vision, Claude 3 Vision, LLaVA self-hosted)
- O serviço deve suportar configuração de **input format** por tipo de modelo: texto, imagem (base64/URL), áudio (base64/URL), multimodal, para que o Model Gateway encode corretamente os inputs antes de encaminhar ao provedor

---

### J. Avaliação / Evaluation Service — Complementos ML/DL

Os itens abaixo complementam os requisitos implícitos do Evaluation Service (referenciado no mapeamento mas sem seção própria nos requisitos) para cobrir ML e DL:

##### 4.5.3 Evaluation Service

Serviço dedicado à avaliação sistemática e comparativa de modelos registrados no Model Registry — complementando os testes ad-hoc do Suite Cases Service com avaliações aprofundadas sobre datasets de referência e com comparação formal de versões. Enquanto o Suite Cases Service executa casos de teste funcionais e de qualidade para agentes e orquestrações, o Evaluation Service foca na avaliação de modelos isolados (LLM, ML, DL) com métricas padronizadas por tipo de tarefa, rastreando a evolução de qualidade ao longo de versões.

- O serviço deve criar e gerenciar **evaluation suites** com target (`agent`, `orchestration`, `rag`, `model-llm`, `model-ml`, `model-dl`), dataset de avaliação (referência ao Dataset Catalog) e conjunto de métricas configuradas
- O serviço deve suportar **judge LLM** (LLM-as-judge) para avaliação de modelos generativos: faithfulness, answer_relevancy, coherence, groundedness, toxicity, bias
- O serviço deve suportar **judge heurístico** para métricas determinísticas: BLEU, ROUGE, BERTScore, exact_match, F1-score, accuracy, AUC-ROC, RMSE, MAE — calculados sobre o dataset de avaliação de forma reprodutível
- O serviço deve suportar **judge humano**: interface para anotadores humanos avaliarem amostras de predição com formulário configurável, consenso entre anotadores e cálculo de Kappa de concordância
- O serviço deve suportar **avaliação comparativa de versões**: executar o mesmo evaluation suite sobre duas versões de modelo (campeão vs challenger) e gerar relatório de comparação com significância estatística (t-test, bootstrap confidence intervals)
- O serviço deve registrar histórico de evaluation runs por suite com timeline de evolução de métricas ao longo de versões
- O serviço deve integrar com o Model Registry para registrar as métricas de avaliação na versão do modelo correspondente e usá-las como critério de promoção
- O serviço deve integrar com o Bias & Fairness Service para incluir métricas de fairness nos relatórios de avaliação de modelos ML/DL

---

### K. Síntese das Lacunas Cobertas

| Serviço / Feature | Domínio | Gap coberto |
|---|---|---|
| **Experiment Tracking Service** | 🟠 ML / 🔵 Ambos | Rastreamento de runs, hiperparâmetros, métricas e artefatos por projeto |
| **Feature Store Service** | 🟠 ML / 🔵 Ambos | Feature Groups, Feature Pipelines, offline/online store, point-in-time retrieval |
| **ML Pipeline Service** | 🟠 ML | DAG de steps de ML com Data Ingestion, Validation, Train, Evaluate, Register, Deploy |
| **Model Registry Service** | 🟠 ML / 🔵 Ambos | Ciclo de vida de artefatos treinados, promoção por ambiente, linhagem, canary/blue-green |
| **Dataset Catalog Service** | 🟠 ML / 🔵 Ambos | Descoberta, governança, schema e data cards para todos os datasets da plataforma |
| **Broker Service** | 🔵 Ambos | Registro e gerenciamento de brokers de mensageria para orquestrações e feature pipelines |
| **ML Serving Service** | 🟠 ML | Deploy de endpoints ML/DL, canary, blue-green, shadow, A/B, autoscaling |
| **Model Monitoring Service** | 🟠 ML | Data drift, prediction drift, concept drift, performance monitoring, retraining automático |
| **Bias & Fairness Service** | 🟠 ML / 🔵 Ambos | Métricas de fairness por grupo protegido, análise interseccional, bloqueio de promoção |
| **Evaluation Service** | 🔵 Ambos | Evaluation suites formais, judge LLM/heurístico/humano, comparação estatística de versões |
| **Tipos DL no Training Service** | 🟠 DL | dl-image-classification, dl-object-detection, dl-segmentation, dl-nlp, dl-timeseries, dl-multimodal, dl-audio |
| **Arquiteturas DL** | 🟠 DL | ResNet, ViT, YOLO, DETR, BERT, T5, LSTM, TFT, Whisper, CLIP — hiperparâmetros, augmentation, multi-GPU, mixed precision |
| **Modelos DL no Model Service** | 🟠 DL | Tipos dl-vision, dl-audio, dl-multimodal de provedores externos |
| **Alert Service — ML/DL** | 🟠 ML | Categorias ml_monitoring e ml_pipeline com métricas de drift e qualidade de dados |
| **FinOps — ML/DL** | 🟠 ML | Custo de ML Serving, Feature Pipelines, ML Pipeline runs e armazenamento de artefatos |
| **Suite Cases — ML/DL** | 🟠 ML / 🔵 Ambos | Tipos ml_evaluation, ml_fairness, data_quality, model_robustness com métricas por task |
| **Playground — DL** | 🟠 DL | Inferência DL visão/NLP, comparação de versões, stress test, perfil de GPU |
| **Console UI — ML/DL** | 🟠 ML | Seções ML Pipelines, Experiments, Feature Store, Model Registry, Model Monitoring |
| **CLI — ML/DL** | 🟠 ML | Comandos para Model Registry, ML Pipelines, Feature Store, Experiments, Serving |
| **SDK/API — ML/DL** | 🟠 ML | APIs para Experiment Tracking, Feature Store, Model Registry, ML Serving, Model Monitoring |
| **Model Gateway — ML/DL** | 🟠 ML | Feature enrichment automático, batch inference assíncrona, A/B routing, custo por predição |
| **Core — Object Storage** | 🟠 ML | S3/GCS para artefatos de modelos, datasets e pipelines |
| **Core — Feature Stores** | 🟠 ML | Offline store (Parquet/Delta/ClickHouse) e online store (Redis/DynamoDB) |
| **Core — Deploy ML** | 🟠 ML | Rollout com gates automáticos de drift e latência para canary → 100% |
