import { useCallback, useMemo, useRef, useState, type DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AgentNode } from "./AgentNode";
import type { NodeTemplate } from "./nodeCatalog";
import { AIAssistantPanel, type AssistantMode } from "./AIAssistantPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { Sparkles, Settings2 } from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const nodeTypes = { agent: AgentNode };

export interface FlowBuilderProps {
  catalog: NodeTemplate[];
  initialNodes: Node[];
  initialEdges: Edge[];
  paletteTitle?: string;
  paletteSubtitle?: string;
  runLabel?: string;
  assistantMode?: AssistantMode;
}

let idCounter = 1000;

function FlowInner({
  catalog,
  initialNodes,
  initialEdges,
  paletteTitle = "Components",
  paletteSubtitle = "Drag to canvas",
  runLabel = "Run flow",
  assistantMode = "orchestration",
}: FlowBuilderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"properties" | "assistant">("properties");

  const handleAssistantApply = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes((nds) => nds.concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
      setTimeout(() => rfInstance?.fitView({ padding: 0.2, duration: 600 }), 50);
    },
    [setNodes, setEdges, rfInstance],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds),
      ),
    [setEdges],
  );

  const onDragStart = (event: DragEvent, templateType: string) => {
    event.dataTransfer.setData("application/synapse-node", templateType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/synapse-node");
      const template = catalog.find((n) => n.type === type);
      if (!template || !rfInstance) return;
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: `n${++idCounter}`,
        type: "agent",
        position,
        data: {
          label: template.label,
          description: template.description,
          icon: template.icon,
          variant: template.variant,
          meta: template.meta,
          nodeType: template.type,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes, catalog],
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const updateSelected = (patch: Record<string, unknown>) => {
    if (!selectedId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/60 backdrop-blur-md">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {paletteTitle}
          </p>
          <p className="text-sm font-semibold">{paletteSubtitle}</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {catalog.map((tpl) => (
              <div
                key={tpl.type}
                draggable
                onDragStart={(e) => onDragStart(e, tpl.type)}
                className="group cursor-grab rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)] active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn("flex h-8 w-8 items-center justify-center rounded-md")}
                    style={{
                      background: `color-mix(in oklch, var(--node-${tpl.variant}) 18%, transparent)`,
                      color: `var(--node-${tpl.variant})`,
                    }}
                  >
                    {(() => { const Icon = resolveIcon(tpl.icon); return <Icon className="h-4 w-4" />; })()}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">{tpl.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {tpl.description}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <div ref={wrapperRef} className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={(_, node) => {
            setSelectedId(node.id);
            setTab("properties");
          }}
          onPaneClick={() => setSelectedId(null)}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2 } }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="oklch(0.4 0.02 260)" />
          <Controls position="bottom-right" />
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={(n) => {
              const v = (n.data as { variant?: string })?.variant ?? "agent";
              return `var(--node-${v})`;
            }}
            maskColor="oklch(0.18 0.02 260 / 70%)"
          />
        </ReactFlow>

        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/80 px-2 py-1 backdrop-blur-xl shadow-[var(--shadow-card)]">
            <Badge variant="outline" className="gap-1 border-success/40 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Draft saved
            </Badge>
            <Button size="sm" variant="ghost" className="h-7">
              Validate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1"
              onClick={() => setTab("assistant")}
            >
              <Sparkles className="h-3 w-3" /> AI Assistant
            </Button>
            <Button size="sm" className="h-7 gap-1 bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
              <Sparkles className="h-3 w-3" /> {runLabel}
            </Button>
          </div>
        </div>
      </div>

      <aside className="flex w-96 shrink-0 flex-col border-l border-border bg-sidebar/60 backdrop-blur-md">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "properties" | "assistant")} className="flex h-full flex-col">
          <div className="border-b border-border px-3 pt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties" className="gap-1.5">
                <Settings2 className="h-3.5 w-3.5" /> Properties
              </TabsTrigger>
              <TabsTrigger value="assistant" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Assistant
              </TabsTrigger>
            </TabsList>
            <div className="px-1 pb-2 pt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {tab === "properties"
                ? selectedNode
                  ? (selectedNode.data as { label: string }).label
                  : "Nenhum nó selecionado"
                : assistantMode === "agent"
                  ? "Agent Composer"
                  : "Orchestration Composer"}
            </div>
          </div>

          <TabsContent value="properties" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <PropertiesPanel
                node={selectedNode}
                mode={assistantMode}
                onChange={updateSelected}
                onDelete={deleteSelected}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="assistant" className="flex-1 overflow-hidden m-0">
            <AIAssistantPanel
              mode={assistantMode}
              catalog={catalog}
              onApply={handleAssistantApply}
            />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
}

export function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}
