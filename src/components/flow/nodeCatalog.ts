import { Brain, Bot, Wrench, Database, Server, Send, type LucideIcon } from "lucide-react";

export interface NodeTemplate {
  type: string;
  variant: "llm" | "agent" | "tool" | "rag" | "mcp" | "output";
  label: string;
  description: string;
  icon: LucideIcon;
  meta?: string;
}

export const nodeCatalog: NodeTemplate[] = [
  {
    type: "llm",
    variant: "llm",
    label: "LLM Model",
    description: "Large language model invocation",
    icon: Brain,
    meta: "gpt-5 · gemini-2.5-pro",
  },
  {
    type: "agent",
    variant: "agent",
    label: "Agent",
    description: "Autonomous reasoning agent",
    icon: Bot,
    meta: "ReAct · CoT",
  },
  {
    type: "tool",
    variant: "tool",
    label: "Tool / API",
    description: "External API call",
    icon: Wrench,
    meta: "REST · GraphQL",
  },
  {
    type: "rag",
    variant: "rag",
    label: "RAG Retriever",
    description: "Vector search & retrieval",
    icon: Database,
    meta: "pgvector · pinecone",
  },
  {
    type: "mcp",
    variant: "mcp",
    label: "MCP Server",
    description: "Model Context Protocol",
    icon: Server,
    meta: "stdio · http",
  },
  {
    type: "output",
    variant: "output",
    label: "Output",
    description: "Response sink",
    icon: Send,
    meta: "stream · json",
  },
];
