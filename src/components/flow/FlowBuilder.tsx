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
import { nodeCatalog } from "./nodeCatalog";
import { Brain, Bot, Database, Send, Wrench, Settings2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const nodeTypes = { agent: AgentNode };

const initialNodes: Node[] = [
  {
    id: "n1",
    type: "agent",
    position: { x: 60, y: 140 },
    data: {
      label: "User Input",
      description: "Trigger from chat",
      icon: Send,
      variant: "output",
      meta: "stream",
    },
  },
  {
    id: "n2",
    type: "agent",
    position: { x: 340, y: 60 },
    data: {
      label: "Researcher Agent",
      description: "Plans and delegates",
      icon: Bot,
      variant: "agent",
      meta: "ReAct · 4 tools",
    },
  },
  {
    id: "n3",
    type: "agent",
    position: { x: 340, y: 240 },
    data: {
      label: "Knowledge Base",
      description: "Internal docs RAG",
      icon: Database,
      variant: "rag",
      meta: "pgvector · 12k docs",
    },
  },
  {
    id: "n4",
    type: "agent",
    position: { x: 640, y: 140 },
    data: {
      label: "Gemini 2.5 Pro",
      description: "Main reasoner",
      icon: Brain,
      variant: "llm",
      meta: "temp 0.4 · 8k ctx",
    },
  },
  {
    id: "n5",
    type: "agent",
    position: { x: 640, y: 320 },
    data: {
      label: "Web Search",
      description: "Tavily API",
      icon: Wrench,
      variant: "tool",
      meta: "GET /search",
    },
  },
  {
    id: "n6",
    type: "agent",
    position: { x: 940, y: 200 },
    data: {
      label: "Stream Response",
      description: "SSE to client",
      icon: Send,
      variant: "output",
      meta: "text/event-stream",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-3", source: "n2", target: "n3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-4", source: "n3", target: "n4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-5", source: "n2", target: "n5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e4-6", source: "n4", target: "n6", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e5-6", source: "n5", target: "n6", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
];

let idCounter = 100;

function FlowInner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("n2");

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
      const template = nodeCatalog.find((n) => n.type === type);
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
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes],
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
      {/* Node Palette */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/60 backdrop-blur-md">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Components
          </p>
          <p className="text-sm font-semibold">Drag to canvas</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {nodeCatalog.map((tpl) => (
              <div
                key={tpl.type}
                draggable
                onDragStart={(e) => onDragStart(e, tpl.type)}
                className="group cursor-grab rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)] active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      `bg-[var(--node-${tpl.variant})]/15 text-[var(--node-${tpl.variant})]`,
                    )}
                  >
                    <tpl.icon className="h-4 w-4" />
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

      {/* Canvas */}
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
          onNodeClick={(_, node) => setSelectedId(node.id)}
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

        {/* Floating run bar */}
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/80 px-2 py-1 backdrop-blur-xl shadow-[var(--shadow-card)]">
            <Badge variant="outline" className="gap-1 border-success/40 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Draft saved
            </Badge>
            <Button size="sm" variant="ghost" className="h-7">
              Validate
            </Button>
            <Button size="sm" className="h-7 gap-1 bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90">
              <Sparkles className="h-3 w-3" /> Run flow
            </Button>
          </div>
        </div>
      </div>

      {/* Properties */}
      <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-sidebar/60 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Properties
            </p>
            <p className="text-sm font-semibold">
              {selectedNode ? (selectedNode.data as { label: string }).label : "No selection"}
            </p>
          </div>
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <ScrollArea className="flex-1">
          {selectedNode ? (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label className="text-xs">Name</Label>
                <Input
                  value={(selectedNode.data as { label: string }).label}
                  onChange={(e) => updateSelected({ label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={3}
                  value={(selectedNode.data as { description?: string }).description ?? ""}
                  onChange={(e) => updateSelected({ description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Configuration</Label>
                <Input
                  className="font-mono text-xs"
                  value={(selectedNode.data as { meta?: string }).meta ?? ""}
                  onChange={(e) => updateSelected({ meta: e.target.value })}
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Variant
                </p>
                <p className="mt-1 text-sm font-semibold capitalize">
                  {(selectedNode.data as { variant: string }).variant}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" /> Delete node
              </Button>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Select a node to edit its properties.
            </div>
          )}
        </ScrollArea>
      </aside>
    </div>
  );
}

export function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
