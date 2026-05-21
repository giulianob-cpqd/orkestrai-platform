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