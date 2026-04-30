import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
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
import { ArrowLeft, Pencil, Users, User, GitBranch, Database, Building2 } from "lucide-react";
import { getAgentFlow, updateAgentFlow, type AgentFlow } from "@/data/flows";
import { deriveFanIn, deriveFanOut, deriveRags } from "@/data/flowStore";
import { FanDiagram } from "@/components/flow/FanDiagram";
import { PipelineSection } from "@/components/sections/PipelineSection";
import { ObservabilitySection } from "@/components/sections/ObservabilitySection";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/agents/$id/")({
  loader: ({ params }) => {
    const flow = getAgentFlow(params.id);
    if (!flow) throw notFound();
    return { flow };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.flow.name ?? "Agent"} · Synapse` },
      { name: "description", content: loaderData?.flow.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout title="Not found">
      <div className="p-6 text-sm text-muted-foreground">
        Agent not found.{" "}
        <Link to="/agents" className="text-primary underline">
          Back to list
        </Link>
      </div>
    </AppLayout>
  ),
  component: AgentDetail,
});

const statusMap = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

function AgentDetail() {
  const { flow } = Route.useLoaderData() as { flow: AgentFlow };
  const storedFanIn = deriveFanIn(flow.id, "agent");
  const storedFanOut = deriveFanOut(flow.id, "agent");
  const storedRags = deriveRags(flow.id);
  const fanIn = storedFanIn.length > 0 ? storedFanIn : flow.fanIn;
  const fanOut = storedFanOut.length > 0 ? storedFanOut : flow.fanOut;
  const rags = storedRags.length > 0 ? storedRags : flow.rags;

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
    updateAgentFlow(flow.id, {
      description: editDescription,
      area: editArea,
      team: editTeam,
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditOpen(false);
    toast.success("Aplicação atualizada");
  };

  return (
    <AppLayout title={flow.name} subtitle={`Agent · ${flow.version}`}>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-7 gap-1 text-muted-foreground">
              <Link to="/agents">
                <ArrowLeft className="h-3.5 w-3.5" /> Agents
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight">{flow.name}</h1>
              <Badge variant="outline" className={cn("gap-1.5", statusMap[flow.status])}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {flow.status}
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{flow.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {flow.team}</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {flow.area}</span>
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {flow.owner}</span>
              <span className="flex items-center gap-1.5 font-mono"><GitBranch className="h-3.5 w-3.5" /> {flow.id}</span>
              <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={openEditDialog}>
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flow.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
              ))}
            </div>
          </div>
          {!flow.tags.includes("highcode") && (
            <Button asChild size="sm" className="gap-1.5 bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Link to="/agents/$id/edit" params={{ id: flow.id }}>
                <Pencil className="h-3.5 w-3.5" /> Edit agent
              </Link>
            </Button>
          )}
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
              Inputs feeding the agent and the LLMs, APIs, MCPs and outputs it relies on.
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
          <div className="mb-4">
            <p className="font-display text-base font-semibold">Knowledge bases (RAGs)</p>
            <p className="text-xs text-muted-foreground">
              {rags.length} retriever{rags.length === 1 ? "" : "s"} bound to this agent
            </p>
          </div>
          {rags.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No RAGs attached.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rags.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card/80 p-3"
                  style={{ boxShadow: "0 0 18px color-mix(in oklch, var(--node-rag) 18%, transparent)" }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: "color-mix(in oklch, var(--node-rag) 18%, transparent)", color: "var(--node-rag)" }}
                  >
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {r.meta} · {r.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline & Deploy</TabsTrigger>
            <TabsTrigger value="observability">Observability</TabsTrigger>
          </TabsList>
          <TabsContent value="pipeline" className="mt-4">
            <PipelineSection flowName={flow.slug} />
          </TabsContent>
          <TabsContent value="observability" className="mt-4">
            <ObservabilitySection />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
