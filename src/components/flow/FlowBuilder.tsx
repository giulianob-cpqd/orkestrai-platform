import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
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
import { orchestrationNodeGroups, type NodeGroup } from "./nodeCatalog";
import { AIAssistantPanel, type AssistantMode } from "./AIAssistantPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { TestFlowDialog } from "./TestFlowDialog";
import { DeployPipelineDialog } from "./DeployPipelineDialog";
import { Link } from "@tanstack/react-router";
import {
  Sparkles, Settings2, Play, ArrowLeft, Variable, GitBranch,
  ChevronDown, ChevronRight, ChevronLeft, GitCompare, Bug, Circle, X, Trash2, Rocket,
} from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import { saveFlow, getVersion, getVersionHistory } from "@/data/flowStore";
import { setAppStatus, setAppEnvStatus, getAppVersion } from "@/data/flows";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  backHref?: string;
  backLabel?: string;
  flowName?: string;
  appId?: string;
  environment?: string;
}

let idCounter = 1000;

/** Generate a 6-char hex string (deterministic per session for the same flow) */
function shortUuid(): string {
  return Math.random().toString(16).slice(2, 8);
}

/** Mock log lines for the bottom panel */
const MOCK_LOGS = [
  { ts: "12:00:01.123", level: "INFO", msg: "Flow execution started" },
  { ts: "12:00:01.156", level: "INFO", msg: "Resolving input node → POST /v1/research" },
  { ts: "12:00:01.201", level: "DEBUG", msg: "Payload validated (schema: v2, 342 bytes)" },
  { ts: "12:00:01.310", level: "INFO", msg: "Routing to Intent Router → 3 paths evaluated" },
  { ts: "12:00:01.455", level: "WARN", msg: "Researcher agent latency above threshold (320ms)" },
  { ts: "12:00:01.602", level: "INFO", msg: "SQL Analyst returned 14 rows" },
  { ts: "12:00:01.780", level: "DEBUG", msg: "Kafka producer: events.research partition 2 offset 8841" },
  { ts: "12:00:01.900", level: "INFO", msg: "Warehouse upsert completed (14 rows affected)" },
  { ts: "12:00:02.050", level: "INFO", msg: "S3 Reports: artifact uploaded (report-2024-abc.json)" },
  { ts: "12:00:02.200", level: "INFO", msg: "SSE response stream opened" },
  { ts: "12:00:02.450", level: "INFO", msg: "Flow execution completed — 1327ms total" },
  { ts: "12:00:02.451", level: "DEBUG", msg: "Cleaning up temporary buffers" },
];

/** Mock messages between components for debug panel */
function generateMockMessages(nodes: Node[], edges: Edge[]) {
  return edges.slice(0, 6).map((edge) => {
    const src = nodes.find((n) => n.id === edge.source);
    const tgt = nodes.find((n) => n.id === edge.target);
    return {
      id: edge.id,
      from: (src?.data as { label?: string })?.label ?? edge.source,
      to: (tgt?.data as { label?: string })?.label ?? edge.target,
      payload: '{ "ok": true }',
      ts: `12:00:0${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 999).toString().padStart(3, "0")}`,
    };
  });
}

function PaletteItem({ tpl, onDragStart }: { tpl: NodeTemplate; onDragStart: (e: React.DragEvent, type: string) => void }) {
  const Icon = resolveIcon(tpl.icon);
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, tpl.type)}
      className="group cursor-grab rounded-lg border border-border bg-card p-2.5 transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)] active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
          style={{
            background: `color-mix(in oklch, var(--node-${tpl.variant}) 18%, transparent)`,
            color: `var(--node-${tpl.variant})`,
          }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-xs font-semibold truncate">{tpl.label}</span>
          <span className="text-[9px] text-muted-foreground truncate">{tpl.description}</span>
        </div>
      </div>
    </div>
  );
}

