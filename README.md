# Inspire — AI Low Code Platform

Plataforma low-code para design, deploy e observabilidade de agentes de IA colaborativos. Permite criar orquestrações multi-agente através de uma interface visual drag-and-drop, gerenciar catálogos de LLMs, APIs, MCP Servers e RAGs.

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
│   └── ui/             # shadcn/ui components (button, card, dialog, etc.)
├── data/
│   └── flows.ts        # Dados de orquestrações e agentes
├── hooks/              # Custom hooks (use-mobile)
├── lib/
│   ├── icons.ts        # Mapa centralizado de ícones (serializável para SSR)
│   └── utils.ts        # Utilitários (cn, etc.)
├── routes/             # File-based routing (TanStack Router)
│   ├── index.tsx                       # Home — lista de orquestrações
│   ├── orchestrations.$id.index.tsx    # Detalhe da orquestração
│   ├── orchestrations.$id.edit.tsx     # Editor visual de fluxo
│   ├── orchestrations.new.tsx          # Nova orquestração
│   ├── agents.index.tsx                # Catálogo de agentes
│   ├── agents.$id.index.tsx            # Detalhe do agente
│   ├── agents.$id.edit.tsx             # Editor visual do agente
│   ├── agents.new.tsx                  # Novo agente
│   ├── llms.tsx                        # Catálogo de LLMs
│   ├── apis.tsx                        # Catálogo de APIs
│   ├── mcp.tsx                         # Catálogo de MCP Servers
│   └── rags.tsx                        # Catálogo de RAGs
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

- **Orquestrações** — Fluxos multi-agente com editor visual drag-and-drop (React Flow)
- **Agentes** — Catálogo de agentes individuais compostos por LLM, memória, RAG e ferramentas
- **Fan-in / Fan-out** — Visualização de endpoints, filas e serviços que alimentam e são chamados por cada fluxo
- **Pipeline & Deploy** — Seção de CI/CD e deploy para cada orquestração/agente
- **Observabilidade** — Métricas e monitoramento dos fluxos
- **AI Assistant** — Painel de assistente IA integrado ao editor de fluxos
- **Catálogos** — Gestão de LLMs, APIs externas, MCP Servers e bases de conhecimento (RAGs)
