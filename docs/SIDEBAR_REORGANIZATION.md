# Sidebar Reorganization & Datasets Integration

## Resumo das Mudanças

Foram realizadas as seguintes reorganizações no sidebar e integração de novas funcionalidades:

## 1. Movimentação de Menus

### Training
- **De**: Uses → **Para**: Build
- Agora aparece junto com Orchestrations, Agents e Templates

### Test Suites
- **Novo**: Adicionado ao submenu Build
- Copiado do projeto fonte

## 2. Datasets - Nova Tela no Catálogo

### Criação
- Nova tela `src/routes/datasets.tsx` criada
- Segue o padrão das outras telas de catálogo (LLMs, APIs, etc.)

### Funcionalidades
- ✅ Visualizar datasets
- ✅ Cadastrar novos datasets
- ✅ Editar datasets existentes
- ✅ Excluir datasets
- ✅ Filtrar por tags, formato, tamanho

### Dados
- Integrado com `src/data/training.ts`
- Datasets iniciais carregados automaticamente

## 3. Remoção de Datasets da Tela de Training

### Mudanças
- Removida a aba "Datasets" da tela de Training
- Mantidas as abas: "Runs" e "Model Registry"
- Removida importação de `datasets` do arquivo training.tsx

## 4. Estrutura do Sidebar Atualizada

### Overview
- Dashboard

### Build ← Atualizado
- Orchestrations
- Agents
- Templates
- **Training** ← Movido
- **Test Suites** ← Novo

### Uses
- Executions
- Chat
- Playground
- FinOps
- Quotas
- Alerts

### Catalog ← Atualizado
- LLMs
- APIs
- MCP Servers
- Databases
- Knowledge
- RAGs
- **Datasets** ← Novo

## 5. Ícones Utilizados

- Training: `BookMarked` (📖)
- Test Suites: `Beaker` (🧪)
- Datasets: `Database` (🗄️)

## Arquivos Modificados

### Criados
- `src/routes/datasets.tsx` - Tela de gerenciamento de datasets
- `src/routes/test-suites.tsx` - Tela de test suites (copiada)
- `src/data/testSuites.ts` - Dados de test suites (copiado)

### Modificados
- `src/components/AppSidebar.tsx` - Reorganização de menus
- `src/routes/training.tsx` - Remoção da aba de datasets

## Verificação

Para verificar as mudanças:

1. **Build**: Veja Training e Test Suites
2. **Catalog**: Veja Datasets
3. **Uses**: Veja que Training foi removido
4. **Training**: Abra a tela e veja que só tem "Runs" e "Model Registry"

---

**Data**: Maio 2026
**Status**: ✅ Reorganização Completa