function FlowInner({
  catalog,
  initialNodes,
  initialEdges,
  paletteTitle = "Components",
  paletteSubtitle = "Drag to canvas",
  runLabel = "Run flow",
  assistantMode = "orchestration",
  backHref,
  backLabel = "Back",
  flowName,
  appId,
  environment = "dev",
}: FlowBuilderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"properties" | "assistant" | "variables" | "debug">("properties");
  const [testOpen, setTestOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Message / Communication", "Tasks"]));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: "API_KEY", value: "" },
    { key: "DB_HOST", value: "localhost" },
  ]);

  // --- Branch name (mock) ---
  const branchName = useMemo(() => {
    const uuid = shortUuid();
    const name = flowName ?? "flow";
    if (environment === "prod") return `fix/${name}-${uuid}`;
    return `feature/${name}-${environment}-${uuid}`;
  }, [flowName, environment]);

  const [selectedVersion, setSelectedVersion] = useState("v0.1.0");
  const versions = ["v0.1.0", "v0.2.0", "v0.3.0"];
  const [versionHistory, setVersionHistory] = useState<string[]>(() => {
    if (!appId) return ["v0.1.0"];
    return getVersionHistory(appId, environment);
  });

  // --- Compare dialog ---
  const [compareOpen, setCompareOpen] = useState(false);
  const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);

  // --- Discard changes confirmation ---
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<string | null>(null);

  const handleVersionClick = (version: string) => {
    setBranchPopoverOpen(false);
    if (hasChanges) {
      setPendingVersion(version);
      setDiscardOpen(true);
    } else {
      setCurrentVersion(version);
    }
  };

  const confirmDiscard = () => {
    if (pendingVersion) {
      setCurrentVersion(pendingVersion);
      setHasChanges(false);
      setPendingVersion(null);
    }
    setDiscardOpen(false);
  };

  // Track if user has made changes (branch only shows after first change)
  const [hasChanges, setHasChanges] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(() => {
    if (!appId) return "v0.1.0";
    const storeVer = getVersion(appId);
    if (storeVer !== "v0.1.0") return storeVer;
    return getAppVersion(appId);
  });

  const baseBranch = environment === "prod" ? "main" : environment === "staging" ? "staging" : "develop";

  const handleDeployDone = (newVersion: string) => {
    setCurrentVersion(newVersion);
    setHasChanges(false);
    setVersionHistory((prev) => {
      const updated = [newVersion, ...prev.filter((v) => v !== newVersion)];
      return updated;
    });
  };

  // --- Debug: breakpoints on edges ---
  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());

  const toggleBreakpoint = useCallback((edgeId: string) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(edgeId)) next.delete(edgeId);
      else next.add(edgeId);
      return next;
    });
  }, []);

  // --- Log panel ---
  const [logOpen, setLogOpen] = useState(false);
  const [logLines, setLogLines] = useState(MOCK_LOGS);

  // Auto-save flow to store on every change
  const initialSaveRef = useRef(true);
  useEffect(() => {
    if (appId) {
      saveFlow(appId, nodes, edges, undefined, environment);
      if (initialSaveRef.current) {
        initialSaveRef.current = false;
      } else {
        // Set environment-specific status to draft when changes are made
        if (environment) {
          setAppEnvStatus(appId, environment, "draft");
        } else {
          setAppStatus(appId, "draft");
        }
        setHasChanges(true);
      }
    }
  }, [appId, nodes, edges, environment]);
  const [deployOpen, setDeployOpen] = useState(false);

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

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }, [selectedId, setNodes, setEdges]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, deleteSelected]);

  // Apply red styling to breakpoint edges
  const styledEdges = useMemo(
    () =>
      edges.map((edge) =>
        breakpoints.has(edge.id)
          ? { ...edge, style: { ...edge.style, stroke: "#ef4444", strokeWidth: 3 }, label: "🔴", labelStyle: { fontSize: 14 } }
          : edge,
      ),
    [edges, breakpoints],
  );

  const mockMessages = useMemo(() => generateMockMessages(nodes, edges), [nodes, edges]);

  // Handle "Test Flow" click — open test dialog AND open log panel
  const handleTestFlow = () => {
    setTestOpen(true);
    setLogOpen(true);
    setLogLines(MOCK_LOGS);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col">
      <div className="flex flex-1 min-h-0">
        {/* Left palette */}
        <aside className={cn("flex flex-col border-r border-border bg-sidebar/60 backdrop-blur-md transition-all", leftSidebarOpen ? "w-64 shrink-0" : "w-12 shrink-0")}>
          <div className={cn("border-b border-border px-4 py-3 flex items-center justify-between", !leftSidebarOpen && "px-2")}>
            {leftSidebarOpen && (
              <>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {paletteTitle}
                  </p>
                  <p className="text-sm font-semibold">{paletteSubtitle}</p>
                </div>
              </>
            )}
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="ml-auto p-1 hover:bg-muted/40 rounded transition-colors"
              aria-label="Toggle sidebar"
            >
              {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          {leftSidebarOpen && (
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-3">
                {assistantMode === "orchestration" ? (
                  /* Grouped palette for orchestration */
                  orchestrationNodeGroups.map((group) => {
                    const isExpanded = expandedGroups.has(group.name);
                    return (
                      <div key={group.name}>
                        <button
                          onClick={() => setExpandedGroups((prev) => {
                            const next = new Set(prev);
                            if (next.has(group.name)) next.delete(group.name);
                            else next.add(group.name);
                            return next;
                          })}
                          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:bg-muted/40 transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {group.name}
                          <span className="ml-auto text-[9px] text-muted-foreground/60">{group.items.length}</span>
                        </button>
                        {isExpanded && (
                          <div className="space-y-1.5 pb-2 pt-1">
                            {group.items.map((tpl) => (
                              <PaletteItem key={`${group.name}-${tpl.type}-${tpl.label}`} tpl={tpl} onDragStart={onDragStart} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* Flat palette for agents */
                  <div className="space-y-1.5">
                    {catalog.map((tpl) => (
                      <PaletteItem key={tpl.type} tpl={tpl} onDragStart={onDragStart} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </aside>

        {/* Center canvas */}
        <div ref={wrapperRef} className="relative flex-1">
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
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
            onEdgeClick={(_, edge) => {
              toggleBreakpoint(edge.id);
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

          {/* Top toolbar */}
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/80 px-2 py-1 backdrop-blur-xl shadow-[var(--shadow-card)]">
              {backHref && (
                <Button asChild size="sm" variant="ghost" className="h-7 gap-1">
                  <Link to={backHref}>
                    <ArrowLeft className="h-3 w-3" /> {backLabel}
                  </Link>
                </Button>
              )}
              {/* Draft saved badge removed */}

              {/* Version or Branch — dropdown always available */}
              {hasChanges ? (
                <DropdownMenu open={branchPopoverOpen} onOpenChange={setBranchPopoverOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2.5 py-0.5 font-mono text-[10px] text-primary hover:bg-primary/10 transition-colors">
                      <GitBranch className="h-3 w-3" /> {branchName}
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64">
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Base: {baseBranch}
                    </div>
                    <DropdownMenuItem onClick={() => { setBranchPopoverOpen(false); setCompareOpen(true); }}>
                      <GitCompare className="h-3.5 w-3.5 mr-2" />
                      <span className="text-xs">Compare with {baseBranch}</span>
                    </DropdownMenuItem>
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-t border-border mt-1 pt-1.5">
                      Previous versions
                    </div>
                    {versionHistory.filter((v) => v !== currentVersion).map((v) => (
                      <DropdownMenuItem key={v} onClick={() => handleVersionClick(v)}>
                        <span className="font-mono text-xs">{v}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">switch</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu open={branchPopoverOpen} onOpenChange={setBranchPopoverOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1 rounded-full border border-info/40 px-2.5 py-0.5 font-mono text-[10px] text-info hover:bg-info/10 transition-colors">
                      {currentVersion}
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64">
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Current version
                    </div>
                    <DropdownMenuItem onClick={() => { setBranchPopoverOpen(false); setCompareOpen(true); }}>
                      <GitCompare className="h-3.5 w-3.5 mr-2" />
                      <span className="text-xs">Compare with {baseBranch}</span>
                    </DropdownMenuItem>
                    {versionHistory.length > 1 && (
                      <>
                        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-t border-border mt-1 pt-1.5">
                          Previous versions
                        </div>
                        {versionHistory.filter((v) => v !== currentVersion).map((v) => (
                          <DropdownMenuItem key={v} onClick={() => handleVersionClick(v)}>
                            <span className="font-mono text-xs">{v}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">switch</span>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1"
                onClick={handleTestFlow}
              >
                <Play className="h-3 w-3" /> Test Flow
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1 bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90"
                onClick={() => setDeployOpen(true)}
              >
                <Rocket className="h-3 w-3" /> {runLabel}
              </Button>
            </div>
          </div>

          <TestFlowDialog open={testOpen} onOpenChange={setTestOpen} nodes={nodes} mode={assistantMode} flowName={flowName} />
          <DeployPipelineDialog open={deployOpen} onOpenChange={setDeployOpen} flowName={flowName ?? "flow"} appId={appId} environment={environment} onDeployDone={handleDeployDone} />

          {/* Branch comparison dialog */}
          <BranchCompareDialog open={compareOpen} onOpenChange={setCompareOpen} branchName={branchName} baseBranch={baseBranch} nodes={nodes} />

          {/* Discard changes confirmation */}
          <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Discard changes?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                You have unsaved changes on branch <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-primary">{branchName}</code>. Switching to <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{pendingVersion}</code> will discard them.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDiscardOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDiscard}>Discard & switch</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right sidebar */}
        <aside className={cn("flex flex-col border-l border-border bg-sidebar/60 backdrop-blur-md transition-all", rightSidebarOpen ? "w-96 shrink-0" : "w-12 shrink-0")}>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex h-full flex-col">
            <div className={cn("border-b border-border px-3 pt-3 flex items-center", !rightSidebarOpen && "px-2 justify-center")}>
              {rightSidebarOpen && (
                <TabsList className={cn("grid w-full", assistantMode === "orchestration" ? "grid-cols-4" : "grid-cols-3")}>
                  <TabsTrigger value="properties" className="gap-1.5">
                    <Settings2 className="h-3.5 w-3.5" /> Properties
                  </TabsTrigger>
                  {assistantMode === "orchestration" && (
                    <TabsTrigger value="variables" className="gap-1.5">
                      <Variable className="h-3.5 w-3.5" /> Variables
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="debug" className="gap-1.5">
                    <Bug className="h-3.5 w-3.5" /> Debug
                  </TabsTrigger>
                  <TabsTrigger value="assistant" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI
                  </TabsTrigger>
                </TabsList>
              )}
              <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="ml-auto p-1 hover:bg-muted/40 rounded transition-colors"
                aria-label="Toggle sidebar"
              >
                {rightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {rightSidebarOpen && (
              <>
                <div className="px-1 pb-2 pt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3">
                  {tab === "properties"
                    ? selectedNode
                      ? (selectedNode.data as { label: string }).label
                      : "Nenhum nó selecionado"
                    : tab === "variables"
                      ? `${envVars.length} variáveis`
                      : tab === "debug"
                        ? `${breakpoints.size} breakpoint${breakpoints.size !== 1 ? "s" : ""}`
                        : assistantMode === "agent"
                          ? "Agent Composer"
                          : "Orchestration Composer"}
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

                <TabsContent value="variables" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Defina variáveis de ambiente. Use <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-primary">{"{{NOME}}"}</code> nos campos dos componentes.
                        </p>
                      </div>
                      {envVars.map((v, i) => (
                        <div key={i} className="flex items-end gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-[10px]">Key</Label>
                            <Input
                              className="font-mono text-xs h-8"
                              placeholder="VAR_NAME"
                              value={v.key}
                              onChange={(e) => {
                                const next = [...envVars];
                                next[i] = { ...next[i], key: e.target.value };
                                setEnvVars(next);
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-[10px]">Value</Label>
                            <Input
                              className="font-mono text-xs h-8"
                              placeholder="value"
                              value={v.value}
                              onChange={(e) => {
                                const next = [...envVars];
                                next[i] = { ...next[i], value: e.target.value };
                                setEnvVars(next);
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setEnvVars(envVars.filter((_, j) => j !== i))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setEnvVars([...envVars, { key: "", value: "" }])}
                      >
                        + Add variable
                      </Button>
                      {envVars.length > 0 && (
                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Disponíveis</p>
                          <div className="flex flex-wrap gap-1">
                            {envVars.filter((v) => v.key).map((v) => (
                              <Badge key={v.key} variant="secondary" className="font-mono text-[10px]">
                                {`{{${v.key}}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Debug tab */}
                <TabsContent value="debug" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Click on edges in the canvas to toggle breakpoints. Messages between components are shown below.
                        </p>
                      </div>

                      {/* Breakpoints */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Breakpoints</p>
                        {breakpoints.size === 0 ? (
                          <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                            No breakpoints set. Click an edge to add one.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {Array.from(breakpoints).map((edgeId) => {
                              const edge = edges.find((e) => e.id === edgeId);
                              const src = nodes.find((n) => n.id === edge?.source);
                              const tgt = nodes.find((n) => n.id === edge?.target);
                              return (
                                <div key={edgeId} className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                                  <Circle className="h-2.5 w-2.5 fill-destructive text-destructive" />
                                  <span className="flex-1 text-xs font-mono truncate">
                                    {(src?.data as { label?: string })?.label ?? edge?.source} → {(tgt?.data as { label?: string })?.label ?? edge?.target}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                                    onClick={() => toggleBreakpoint(edgeId)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Mock messages */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Messages</p>
                        <div className="space-y-1.5">
                          {mockMessages.map((msg) => (
                            <div key={msg.id} className="rounded-md border border-border bg-muted/40 px-3 py-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-muted-foreground">{msg.ts}</span>
                                <Badge variant="secondary" className="text-[9px] h-4">{msg.from} → {msg.to}</Badge>
                              </div>
                              <pre className="font-mono text-[10px] text-foreground/80">{msg.payload}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

            <TabsContent value="assistant" className="flex-1 overflow-hidden m-0">
              <AIAssistantPanel
                mode={assistantMode}
                catalog={catalog}
                onApply={handleAssistantApply}
              />
            </TabsContent>
              </>
            )}
          </Tabs>
        </aside>
      </div>

      {/* Bottom log panel */}
      {logOpen && (
        <div className="border-t border-border bg-black" style={{ height: 200 }}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Execution Log</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-[10px] text-white/50 hover:text-white hover:bg-white/10"
                onClick={() => setLogLines([])}
              >
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-white/10"
                onClick={() => setLogOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(200px-2rem)] px-4 py-2">
            {logLines.length === 0 ? (
              <p className="font-mono text-[11px] text-white/30">No logs yet.</p>
            ) : (
              <div className="space-y-0.5">
                {logLines.map((line, i) => (
                  <div key={i} className="font-mono text-[11px] leading-relaxed flex gap-2">
                    <span className="text-green-400 shrink-0">{line.ts}</span>
                    <span className={cn(
                      "shrink-0 w-12",
                      line.level === "WARN" && "text-yellow-400",
                      line.level === "ERROR" && "text-red-400",
                      line.level === "INFO" && "text-blue-400",
                      line.level === "DEBUG" && "text-white/40",
                    )}>
                      {line.level}
                    </span>
                    <span className="text-white/90">{line.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

/** Mock branch comparison dialog */
function BranchCompareDialog({
  open,
  onOpenChange,
  branchName,
  baseBranch,
  nodes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchName: string;
  baseBranch: string;
  nodes: Node[];
}) {
  // Generate mock diff lines based on actual nodes
  const diffLines = useMemo(() => {
    const lines: { type: "context" | "added" | "removed"; text: string }[] = [];
    lines.push({ type: "context", text: "  nodes:" });

    // Show first 2 nodes as "context" (unchanged)
    nodes.slice(0, 2).forEach((n) => {
      const label = (n.data as { label?: string })?.label ?? n.id;
      lines.push({ type: "context", text: `    - id: ${n.id}  # ${label}` });
    });

    // Show a "removed" node (mock)
    lines.push({ type: "removed", text: `    - id: old_node  # Legacy Handler` });
    lines.push({ type: "removed", text: `      type: agent` });
    lines.push({ type: "removed", text: `      variant: tool` });

    // Show "added" nodes from the current canvas
    nodes.slice(2, 5).forEach((n) => {
      const label = (n.data as { label?: string })?.label ?? n.id;
      const variant = (n.data as { variant?: string })?.variant ?? "agent";
      lines.push({ type: "added", text: `    - id: ${n.id}  # ${label}` });
      lines.push({ type: "added", text: `      type: agent` });
      lines.push({ type: "added", text: `      variant: ${variant}` });
    });

    lines.push({ type: "context", text: "  edges:" });
    lines.push({ type: "removed", text: `    - source: old_node → target: output` });
    lines.push({ type: "added", text: `    - source: ${nodes[2]?.id ?? "n1"} → target: ${nodes[nodes.length - 1]?.id ?? "n2"}` });

    return lines;
  }, [nodes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" />
            Branch comparison
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              <GitBranch className="h-3 w-3 mr-1" /> {baseBranch}
            </Badge>
            <span className="text-xs text-muted-foreground">Current deployed</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] border-primary/40 text-primary">
              <GitBranch className="h-3 w-3 mr-1" /> {branchName}
            </Badge>
            <span className="text-xs text-muted-foreground">Working branch</span>
          </div>
        </div>
        <ScrollArea className="h-[400px] rounded-md border border-border bg-black/95 p-4">
          <pre className="font-mono text-[11px] leading-relaxed">
            {diffLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "px-2 -mx-2",
                  line.type === "added" && "bg-green-500/10 text-green-400",
                  line.type === "removed" && "bg-red-500/10 text-red-400",
                  line.type === "context" && "text-white/60",
                )}
              >
                {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                {line.text}
              </div>
            ))}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  );
}
