import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CatalogGrid, PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Database, Plus } from "lucide-react";

export const Route = createFileRoute("/databases")({
  head: () => ({ meta: [{ title: "Databases · OrkestrAI" }] }),
  component: DatabasesPage,
});

const databases: CatalogItem[] = [
  // SQL
  { id: "db/postgres-analytics", name: "PostgreSQL — Analytics", description: "Main analytics warehouse. Read replicas in 3 regions.", tags: ["SQL", "PostgreSQL", "read-replica"], meta: [{ label: "Version", value: "16.2" }, { label: "Size", value: "1.2 TB" }], status: "active", icon: Database, accent: "primary" },
  { id: "db/postgres-primary", name: "PostgreSQL — Primary", description: "Transactional database for tickets, users and CRM data.", tags: ["SQL", "PostgreSQL", "OLTP"], meta: [{ label: "Version", value: "16.2" }, { label: "Connections", value: "120" }], status: "active", icon: Database, accent: "info" },
  { id: "db/mysql-legacy", name: "MySQL — Legacy Billing", description: "Legacy billing system. Migration to Postgres planned Q3.", tags: ["SQL", "MySQL", "legacy"], meta: [{ label: "Version", value: "8.0" }, { label: "Tables", value: "84" }], status: "draft", icon: Database, accent: "warning" },
  { id: "db/mssql-erp", name: "SQL Server — ERP", description: "Enterprise ERP database. Read-only access for agents.", tags: ["SQL", "MSSQL", "readonly"], meta: [{ label: "Version", value: "2022" }, { label: "Schemas", value: "12" }], status: "active", icon: Database, accent: "accent" },
  { id: "db/sqlite-local", name: "SQLite — Dev/Test", description: "Lightweight local database for development and testing.", tags: ["SQL", "SQLite", "ephemeral"], meta: [{ label: "Size", value: "48 MB" }, { label: "Env", value: "dev" }], status: "active", icon: Database, accent: "success" },
  // NoSQL
  { id: "db/mongodb-content", name: "MongoDB — Content Store", description: "Document store for unstructured content, articles and drafts.", tags: ["NoSQL", "MongoDB", "documents"], meta: [{ label: "Version", value: "7.0" }, { label: "Collections", value: "32" }], status: "active", icon: Database, accent: "primary" },
  { id: "db/redis-cache", name: "Redis — Cache & Sessions", description: "In-memory cache for sessions, rate limits and hot data.", tags: ["NoSQL", "Redis", "cache"], meta: [{ label: "Version", value: "7.2" }, { label: "Memory", value: "8 GB" }], status: "active", icon: Database, accent: "destructive" },
  { id: "db/dynamodb-events", name: "DynamoDB — Events", description: "Serverless event store on AWS. Auto-scaling enabled.", tags: ["NoSQL", "DynamoDB", "serverless"], meta: [{ label: "Region", value: "us-east-1" }, { label: "RCU", value: "5k" }], status: "active", icon: Database, accent: "info" },
  { id: "db/cassandra-timeseries", name: "Cassandra — Time Series", description: "Distributed time-series store for metrics and telemetry.", tags: ["NoSQL", "Cassandra", "timeseries"], meta: [{ label: "Nodes", value: "6" }, { label: "RF", value: "3" }], status: "draft", icon: Database, accent: "warning" },
  { id: "db/neo4j-graph", name: "Neo4j — Knowledge Graph", description: "Graph database for entity relationships and ontologies.", tags: ["NoSQL", "Neo4j", "graph"], meta: [{ label: "Version", value: "5.x" }, { label: "Nodes", value: "2.4M" }], status: "active", icon: Database, accent: "accent" },
  { id: "db/clickhouse-logs", name: "ClickHouse — Logs", description: "Columnar OLAP for log analytics and observability data.", tags: ["SQL", "ClickHouse", "OLAP"], meta: [{ label: "Rows/day", value: "12B" }, { label: "Retention", value: "90d" }], status: "active", icon: Database, accent: "success" },
  { id: "db/elasticsearch-search", name: "Elasticsearch — Search", description: "Full-text search engine for product catalog and docs.", tags: ["NoSQL", "Elasticsearch", "search"], meta: [{ label: "Version", value: "8.x" }, { label: "Indices", value: "18" }], status: "active", icon: Database, accent: "primary" },
];

function DatabasesPage() {
  return (
    <AppLayout title="Databases" subtitle="SQL and NoSQL data stores">
      <div className="p-6">
        <PageHeader title="Databases" description="Registered database connections available to orchestrations and agents.">
          <Button size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Add database
          </Button>
        </PageHeader>
        <CatalogGrid items={databases} />
      </div>
    </AppLayout>
  );
}
