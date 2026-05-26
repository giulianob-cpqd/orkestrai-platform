import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { CatalogManager, type CatalogEntry, type EnvFieldDef } from "@/components/CatalogManager";

export const Route = createFileRoute("/brokers")({
  head: () => ({ meta: [{ title: "Brokers · OrkestrAI" }] }),
  component: BrokersPage,
});

const envFields: EnvFieldDef[] = [
  { key: "type",     label: "Broker type",   placeholder: "Kafka | RabbitMQ | SQS | NATS | Pub/Sub | Redis Streams | ..." },
  { key: "host",     label: "Host / URL",    placeholder: "kafka.example.com or https://sqs.us-east-1.amazonaws.com" },
  { key: "port",     label: "Port",          placeholder: "9092" },
  { key: "username", label: "Username / Access key", placeholder: "app_producer" },
  { key: "password", label: "Password / Secret key", type: "password" },
  { key: "options",  label: "Extra options", placeholder: "ssl=true&sasl.mechanism=PLAIN" },
];

const initial: CatalogEntry[] = [
  // ── Kafka ────────────────────────────────────────────────────────────────
  {
    id: "kafka-main",
    name: "Kafka — Main Cluster",
    description: "Primary event-streaming cluster for all orchestration topics. 6 partitions, replication factor 3.",
    tags: ["Kafka", "event-streaming", "SASL"],
    status: "active",
    envs: {
      dev: {
        type: "Kafka",
        host: "kafka-dev.svc:9092",
        port: "9092",
        username: "app",
        password: "***",
        options: "ssl=false&sasl.mechanism=PLAIN",
      },
      staging: {
        type: "Kafka",
        host: "kafka-stg.svc:9092",
        port: "9092",
        username: "app",
        password: "***",
        options: "ssl=true&sasl.mechanism=SCRAM-SHA-256",
      },
      production: {
        type: "Kafka",
        host: "kafka.svc:9092",
        port: "9092",
        username: "app_prod",
        password: "***",
        options: "ssl=true&sasl.mechanism=SCRAM-SHA-256&replication.factor=3",
      },
    },
  },

  // ── RabbitMQ ─────────────────────────────────────────────────────────────
  {
    id: "rabbitmq-support",
    name: "RabbitMQ — Support Queue",
    description: "AMQP broker for the Customer Support Triage orchestration. Topic exchange with DLQ.",
    tags: ["RabbitMQ", "AMQP", "DLQ"],
    status: "active",
    envs: {
      dev: {
        type: "RabbitMQ",
        host: "rabbitmq-dev.svc",
        port: "5672",
        username: "guest",
        password: "***",
        options: "vhost=/&heartbeat=60",
      },
      staging: {
        type: "RabbitMQ",
        host: "rabbitmq-stg.svc",
        port: "5672",
        username: "app",
        password: "***",
        options: "vhost=/support&heartbeat=60&tls=true",
      },
      production: {
        type: "RabbitMQ",
        host: "rabbitmq.svc",
        port: "5671",
        username: "app_prod",
        password: "***",
        options: "vhost=/support&heartbeat=30&tls=true&confirms=true",
      },
    },
  },

  // ── AWS SQS ───────────────────────────────────────────────────────────────
  {
    id: "sqs-billing",
    name: "SQS — Billing Queue",
    description: "AWS SQS FIFO queue for invoice reconciliation events. 14-day retention, dead-letter enabled.",
    tags: ["SQS", "AWS", "FIFO", "serverless"],
    status: "active",
    envs: {
      dev: {
        type: "SQS",
        host: "https://sqs.us-east-1.amazonaws.com",
        port: "",
        username: "AKIAIOSFODNN7EXAMPLE",
        password: "***",
        options: "region=us-east-1&queue=billing-dev.fifo",
      },
      staging: {
        type: "SQS",
        host: "https://sqs.us-east-1.amazonaws.com",
        port: "",
        username: "AKIAIOSFODNN7EXAMPLE",
        password: "***",
        options: "region=us-east-1&queue=billing-stg.fifo",
      },
      production: {
        type: "SQS",
        host: "https://sqs.us-east-1.amazonaws.com",
        port: "",
        username: "AKIAIOSFODNN7EXAMPLE",
        password: "***",
        options: "region=us-east-1&queue=billing-prod.fifo&dlq=billing-dlq.fifo",
      },
    },
  },

  // ── NATS ──────────────────────────────────────────────────────────────────
  {
    id: "nats-internal",
    name: "NATS — Internal Events",
    description: "Lightweight pub/sub for low-latency intra-service events. JetStream persistence enabled.",
    tags: ["NATS", "JetStream", "low-latency"],
    status: "active",
    envs: {
      dev: {
        type: "NATS",
        host: "nats-dev.svc",
        port: "4222",
        username: "app",
        password: "***",
        options: "tls=false&jetstream=true",
      },
      staging: {
        type: "NATS",
        host: "nats-stg.svc",
        port: "4222",
        username: "app",
        password: "***",
        options: "tls=true&jetstream=true",
      },
      production: {
        type: "NATS",
        host: "nats.svc",
        port: "4222",
        username: "app_prod",
        password: "***",
        options: "tls=true&jetstream=true&replicas=3",
      },
    },
  },

  // ── Google Pub/Sub ────────────────────────────────────────────────────────
  {
    id: "pubsub-analytics",
    name: "Pub/Sub — Analytics Events",
    description: "Google Cloud Pub/Sub for analytics pipeline. Triggers the Billing orchestration on invoice events.",
    tags: ["Pub/Sub", "GCP", "analytics"],
    status: "draft",
    envs: {
      dev: {
        type: "Google Pub/Sub",
        host: "pubsub.googleapis.com",
        port: "",
        username: "",
        password: "***",
        options: "project=my-project-dev&subscription=billing-sub-dev",
      },
      staging: {
        type: "Google Pub/Sub",
        host: "pubsub.googleapis.com",
        port: "",
        username: "",
        password: "***",
        options: "project=my-project-stg&subscription=billing-sub-stg",
      },
      production: {
        type: "Google Pub/Sub",
        host: "pubsub.googleapis.com",
        port: "",
        username: "",
        password: "***",
        options: "project=my-project-prod&subscription=billing-sub-prod",
      },
    },
  },

  // ── Redis Streams ─────────────────────────────────────────────────────────
  {
    id: "redis-streams-tasks",
    name: "Redis Streams — Task Queue",
    description: "Redis Streams consumer group for background task distribution across worker pods.",
    tags: ["Redis", "Streams", "consumer-group"],
    status: "active",
    envs: {
      dev: {
        type: "Redis Streams",
        host: "redis-dev.svc",
        port: "6379",
        username: "",
        password: "",
        options: "stream=tasks&group=workers&tls=false",
      },
      staging: {
        type: "Redis Streams",
        host: "redis-stg.svc",
        port: "6379",
        username: "",
        password: "***",
        options: "stream=tasks&group=workers&tls=true",
      },
      production: {
        type: "Redis Streams",
        host: "redis.svc",
        port: "6379",
        username: "",
        password: "***",
        options: "stream=tasks&group=workers&tls=true&maxlen=100000",
      },
    },
  },
];

function BrokersPage() {
  return (
    <CatalogManager
      title="Brokers"
      subtitle="Message brokers and event streaming"
      description="Registered message brokers available to orchestrations and agents as Message Consumer and Message Producer nodes."
      newButtonLabel="Add broker"
      icon={Radio}
      envFields={envFields}
      initialItems={initial}
    />
  );
}
