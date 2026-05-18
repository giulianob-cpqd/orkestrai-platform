export type ModelType = "llm" | "ml" | "embedding";

export interface ModelEntry {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  endpoint: string;
  apiKey: string;
  tags: string[];
  status: "active" | "draft" | "error";
  type: ModelType;
}

const initialModels: ModelEntry[] = [
  // LLM Models
  { id: "openai-gpt-5", name: "GPT-5", description: "Powerful all-rounder with excellent reasoning and nuance.", provider: "OpenAI", model: "gpt-5", endpoint: "https://api.openai.com/v1", apiKey: "sk-***", tags: ["reasoning", "tools"], status: "active", type: "llm" },
  { id: "google-gemini-2-5-pro", name: "Gemini 2.5 Pro", description: "Top-tier multimodal model with 1M context window.", provider: "Google", model: "gemini-2.5-pro", endpoint: "https://generativelanguage.googleapis.com", apiKey: "AIza***", tags: ["multimodal", "1M ctx"], status: "active", type: "llm" },
  { id: "google-gemini-2-5-flash", name: "Gemini 2.5 Flash", description: "Balanced speed and capability for high-volume workloads.", provider: "Google", model: "gemini-2.5-flash", endpoint: "https://generativelanguage.googleapis.com", apiKey: "AIza***", tags: ["fast", "cheap"], status: "active", type: "llm" },
  { id: "openai-gpt-5-mini", name: "GPT-5 mini", description: "Lower cost and latency, keeps most reasoning strength.", provider: "OpenAI", model: "gpt-5-mini", endpoint: "https://api.openai.com/v1", apiKey: "sk-***", tags: ["mid-tier"], status: "active", type: "llm" },
  { id: "self-hosted-llama", name: "Llama 3.3 70B", description: "Self-hosted on internal GPU cluster (vLLM + tensor parallel).", provider: "Self-hosted", model: "llama-3.3-70b", endpoint: "http://llm-prod.svc:8000/v1", apiKey: "", tags: ["on-prem", "vLLM"], status: "draft", type: "llm" },
  { id: "google-gemini-flash-lite", name: "Gemini Flash Lite", description: "Fastest and cheapest for classification and simple workloads.", provider: "Google", model: "gemini-2.5-flash-lite", endpoint: "https://generativelanguage.googleapis.com", apiKey: "AIza***", tags: ["classifier", "ultra-fast"], status: "active", type: "llm" },
  { id: "anthropic-claude-sonnet", name: "Claude Sonnet 4.5", description: "Balanced model from Anthropic with strong coding abilities.", provider: "Anthropic", model: "claude-sonnet-4.5", endpoint: "https://api.anthropic.com/v1", apiKey: "sk-ant-***", tags: ["coding", "balanced"], status: "active", type: "llm" },

  // ML Models
  { id: "sklearn-xgboost", name: "XGBoost Classifier", description: "Gradient boosting for classification tasks.", provider: "scikit-learn", model: "xgboost-v1.7", endpoint: "http://ml-models.svc:5000", apiKey: "", tags: ["classification", "tabular"], status: "active", type: "ml" },
  { id: "pytorch-bert", name: "BERT (PyTorch)", description: "Bidirectional Encoder Representations from Transformers.", provider: "Hugging Face", model: "bert-base-uncased", endpoint: "http://ml-models.svc:5000", apiKey: "", tags: ["nlp", "embeddings"], status: "active", type: "ml" },
  { id: "tensorflow-resnet", name: "ResNet-50 (TensorFlow)", description: "Deep residual network for image classification.", provider: "TensorFlow", model: "resnet-50-v2", endpoint: "http://ml-models.svc:5000", apiKey: "", tags: ["vision", "classification"], status: "active", type: "ml" },
  { id: "lightgbm-regression", name: "LightGBM Regressor", description: "Fast gradient boosting for regression tasks.", provider: "Microsoft", model: "lightgbm-v3.3", endpoint: "http://ml-models.svc:5000", apiKey: "", tags: ["regression", "tabular"], status: "draft", type: "ml" },

  // Embedding Models
  { id: "openai-text-embedding-3-large", name: "Text Embedding 3 Large", description: "High-dimensional text embeddings with superior performance.", provider: "OpenAI", model: "text-embedding-3-large", endpoint: "https://api.openai.com/v1", apiKey: "sk-***", tags: ["text", "semantic-search"], status: "active", type: "embedding" },
  { id: "openai-text-embedding-3-small", name: "Text Embedding 3 Small", description: "Efficient text embeddings with good performance-cost ratio.", provider: "OpenAI", model: "text-embedding-3-small", endpoint: "https://api.openai.com/v1", apiKey: "sk-***", tags: ["text", "fast"], status: "active", type: "embedding" },
  { id: "huggingface-bge-m3", name: "BGE-M3", description: "Multilingual dense retrieval model supporting 100+ languages.", provider: "Hugging Face", model: "bge-m3", endpoint: "http://embeddings.svc:8000", apiKey: "", tags: ["multilingual", "dense-retrieval"], status: "active", type: "embedding" },
  { id: "huggingface-e5-large-v2", name: "E5-Large-v2", description: "Large-scale multilingual text embeddings.", provider: "Hugging Face", model: "e5-large-v2", endpoint: "http://embeddings.svc:8000", apiKey: "", tags: ["multilingual", "semantic"], status: "active", type: "embedding" },
  { id: "cohere-embed-english-v3", name: "Embed English v3", description: "Optimized English text embeddings with high quality.", provider: "Cohere", model: "embed-english-v3.0", endpoint: "https://api.cohere.ai/v1", apiKey: "co-***", tags: ["english", "high-quality"], status: "active", type: "embedding" },
  { id: "voyage-3-large", name: "Voyage 3 Large", description: "State-of-the-art large embedding model for semantic search.", provider: "Voyage AI", model: "voyage-3-large", endpoint: "https://api.voyageai.com/v1", apiKey: "pa-***", tags: ["semantic-search", "rag"], status: "active", type: "embedding" },
];

export const models = initialModels;
