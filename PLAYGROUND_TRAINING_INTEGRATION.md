# Playground & Training Integration

## Resumo das Mudanças

Foram integrados os menus de **Playground** e **Training** do projeto fonte (`C:\workspage_ia\lovable\generative-agent-hub-main`) para o projeto OrkestrAI.

## Arquivos Adicionados

### Rotas
- `src/routes/playground.tsx` - Página de Playground para testar LLMs, modelos ML e pipelines RAG
- `src/routes/training.tsx` - Página de Training para gerenciar jobs de treinamento

### Dados
- `src/data/registry.ts` - Registro de LLMs e RAGs disponíveis
- `src/data/training.ts` - Dados de jobs de treinamento, datasets e modelos base

## Mudanças no Sidebar

### AppSidebar.tsx
- Adicionados ícones: `Gamepad2` (Playground) e `BookMarked` (Training)
- Adicionados itens ao array `executionItems`:
  - Playground (`/playground`) - Ícone: Gamepad2
  - Training (`/training`) - Ícone: BookMarked

### Localização no Menu
Os novos itens aparecem na seção **"Uses"** do sidebar, entre Chat e FinOps:
1. Executions
2. Chat
3. **Playground** ← Novo
4. **Training** ← Novo
5. FinOps
6. Quotas
7. Alerts

## Funcionalidades

### Playground
- Comparação de LLMs (catálogo e fine-tunes)
- Invocação de modelos de Machine Learning
- Teste de pipelines de RAG lado a lado
- Visualização de latência, tokens e custos

### Training
- Gerenciamento de jobs de treinamento
- Suporte para:
  - LLM Fine-tune
  - LLM LoRA
  - LLM RLHF/DPO
  - ML Classification
  - ML Regression
  - ML Forecasting
  - ML Clustering
  - Embeddings
- Monitoramento de status (draft, queued, running, succeeded, failed, stopped)
- Visualização de progresso e métricas

## Componentes UI Utilizados

Todos os componentes necessários já estavam disponíveis no projeto:
- Card, Button, Badge, Input, Label, Textarea
- Slider, Tabs, Select, ScrollArea, Switch, Separator
- Table, Progress, Dialog
- Ícones Lucide React

## Próximos Passos (Opcional)

1. Integrar com backend real para jobs de treinamento
2. Adicionar autenticação e autorização
3. Implementar real-time updates para status de jobs
4. Adicionar exportação de resultados
5. Integrar com sistema de observabilidade para métricas

## Verificação

Para verificar a integração:
1. Abra o sidebar
2. Procure pela seção "Uses"
3. Clique em "Playground" ou "Training"
4. As páginas devem carregar com dados de exemplo

---

**Data**: Maio 2026
**Status**: ✅ Integração Completa
