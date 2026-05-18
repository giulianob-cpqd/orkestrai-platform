# OrkestrAI — Agentic AI Platform

Plataforma completa para design, deploy e observabilidade de agentes de IA colaborativos. Permite criar orquestrações multi-agente através de uma interface visual drag-and-drop, gerenciar catálogos de modelos (LLMs, ML, Embeddings), APIs, MCP Servers, RAGs, datasets e conhecimento. Inclui recursos avançados como treinamento de modelos, testes automatizados, FinOps e governança.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR + React 19) |
| Roteamento | [TanStack Router](https://tanstack.com/router) (file-based) |
| UI Components | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Estilização | [Tailwind CSS v4](https://tailwindcss.com/) |
| Flow Builder | [React Flow (@xyflow/react)](https://reactflow.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Build | [Vite 7](https://vite.dev/) |
| Deploy | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Runtime | Node.js >= 22 |

## Estrutura do Projeto

```
src/
├── components/
│   ├── flow/           # FlowBuilder, AgentNode, FanDiagram, AI Assistant
│   ├── sections/       # PipelineSection, ObservabilitySection
│   ├── ui/             # shadcn/ui components (button, card, dialog, etc.)
│   └── AppSidebar.tsx  # Navegação principal com seções: Overview, Build, Tests, Uses, Catalog, Governance
├── data/
│   ├── flows.ts        # Dados de orquestrações e agentes
│   ├── models.ts       # Catálogo de modelos (LLM, ML, Embeddings)
│   ├── training.ts     # Dados de treinamentos e datasets
│   ├── knowledge.ts    # Bases de conhecimento com documentos e versões
│   ├── finops.ts       # Dados de custos e FinOps
│   ├── quotas.ts       # Limites e quotas
│   ├── alerts.ts       # Alertas e notificações
│   ├── rags.ts         # Bases de RAG
│   ├── executions.ts   # Histórico de execuções
│   └── testSuites.ts   # Suites de testes
├── hooks/              # Custom hooks (use-mobile)
├── lib/
│   ├── icons.ts        # Mapa centralizado de ícones (serializável para SSR)
│   ├── utils.ts        # Utilitários (cn, etc.)
│   └── EnvironmentContext.tsx # Contexto de ambiente
├── routes/             # File-based routing (TanStack Router)
│   ├── dashboard.tsx                   # Dashboard principal
│   ├── orchestrations.*.tsx            # Orquestrações
│   ├── agents.*.tsx                    # Agentes
│   ├── templates.*.tsx                 # Templates
│   ├── knowledge.tsx                   # Bases de conhecimento
│   ├── training.tsx                    # Treinamento de modelos
│   ├── test-suites.tsx                 # Suite Cases (testes)
│   ├── playground.tsx                  # Playground para testar modelos
│   ├── conversations.tsx               # Histórico de conversas
│   ├── executions.*.tsx                # Execuções
│   ├── llms.tsx                        # Catálogo de modelos
│   ├── apis.tsx                        # Catálogo de APIs
│   ├── mcp.tsx                         # Catálogo de MCP Servers
│   ├── databases.tsx                   # Catálogo de bancos de dados
│   ├── rags.tsx                        # Catálogo de RAGs
│   ├── datasets.tsx                    # Catálogo de datasets
│   ├── finops.tsx                      # FinOps e custos
│   ├── quotas.tsx                      # Quotas e limites
│   ├── alerts.tsx                      # Alertas
│   └── login.tsx                       # Autenticação
├── router.tsx          # Configuração do router
├── routeTree.gen.ts    # Gerado automaticamente pelo TanStack Router
└── styles.css          # Estilos globais + Tailwind
```

## Pré-requisitos

- **Node.js** >= 22
- **npm** (incluso com Node.js)
- **Docker** + **Docker Compose** (opcional, para rodar via container)

## Instalação e Desenvolvimento Local

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd generative-agent-hub

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`.

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (Cloudflare Workers) |
| `npm run build:dev` | Build em modo development |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Lint com ESLint |
| `npm run format` | Formatação com Prettier |

## Docker

### Build e execução

```bash
docker compose up --build -d
```

A aplicação estará disponível em `http://localhost:3000`.

### Parar

```bash
docker compose down
```

### Windows com WSL

Se o Docker está instalado no WSL:

```bash
wsl docker compose up --build -d
```

## Deploy (Cloudflare Workers)

O projeto está configurado para deploy em Cloudflare Workers via Wrangler:

```bash
# Build de produção
npm run build

# Deploy (requer autenticação no Cloudflare)
npx wrangler deploy
```

## Funcionalidades Principais

### Build
- **Orquestrações** — Fluxos multi-agente com editor visual drag-and-drop (React Flow)
- **Agentes** — Catálogo de agentes individuais compostos por LLM, memória, RAG e ferramentas
- **Templates** — Templates reutilizáveis para orquestrações e agentes
- **Knowledge** — Bases de conhecimento com documentos, versões e integração com RAGs
- **Training** — Treinamento de modelos LLM e ML com suporte a diferentes frameworks

### Tests
- **Suite Cases** — Testes automatizados para orquestrações e agentes
- **Playground** — Ambiente interativo para testar modelos e conversas

### Uses
- **Executions** — Histórico e monitoramento de execuções
- **Conversations** — Histórico de conversas com agentes

### Catalog
- **Models** — Catálogo de modelos (LLM, ML, Embeddings) com suporte a múltiplos provedores
- **APIs** — Integração com APIs externas
- **MCP Servers** — Servidores Model Context Protocol
- **Databases** — Conexões com bancos de dados
- **RAGs** — Bases de conhecimento para Retrieval-Augmented Generation
- **Datasets** — Datasets para treinamento com informações de tamanho e formato

### Governance
- **FinOps** — Análise de custos por ambiente, modelo e treinamento
- **Quotas** — Gerenciamento de limites de recursos
- **Alerts** — Sistema de alertas e notificações

### Recursos Adicionais
- **Fan-in / Fan-out** — Visualização de endpoints, filas e serviços
- **Pipeline & Deploy** — Seção de CI/CD e deploy
- **Observabilidade** — Métricas e monitoramento com OpenTelemetry
- **AI Assistant** — Painel de assistente IA integrado ao editor
