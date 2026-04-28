import type { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import {
  registeredRags,
  registeredApis,
  registeredMcpServers,
  registeredAgents,
  databaseTypes,
  requestProtocols,
  cronPresets,
  type RegistryItem,
} from "@/data/registry";

interface Props {
  node: Node | null;
  onChange: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  options: RegistryItem[] | { id: string; name: string; meta?: string }[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              <div className="flex flex-col">
                <span className="text-sm">{o.name}</span>
                {"meta" in o && o.meta && (
                  <span className="text-[10px] text-muted-foreground">{o.meta}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PropertiesPanel({ node, onChange, onDelete }: Props) {
  if (!node) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        Selecione um nó no canvas para editar suas propriedades.
      </div>
    );
  }

  const data = node.data as Record<string, unknown>;
  const nodeType = (data.nodeType as string) ?? (data.variant as string);
  const label = (data.label as string) ?? "";
  const description = (data.description as string) ?? "";
  const meta = (data.meta as string) ?? "";

  const renderTypeSpecific = () => {
    switch (nodeType) {
      case "prompt":
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">System / Template</Label>
              <Textarea
                rows={6}
                placeholder={'You are a helpful assistant.\n\nUser: {{input}}\nMemory: {{memory}}\nContext: {{rag}}'}
                value={(data.template as string) ?? ""}
                onChange={(e) => onChange({ template: e.target.value })}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Use {"{{input}}"}, {"{{memory}}"}, {"{{rag}}"}, {"{{tools}}"} para
                referenciar os conectores de entrada, memória, contexto e ferramentas.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed">
              <p className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground mb-1">
                Conectores
              </p>
              <ul className="space-y-0.5">
                <li>· <span className="text-[var(--node-input)]">in</span> — Input</li>
                <li>· <span className="text-[var(--node-memory)]">mem</span> — Memory</li>
                <li>· <span className="text-[var(--node-tool)]">tools</span> — Tools / MCP</li>
                <li>· <span className="text-[var(--node-rag)]">rag</span> — RAG context</li>
              </ul>
            </div>
          </>
        );
      case "rag":
        return (
          <SelectField
            label="RAG Index"
            placeholder="Selecione um índice cadastrado"
            value={data.ragId as string | undefined}
            options={registeredRags}
            onChange={(v) => {
              const item = registeredRags.find((r) => r.id === v);
              onChange({ ragId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "tool":
        return (
          <SelectField
            label="API cadastrada"
            placeholder="Selecione uma API"
            value={data.apiId as string | undefined}
            options={registeredApis}
            onChange={(v) => {
              const item = registeredApis.find((r) => r.id === v);
              onChange({ apiId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "mcp":
        return (
          <SelectField
            label="MCP Server"
            placeholder="Selecione um MCP server"
            value={data.mcpId as string | undefined}
            options={registeredMcpServers}
            onChange={(v) => {
              const item = registeredMcpServers.find((r) => r.id === v);
              onChange({ mcpId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "agentref":
        return (
          <SelectField
            label="Agente cadastrado"
            placeholder="Selecione um agente publicado"
            value={data.agentId as string | undefined}
            options={registeredAgents}
            onChange={(v) => {
              const item = registeredAgents.find((r) => r.id === v);
              onChange({ agentId: v, label: item?.name ?? label, meta: item?.meta });
            }}
          />
        );
      case "db":
        return (
          <SelectField
            label="Tipo de banco"
            placeholder="Selecione o banco"
            value={data.dbType as string | undefined}
            options={databaseTypes}
            onChange={(v) => {
              const item = databaseTypes.find((r) => r.id === v);
              onChange({ dbType: v, meta: item?.name });
            }}
          />
        );
      case "endpoint":
        return (
          <>
            <SelectField
              label="Protocolo"
              placeholder="Selecione o tipo de request"
              value={(data.protocol as string) ?? "rest"}
              options={requestProtocols}
              onChange={(v) => {
                const item = requestProtocols.find((r) => r.id === v);
                onChange({ protocol: v, meta: `${item?.name} request` });
              }}
            />
            <div className="space-y-2">
              <Label className="text-xs">Path / Endpoint</Label>
              <Input
                className="font-mono text-xs"
                placeholder="POST /v1/chat"
                value={(data.path as string) ?? ""}
                onChange={(e) => onChange({ path: e.target.value })}
              />
            </div>
          </>
        );
      case "output":
        return (
          <SelectField
            label="Formato da resposta"
            placeholder="Selecione o formato"
            value={(data.format as string) ?? ""}
            options={[
              { id: "json", name: "JSON" },
              { id: "sse", name: "SSE Stream" },
              { id: "ws", name: "WebSocket" },
              { id: "grpc", name: "gRPC stream" },
              { id: "graphql", name: "GraphQL response" },
            ]}
            onChange={(v) => onChange({ format: v, meta: v.toUpperCase() })}
          />
        );
      case "cron":
        return (
          <>
            <SelectField
              label="Preset"
              placeholder="Selecione um preset"
              value={(data.cron as string) ?? ""}
              options={cronPresets}
              onChange={(v) => {
                const item = cronPresets.find((c) => c.id === v);
                onChange({ cron: v, meta: item?.name });
              }}
            />
            <div className="space-y-2">
              <Label className="text-xs">Expressão cron</Label>
              <Input
                className="font-mono text-xs"
                placeholder="0 2 * * *"
                value={(data.cron as string) ?? ""}
                onChange={(e) => onChange({ cron: e.target.value })}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label className="text-xs">Nome</Label>
        <Input value={label} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Descrição</Label>
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      {renderTypeSpecific()}

      <div className="space-y-2">
        <Label className="text-xs">Configuração (livre)</Label>
        <Input
          className="font-mono text-xs"
          value={meta}
          onChange={(e) => onChange({ meta: e.target.value })}
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Tipo
        </p>
        <p className="mt-1 text-sm font-semibold capitalize">{nodeType}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3 w-3" /> Remover nó
      </Button>
    </div>
  );
}
