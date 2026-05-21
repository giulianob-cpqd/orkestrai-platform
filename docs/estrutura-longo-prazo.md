Proposta de Longo Prazo, é dividida nas seguintes camadas e seus respectivos componentes:1

## Access Layer
- Console UI: Aplicação Web para visualização, gerenciamento e operação de serviços
- CLI: Interface de linha de comando para automação, scripts e operações
- SDK/API: Para integração programática e automação avançada
##Gateway Layer
- Agent Gateway: Acesso a agentes da plataforma
- MCP Server Gateway: Acesso aos servidores MCP
- RAG Gateway: Acesso aos databases de RAG
- Model Gateway: Acesso aos modelos de LLM e ML
- Orchestration Gateway: Acesso a fluxos da plataforma
## Security Layer
- Authentication Authorization: Provedor de acesso à plataforma
## Service Layer
### Build Services
- Template Service: Catálogo e scaffold de aplicações
- Agent Service: Cria e gerencia agentes de IA
- Orchestration Service: Cria e gerencia fluxos de orquestração
- Knowledge Service: Catálogo base de conhecimento da plataforma
- Training Service: Configura e executa treinamento em modelo de IA1
### Use Services
- Execution Service: Lista e detalhes de execuções das aplicações
- Conversation Service: Lista e detalhes de conversas com os agentes
### Catalog Services
- External API Service: Catálogo de API Externas ofertadas na plataforma
- MCP Server Service: Catálogo de MCP Servers ofertados pela plataforma
- External DB Service: Catálogo banco de dados externos para a plataforma
- RAGs DB Service: Catálogo de bases RAG ofertadas na plataforma
- Model Service: Catálogo de Modelos de LLM e Machine Learning
- Dataset Service: Catálogo de dados para treino e testes
### Governance Services
- FinOps Service: Provê recursos de observação financeira
- Quota Service: Provê recursos de limites e cotas
- Alert Service: Provê recursos de alertas e notificações
- Watch Service: Provê recursos de métricas, traces e logs
### Test Services
- Suite Cases Service: Suite de testes Funcionais, de Guardrails e de Stress
- Playground Service: Experimentação de modelos e RAGs

