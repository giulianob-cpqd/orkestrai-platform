# Dataset Formats Update

## Resumo das Mudanças

Foram adicionados os formatos mais conhecidos de dataset em um select dropdown na tela de Datasets.

## Formatos Suportados

### Formatos Tabulares
- **CSV** - Comma-Separated Values
- **JSON** - JavaScript Object Notation
- **JSONL** - JSON Lines (uma linha por objeto)
- **Excel (XLSX)** - Microsoft Excel

### Formatos Colunares
- **Parquet** - Apache Parquet (compressão eficiente)
- **ORC** - Apache ORC (Optimized Row Columnar)
- **Arrow** - Apache Arrow (formato em memória)

### Formatos Especializados
- **Delta Lake** - Formato com ACID transactions
- **Avro** - Apache Avro (serialização)
- **HDF5** - Hierarchical Data Format (científico)
- **TFRecord** - TensorFlow Record Format

### Formatos Estruturados
- **Protocol Buffers** - Google Protocol Buffers
- **XML** - eXtensible Markup Language
- **SQL Database** - Banco de dados SQL
- **SQLite** - SQLite Database

## Interface de Seleção

### Antes
```
Format: [Input field - "CSV, JSON, Parquet..."]
```

### Depois
```
Format: [Select Dropdown ▼]
        ├─ CSV
        ├─ JSON
        ├─ JSONL (JSON Lines)
        ├─ Parquet
        ├─ Delta Lake
        ├─ Apache Avro
        ├─ Apache ORC
        ├─ HDF5
        ├─ Apache Arrow
        ├─ TFRecord
        ├─ Protocol Buffers
        ├─ XML
        ├─ SQL Database
        ├─ Excel (XLSX)
        └─ SQLite
```

## Benefícios

✅ **Padronização**: Garante que apenas formatos conhecidos sejam usados

✅ **Facilidade de Uso**: Dropdown é mais fácil que digitar manualmente

✅ **Documentação**: Cada formato tem um label descritivo

✅ **Escalabilidade**: Fácil adicionar novos formatos no futuro

## Casos de Uso

### CSV
- Dados tabulares simples
- Compatibilidade universal
- Fácil de ler e editar

### Parquet
- Big Data (Spark, Hadoop)
- Compressão eficiente
- Análise de dados em larga escala

### Delta Lake
- Data Lakes com ACID
- Versionamento de dados
- Garantias de consistência

### TFRecord
- Treinamento de modelos TensorFlow
- Otimizado para performance
- Serialização eficiente

### JSON/JSONL
- APIs e web services
- Dados semi-estruturados
- Fácil integração

## Arquivos Modificados

- `src/routes/datasets.tsx` - Adição do select de formatos

---

**Data**: Maio 2026
**Status**: ✅ Dataset Formats Update Completo
