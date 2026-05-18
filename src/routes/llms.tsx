import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader, type CatalogItem } from "@/components/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Brain, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/llms")({
  head: () => ({ meta: [{ title: "Models · OrkestrAI" }] }),
  component: ModelsPage,
});

interface ModelEntry {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  endpoint: string;
  apiKey: string;
  tags: string[];
  status: "active" | "draft" | "error";
  type: "llm" | "ml" | "embedding";
}

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

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

function ModelsPage() {
  const [items, setItems] = useState(initialModels);
  const [editItem, setEditItem] = useState<ModelEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "llm" | "ml" | "embedding">("all");

  const openNew = () => {
    setEditItem({ id: "", name: "", description: "", provider: "", model: "", endpoint: "", apiKey: "", tags: [], status: "draft", type: "llm" });
    setIsNew(true);
  };

  const openEdit = (item: ModelEntry) => {
    setEditItem({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editItem || !editItem.name.trim()) { toast.error("Nome obrigatório"); return; }
    if (isNew) {
      const id = editItem.name.toLowerCase().replace(/\s+/g, "-");
      setItems([{ ...editItem, id }, ...items]);
      toast.success(`"${editItem.name}" registrado`);
    } else {
      setItems(items.map((i) => (i.id === editItem.id ? editItem : i)));
      toast.success(`"${editItem.name}" atualizado`);
    }
    setEditItem(null);
  };

  const remove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success("Removido");
  };

  const filteredItems = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  return (
    <AppLayout title="Models" subtitle="LLM and ML models registry">
      <div className="p-6">
        <PageHeader title="Models" description="LLM, ML and Embedding model registry available to your agents.">
          <Button size="sm" onClick={openNew} className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Register model
          </Button>
        </PageHeader>

        {/* Abas */}
        <div className="flex gap-2 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            All Models ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("llm")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "llm"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            LLM ({items.filter((i) => i.type === "llm").length})
          </button>
          <button
            onClick={() => setActiveTab("ml")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "ml"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            ML ({items.filter((i) => i.type === "ml").length})
          </button>
          <button
            onClick={() => setActiveTab("embedding")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "embedding"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Embeddings ({items.filter((i) => i.type === "embedding").length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="border-border bg-card/80 p-5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15 text-info">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-base font-semibold">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.provider} · {item.model}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <Badge variant="outline" className={cn("gap-1.5", statusMap[item.status])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.status}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-normal uppercase">
                    {item.type}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => openEdit(item)}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-destructive" onClick={() => remove(item.id)}>
                  <Trash2 className="h-3 w-3" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "Register model" : "Edit model"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Name</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea rows={2} value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Provider</Label>
                  <Input value={editItem.provider} onChange={(e) => setEditItem({ ...editItem, provider: e.target.value })} placeholder="OpenAI, Google, Anthropic..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <select
                    value={editItem.type}
                    onChange={(e) => setEditItem({ ...editItem, type: e.target.value as "llm" | "ml" | "embedding" })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                  >
                    <option value="llm">LLM</option>
                    <option value="ml">ML</option>
                    <option value="embedding">Embedding</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Model ID</Label>
                <Input className="font-mono text-xs" value={editItem.model} onChange={(e) => setEditItem({ ...editItem, model: e.target.value })} placeholder="gpt-5" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Endpoint URL</Label>
                <Input className="font-mono text-xs" value={editItem.endpoint} onChange={(e) => setEditItem({ ...editItem, endpoint: e.target.value })} placeholder="https://api.openai.com/v1" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">API Key</Label>
                <Input type="password" className="font-mono text-xs" value={editItem.apiKey} onChange={(e) => setEditItem({ ...editItem, apiKey: e.target.value })} placeholder="sk-..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input value={editItem.tags.join(", ")} onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={save} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
              {isNew ? "Register" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
