import { useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { LucideIcon } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/CatalogGrid";
import { AppLayout } from "@/components/AppLayout";
import { useEnvironment } from "@/lib/EnvironmentContext";
import { cn } from "@/lib/utils";

export type Environment = "dev" | "staging" | "production";

export interface EnvFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "number";
  multiline?: boolean;
}

export type EnvConfig = Record<string, string>;

export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "active" | "draft" | "error";
  envs: Record<Environment, EnvConfig>;
}

interface CatalogManagerProps {
  title: string;
  subtitle: string;
  description: string;
  newButtonLabel: string;
  icon: LucideIcon;
  envFields: EnvFieldDef[];
  initialItems: CatalogEntry[];
  /** Optional fields shown in the shared (top-level) form */
  extraTopFields?: ReactNode;
  /** Optional custom badge renderer */
  renderCustomBadge?: (item: CatalogEntry) => ReactNode;
  /** Optional custom actions renderer */
  renderCustomActions?: (item: CatalogEntry, onEdit: () => void, onDelete: () => void) => ReactNode;
  /** Optional function to determine if item should be view-only */
  isViewOnly?: (item: CatalogEntry) => boolean;
}

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

function emptyEnvs(fields: EnvFieldDef[]): Record<Environment, EnvConfig> {
  const blank: EnvConfig = {};
  fields.forEach((f) => (blank[f.key] = ""));
  return {
    dev: { ...blank },
    staging: { ...blank },
    production: { ...blank },
  };
}

export function CatalogManager({
  title,
  subtitle,
  description,
  newButtonLabel,
  icon: Icon,
  envFields,
  initialItems,
  renderCustomBadge,
  renderCustomActions,
  isViewOnly,
}: CatalogManagerProps) {
  const [items, setItems] = useState<CatalogEntry[]>(initialItems);
  const [editing, setEditing] = useState<CatalogEntry | null>(null);
  const [open, setOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  const openNew = () => {
    setViewOnly(false);
    setEditing({
      id: "",
      name: "",
      description: "",
      tags: [],
      status: "draft",
      envs: emptyEnvs(envFields),
    });
    setOpen(true);
  };

  const openEdit = (entry: CatalogEntry) => {
    const shouldBeViewOnly = isViewOnly?.(entry) ?? false;
    setViewOnly(shouldBeViewOnly);
    setEditing({
      ...entry,
      envs: {
        dev: { ...entry.envs.dev },
        staging: { ...entry.envs.staging },
        production: { ...entry.envs.production },
      },
    });
    setOpen(true);
  };

  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));

  const save = (entry: CatalogEntry) => {
    setItems((xs) => {
      const exists = xs.some((x) => x.id === entry.id);
      if (exists) return xs.map((x) => (x.id === entry.id ? entry : x));
      return [...xs, entry];
    });
    setOpen(false);
    setEditing(null);
  };

  return (
    <AppLayout title={title} subtitle={subtitle}>
      <div className="p-6">
        <PageHeader title={title} description={description}>
          <Button
            size="sm"
            onClick={openNew}
            className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> {newButtonLabel}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden border-border bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/0 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-base font-semibold">{item.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.id}
                    </p>
                  </div>
                </div>
                {renderCustomBadge ? (
                  renderCustomBadge(item)
                ) : (
                  <Badge variant="outline" className={cn("gap-1.5", statusMap[item.status])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.status}
                  </Badge>
                )}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
                {renderCustomActions ? (
                  renderCustomActions(
                    item,
                    () => openEdit(item),
                    () => remove(item.id)
                  )
                ) : (
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
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <EditorDialog
        open={open}
        onOpenChange={setOpen}
        entry={editing}
        envFields={envFields}
        title={title}
        onSave={save}
        viewOnly={viewOnly}
      />
    </AppLayout>
  );
}

interface EditorDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entry: CatalogEntry | null;
  envFields: EnvFieldDef[];
  title: string;
  onSave: (entry: CatalogEntry) => void;
  viewOnly?: boolean;
}

function EditorDialog({ open, onOpenChange, entry, envFields, title, onSave, viewOnly = false }: EditorDialogProps) {
  const [draft, setDraft] = useState<CatalogEntry | null>(entry);
  const { activeEnv } = useEnvironment();

  // Sync when a new entry is being edited
  if (open && draft?.id !== entry?.id && entry) {
    setDraft(entry);
  }
  if (!open && draft) {
    // reset on close
    setTimeout(() => setDraft(null), 150);
  }

  if (!draft) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent />
    </Dialog>
  );

  const isNew = !draft.id;
  const update = (patch: Partial<CatalogEntry>) => {
    if (!viewOnly) setDraft((d) => (d ? { ...d, ...patch } : d));
  };
  const updateEnv = (key: string, value: string) => {
    if (!viewOnly) {
      setDraft((d) =>
        d ? { ...d, envs: { ...d.envs, [activeEnv]: { ...d.envs[activeEnv], [key]: value } } } : d,
      );
    }
  };

  const handleSave = () => {
    if (!draft.name.trim()) return;
    const id = draft.id || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    onSave({ ...draft, id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isNew ? `New ${title.replace(/s$/, "")}` : `Edit ${draft.name}`}
          </DialogTitle>
          <DialogDescription>
            Shared metadata plus configuration for <span className="font-semibold capitalize">{activeEnv}</span> environment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="My provider"
                disabled={viewOnly}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={draft.status}
                onChange={(e) => update({ status: e.target.value as CatalogEntry["status"] })}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={viewOnly}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="error">error</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
              disabled={viewOnly}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={draft.tags.join(", ")}
              onChange={(e) =>
                update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
              }
              placeholder="REST, OAuth2"
              disabled={viewOnly}
            />
          </div>

          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="mb-4 text-sm font-semibold capitalize">{activeEnv} Environment Configuration</p>
            <div className="space-y-3">
              {envFields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.multiline ? (
                    <Textarea
                      id={f.key}
                      rows={2}
                      value={draft.envs[activeEnv][f.key] ?? ""}
                      onChange={(e) => updateEnv(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      disabled={viewOnly}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      type={f.type ?? "text"}
                      value={draft.envs[activeEnv][f.key] ?? ""}
                      onChange={(e) => updateEnv(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      disabled={viewOnly}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {viewOnly ? "Close" : "Cancel"}
          </Button>
          {!viewOnly && (
            <Button
              onClick={handleSave}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground"
            >
              {isNew ? "Create" : "Save changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
