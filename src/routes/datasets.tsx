import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/CatalogGrid";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Plus, Pencil, Trash2, Table2 } from "lucide-react";
import { toast } from "sonner";
import { datasets as initialDatasets } from "@/data/training";

export const Route = createFileRoute("/datasets")({
  head: () => ({ meta: [{ title: "Datasets · OrkestrAI" }] }),
  component: DatasetsPage,
});

interface DatasetEntry {
  id: string;
  name: string;
  description: string;
  format: string;
  size: string;
  rows: number;
  path: string;
  tags: string[];
  status: "active" | "draft" | "error";
}

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

const datasetFormats = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "jsonl", label: "JSONL (JSON Lines)" },
  { value: "parquet", label: "Parquet" },
  { value: "deltalake", label: "Delta Lake" },
  { value: "avro", label: "Apache Avro" },
  { value: "orc", label: "Apache ORC" },
  { value: "hdf5", label: "HDF5" },
  { value: "arrow", label: "Apache Arrow" },
  { value: "tfrecord", label: "TFRecord" },
  { value: "protobuf", label: "Protocol Buffers" },
  { value: "xml", label: "XML" },
  { value: "sql", label: "SQL Database" },
  { value: "excel", label: "Excel (XLSX)" },
  { value: "sqlite", label: "SQLite" },
];

const generateRandomSize = (): { size: string; rows: number } => {
  const rows = Math.floor(Math.random() * 5_000_000) + 10_000; // 10k to 5M rows
  const sizeGb = (rows * 0.000008).toFixed(1); // Approximate: ~8 bytes per row
  return {
    rows,
    size: `${sizeGb} GB`,
  };
};

const initialItems: DatasetEntry[] = initialDatasets.map((d) => ({
  id: d.id,
  name: d.name,
  description: d.description || "Dataset for training and fine-tuning",
  format: d.format || "CSV",
  size: d.size || "0 MB",
  rows: d.rows,
  path: d.path || `/datasets/${d.id}`,
  tags: Array.isArray(d.tags) ? d.tags : [],
  status: "active" as const,
}));

function DatasetsPage() {
  const [items, setItems] = useState(initialItems);
  const [editItem, setEditItem] = useState<DatasetEntry | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    const randomData = generateRandomSize();
    setEditItem({ 
      id: "", 
      name: "", 
      description: "", 
      format: "CSV", 
      size: randomData.size, 
      rows: randomData.rows, 
      path: "", 
      tags: [], 
      status: "draft" 
    });
    setIsNew(true);
  };

  const openEdit = (item: DatasetEntry) => {
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

  return (
    <AppLayout title="Datasets" subtitle="Training datasets for model fine-tuning">
      <div className="p-6">
        <PageHeader title="Datasets" description="Datasets available for training and fine-tuning.">
          <Button size="sm" onClick={openNew} className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Register dataset
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/0 text-primary">
                    <Table2 className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-base font-semibold">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.id}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`gap-1.5 ${statusMap[item.status]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {item.status}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

              <p className="text-xs text-muted-foreground mt-2 truncate font-mono">{item.path}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px] font-normal">{item.format}</Badge>
                <Badge variant="secondary" className="text-[10px] font-normal">{item.size}</Badge>
                <Badge variant="secondary" className="text-[10px] font-normal">{item.rows.toLocaleString()} rows</Badge>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Table2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No datasets registered yet</p>
          </div>
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "Register dataset" : "Edit dataset"}</DialogTitle>
          </DialogHeader>
          {editItem && (
              <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-widest">Name</Label>
                <Input
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  placeholder="e.g. Customer Support Tickets"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Description</Label>
                <Textarea
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  placeholder="Dataset description..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Path</Label>
                <Input
                  value={editItem.path}
                  onChange={(e) => setEditItem({ ...editItem, path: e.target.value })}
                  placeholder="e.g. s3://bucket/datasets/customer-support or /data/datasets/support"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-widest">Format</Label>
                  <Select
                    value={editItem.format}
                    onValueChange={(value) => setEditItem({ ...editItem, format: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasetFormats.map((fmt) => (
                        <SelectItem key={fmt.value} value={fmt.value}>
                          {fmt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Dataset Information (Read-only)</Label>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium">{editItem.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rows</p>
                    <p className="font-medium">{editItem.rows.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Tags (comma-separated)</Label>
                <Input
                  value={editItem.tags.join(", ")}
                  onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  placeholder="e.g. production, labeled, balanced"
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button onClick={save}>{isNew ? "Register" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
