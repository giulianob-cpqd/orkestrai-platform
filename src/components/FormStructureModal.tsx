import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { type FormStructure } from "@/data/executions";

interface FormStructureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formStructure?: FormStructure;
  onSave: (structure: FormStructure) => void;
}

const FIELD_TYPES = ["text", "email", "number", "select", "textarea", "checkbox", "checkbox-group"] as const;

export function FormStructureModal({ open, onOpenChange, formStructure, onSave }: FormStructureModalProps) {
  const [name, setName] = useState(formStructure?.name ?? "");
  const [description, setDescription] = useState(formStructure?.description ?? "");
  const [fields, setFields] = useState(formStructure?.fields ?? []);
  const [parameters, setParameters] = useState<Record<string, unknown>>(formStructure?.parameters ?? {});
  const [paramKey, setParamKey] = useState("");
  const [paramValue, setParamValue] = useState("");

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: `field_${fields.length}`, label: "", type: "text" as const, value: "" },
    ]);
  };

  const handleUpdateField = (idx: number, updates: Partial<typeof fields[0]>) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], ...updates };
    setFields(updated);
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleAddParameter = () => {
    if (paramKey.trim()) {
      try {
        const value = paramValue.trim() === "" ? "" : JSON.parse(paramValue);
        setParameters({ ...parameters, [paramKey]: value });
        setParamKey("");
        setParamValue("");
      } catch {
        setParameters({ ...parameters, [paramKey]: paramValue });
        setParamKey("");
        setParamValue("");
      }
    }
  };

  const handleRemoveParameter = (key: string) => {
    const updated = { ...parameters };
    delete updated[key];
    setParameters(updated);
  };

  const handleSave = () => {
    const structure: FormStructure = {
      id: formStructure?.id ?? `fs_${Date.now()}`,
      name: name || "Sem nome",
      description,
      fields,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    };
    onSave(structure);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Estrutura do Formulário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Informações Básicas</h3>
            <div>
              <label className="text-xs font-medium mb-1 block">Nome da estrutura</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Estrutura de Aprovação"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Descrição</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito desta estrutura..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <Separator />

          {/* Campos do formulário */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Campos do Formulário</h3>
              <Button size="sm" variant="outline" onClick={handleAddField}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar campo
              </Button>
            </div>

            <div className="space-y-2">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum campo adicionado ainda.</p>
              ) : (
                fields.map((field, idx) => (
                  <Card key={idx} className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Nome do campo</label>
                            <Input
                              size="sm"
                              value={field.name}
                              onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                              placeholder="Ex: decision"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Rótulo</label>
                            <Input
                              size="sm"
                              value={field.label}
                              onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                              placeholder="Ex: Decisão"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Tipo</label>
                            <Select value={field.type} onValueChange={(v) => handleUpdateField(idx, { type: v as any })}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Valor padrão</label>
                            <Input
                              size="sm"
                              value={field.value ?? ""}
                              onChange={(e) => handleUpdateField(idx, { value: e.target.value })}
                              placeholder="Valor padrão"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        {(field.type === "select" || field.type === "checkbox-group") && (
                          <div>
                            <label className="text-xs font-medium mb-1 block">Opções (separadas por vírgula)</label>
                            <Input
                              size="sm"
                              value={field.options?.join(", ") ?? ""}
                              onChange={(e) => handleUpdateField(idx, { options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })}
                              placeholder="Opção 1, Opção 2, Opção 3"
                              className="h-8 text-xs"
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveField(idx)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Parâmetros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Parâmetros</h3>
            </div>

            <div className="space-y-2">
              {Object.entries(parameters).map(([key, value]) => (
                <Card key={key} className="p-2 flex items-center justify-between">
                  <div className="text-xs">
                    <Badge variant="outline">{key}</Badge>
                    <span className="ml-2 text-muted-foreground">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveParameter(key)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Card>
              ))}
            </div>

            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Chave</label>
                  <Input
                    size="sm"
                    value={paramKey}
                    onChange={(e) => setParamKey(e.target.value)}
                    placeholder="Ex: maxAmount"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Valor (JSON ou texto)</label>
                  <Input
                    size="sm"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    placeholder="Ex: 5000 ou [1,2,3]"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleAddParameter} className="w-full h-8">
                <Plus className="h-3 w-3 mr-1" />
                Adicionar parâmetro
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar estrutura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
