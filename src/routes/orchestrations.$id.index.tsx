import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Pencil, Users, User, GitBranch, Bot, Building2, Server, Cloud, Monitor, Code2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getOrchestration, updateOrchestration, type OrchestrationFlow } from "@/data/flows";
import { deriveFanIn, deriveFanOut } from "@/data/flowStore";
import { FanDiagram } from "@/components/flow/FanDiagram";
import { PipelineSection, DeploySection } from "@/components/sections/PipelineSection";
import { ObservabilitySection } from "@/components/sections/ObservabilitySection";
import { useEnvironment } from "@/lib/EnvironmentContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/orchestrations/$id/")({
  loader: ({ params }) => {
    const flow = getOrchestration(params.id);
    if (!flow) throw notFound();
    return { flow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.flow.name ?? "Orchestration"} · OrkestrAI` },
      { name: "description", content: loaderData?.flow.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout title="Not found">
      <div className="p-6 text-sm text-muted-foreground">
        Orchestration not found.{" "}
        <Link to="/orchestrations" className="text-primary underline">
          Back to list
        </Link>
      </div>
    </AppLayout>
  ),
  component: OrchestrationDetail,
});

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
  deploying: "border-blue-400/40 text-blue-400",
};

function OrchestrationDetail() {
  const { flow: initialFlow } = Route.useLoaderData() as { flow: OrchestrationFlow };
  const { activeEnv } = useEnvironment();
  const [flow, setFlow] = useState(initialFlow);
  
  // Recarregar o fluxo quando a janela volta para o foco ou aba fica visível
  useEffect(() => {
    const handleFocus = () => {
      const updatedFlow = getOrchestration(initialFlow.id);
      if (updatedFlow) {
        setFlow(updatedFlow);
      }
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const updatedFlow = getOrchestration(initialFlow.id);
        if (updatedFlow) {
          setFlow(updatedFlow);
        }
      }
    };
    
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialFlow.id]);
  
  // Calculate current version based on active environment
  const currentVersion = flow.envStatus?.[activeEnv]?.version ?? flow.version;
  
  const { fanIn, fanOut } = useMemo(() => {
    const storedFanIn = deriveFanIn(flow.id, "orchestration", activeEnv);
    const storedFanOut = deriveFanOut(flow.id, "orchestration", activeEnv);
    return {
      fanIn: storedFanIn.length > 0 ? storedFanIn : flow.fanIn,
      fanOut: storedFanOut.length > 0 ? storedFanOut : flow.fanOut,
    };
  }, [flow.id, activeEnv, flow.fanIn, flow.fanOut]);

  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editDescription, setEditDescription] = useState(flow.description);
  const [editArea, setEditArea] = useState(flow.area);
  const [editTeam, setEditTeam] = useState(flow.team);
  const [editTags, setEditTags] = useState(flow.tags.join(", "));

  const openEditDialog = () => {
    setEditDescription(flow.description);
    setEditArea(flow.area);
    setEditTeam(flow.team);
    setEditTags(flow.tags.join(", "));
    setEditOpen(true);
  };

  const saveEdit = () => {
    updateOrchestration(flow.id, {
      description: editDescription,
      area: editArea,
      team: editTeam,
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditOpen(false);
    toast.success("Aplicação atualizada");
  };

  return (
    <AppLayout title={flow.name} subtitle={`Orchestration · ${flow.version}`}>
      <div className="space-y-6 p-6">
        <div className="w-full">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-7 gap-1 text-muted-foreground">
            <Link to="/orchestrations">
              <ArrowLeft className="h-3.5 w-3.5" /> Orchestrations
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight">{flow.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className={cn("gap-1 text-[10px]", statusMap[flow.status])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> <span>{flow.status}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 text-[10px]",
                    flow.codeLevel === "lowcode"
                      ? "border-primary/40 text-primary"
                      : "border-warning/40 text-warning",
                  )}
                >
                  {flow.codeLevel === "lowcode" ? <GitBranch className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
                  {flow.codeLevel}
                </Badge>
              </div>
            </div>
            {!flow.tags.includes("highcode") && (
              <Button 
                size="sm" 
                className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground" 
                onClick={() => navigate({ to: "/orchestrations/$id/edit", params: { id: flow.id } })}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit flow
              </Button>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{flow.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {flow.team}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {flow.area}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {flow.owner}
            </span>
            <span className="flex items-center gap-1.5 text-info font-semibold">{currentVersion}</span>
            {flow.repoUrl && (
              <a 
                href={flow.repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Code2 className="h-3.5 w-3.5" />
                {flow.repoUrl.split('/').pop()?.replace('.git', '') || 'Repository'}
              </a>
            )}
            <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={openEditDialog}>
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {flow.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit metadata</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Area</Label>
                <Input value={editArea} onChange={(e) => setEditArea(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Team</Label>
                <Select value={editTeam} onValueChange={setEditTeam}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Platform">Platform</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                    <SelectItem value="Finance Ops">Finance Ops</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveEdit} className="bg-[image:var(--gradient-primary)] text-primary-foreground">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-border bg-card/60 p-5 backdrop-blur-md">
          <div className="mb-4">
            <p className="font-display text-base font-semibold">Fan-in / Fan-out</p>
            <p className="text-xs text-muted-foreground">
              Endpoints and queues that trigger this flow, and the systems it orchestrates.
            </p>
          </div>
          <FanDiagram
            fanIn={fanIn}
            fanOut={fanOut}
            centerLabel={flow.name}
            centerSubtitle={flow.version}
          />
        </Card>

        <Card className="border-border bg-card/60 p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-base font-semibold">Agents in this orchestration</p>
              <p className="text-xs text-muted-foreground">
                {flow.agents.length} referenced agents
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {flow.agents.map((a) => (
              <Link
                key={a.id}
                to="/agents/$id"
                params={{ id: a.id }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3 transition-all hover:border-accent/50 hover:shadow-[var(--shadow-glow)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {a.role} · {a.id}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="observability">Observability</TabsTrigger>
          </TabsList>
          <TabsContent value="pipeline" className="mt-4">
            <PipelineSection flowName={flow.slug} environment={activeEnv} flowStatus={flow.status} />
          </TabsContent>
          <TabsContent value="deploy" className="mt-4">
            <DeploySection flowName={flow.slug} flowId={flow.id} environment={activeEnv} mode="orchestration" />
          </TabsContent>
          <TabsContent value="observability" className="mt-4">
            <ObservabilitySection flowType="orchestration" />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
