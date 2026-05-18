import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";

export const Route = createFileRoute("/databases")({
  head: () => ({ meta: [{ title: "Databases · OrkestrAI" }] }),
  component: DatabasesPage,
});

const envFields: EnvFieldDef[] = [
  { key: "type", label: "Database type", placeholder: "PostgreSQL | MySQL | MongoDB | Redis | ..." },
  { key: "host", label: "Host", placeholder: "db.example.com" },
  { key: "port", label: "Port", placeholder: "5432" },
  { key: "database", label: "Database name", placeholder: "analytics" },
  { key: "username", label: "Username", placeholder: "app_user" },
  { key: "password", label: "Password", type: "password" },
  { key: "options", label: "Connection options", placeholder: "sslmode=require&pool=10" },
];

const initial: CatalogEntry[] = [
  {
    id: "postgres-analytics",
    name: "PostgreSQL — Analytics",
    description: "Main analytics warehouse. Read replicas in 3 regions.",
    tags: ["SQL", "PostgreSQL", "read-replica"],
    status: "active",
    envs: {
      dev: { type: "PostgreSQL", host: "pg-dev.svc", port: "5432", database: "analytics_dev", username: "app", password: "***", options: "sslmode=disable" },
      staging: { type: "PostgreSQL", host: "pg-stg.svc", port: "5432", database: "analytics_stg", username: "app", password: "***", options: "sslmode=require" },
      production: { type: "PostgreSQL", host: "pg-prod.svc", port: "5432", database: "analytics", username: "app_ro", password: "***", options: "sslmode=require&pool=20" },
    },
  },
  {
    id: "postgres-primary",
    name: "PostgreSQL — Primary",
    description: "Transactional database for tickets, users and CRM data.",
    tags: ["SQL", "PostgreSQL", "OLTP"],
    status: "active",
    envs: {
      dev: { type: "PostgreSQL", host: "pg-primary-dev.svc", port: "5432", database: "primary_dev", username: "app", password: "***", options: "" },
      staging: { type: "PostgreSQL", host: "pg-primary-stg.svc", port: "5432", database: "primary_stg", username: "app", password: "***", options: "sslmode=require" },
      production: { type: "PostgreSQL", host: "pg-primary.svc", port: "5432", database: "primary", username: "app", password: "***", options: "sslmode=require&pool=50" },
    },
  },
  {
    id: "mongodb-content",
    name: "MongoDB — Content Store",
    description: "Document store for unstructured content, articles and drafts.",
    tags: ["NoSQL", "MongoDB", "documents"],
    status: "active",
    envs: {
      dev: { type: "MongoDB", host: "mongo-dev.svc", port: "27017", database: "content_dev", username: "app", password: "***", options: "" },
      staging: { type: "MongoDB", host: "mongo-stg.svc", port: "27017", database: "content_stg", username: "app", password: "***", options: "replicaSet=rs0" },
      production: { type: "MongoDB", host: "mongo.svc", port: "27017", database: "content", username: "app", password: "***", options: "replicaSet=rs0&readPreference=secondaryPreferred" },
    },
  },
  {
    id: "redis-cache",
    name: "Redis — Cache & Sessions",
    description: "In-memory cache for sessions, rate limits and hot data.",
    tags: ["NoSQL", "Redis", "cache"],
    status: "active",
    envs: {
      dev: { type: "Redis", host: "redis-dev.svc", port: "6379", database: "0", username: "", password: "", options: "" },
      staging: { type: "Redis", host: "redis-stg.svc", port: "6379", database: "0", username: "", password: "***", options: "tls=true" },
      production: { type: "Redis", host: "redis.svc", port: "6379", database: "0", username: "", password: "***", options: "tls=true&cluster=true" },
    },
  },
  {
    id: "dynamodb-events",
    name: "DynamoDB — Events",
    description: "Serverless event store on AWS. Auto-scaling enabled.",
    tags: ["NoSQL", "DynamoDB", "serverless"],
    status: "active",
    envs: {
      dev: { type: "DynamoDB", host: "dynamodb.us-east-1.amazonaws.com", port: "", database: "events-dev", username: "", password: "***", options: "region=us-east-1" },
      staging: { type: "DynamoDB", host: "dynamodb.us-east-1.amazonaws.com", port: "", database: "events-stg", username: "", password: "***", options: "region=us-east-1" },
      production: { type: "DynamoDB", host: "dynamodb.us-east-1.amazonaws.com", port: "", database: "events", username: "", password: "***", options: "region=us-east-1&rcu=5000" },
    },
  },
  {
    id: "clickhouse-logs",
    name: "ClickHouse — Logs",
    description: "Columnar OLAP for log analytics and observability data.",
    tags: ["SQL", "ClickHouse", "OLAP"],
    status: "active",
    envs: {
      dev: { type: "ClickHouse", host: "ch-dev.svc", port: "8123", database: "logs_dev", username: "default", password: "", options: "" },
      staging: { type: "ClickHouse", host: "ch-stg.svc", port: "8123", database: "logs_stg", username: "app", password: "***", options: "" },
      production: { type: "ClickHouse", host: "ch.svc", port: "8123", database: "logs", username: "app", password: "***", options: "cluster=analytics" },
    },
  },
];

function DatabasesPage() {
  return (
    <CatalogManager
      title="Databases"
      subtitle="SQL and NoSQL data stores"
      description="Registered database connections available to orchestrations and agents."
      newButtonLabel="Add database"
      icon={Database}
      envFields={envFields}
      initialItems={initial}
    />
  );
}
