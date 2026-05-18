import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [defaultLlm, setDefaultLlm] = useState("gpt-5");
  const [defaultEnv, setDefaultEnv] = useState("dev");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize the platform behavior and your workspace.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <Row label="Theme" hint="Choose how Inspire looks to you.">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Language" hint="Display language across the UI.">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português (BR)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Reduce motion" hint="Disable animations on flows and dialogs.">
              <Switch />
            </Row>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 pt-4">
            <Row label="Pipeline events" hint="Notify me when a CI/CD run finishes.">
              <Switch defaultChecked />
            </Row>
            <Row label="Deploy promotions" hint="Notify me on environment promotions.">
              <Switch defaultChecked />
            </Row>
            <Row label="Agent failures" hint="Alert when an agent or orchestration errors out.">
              <Switch defaultChecked />
            </Row>
            <Row label="Weekly digest" hint="Summary of activity by email.">
              <Switch />
            </Row>
          </TabsContent>

          <TabsContent value="defaults" className="space-y-4 pt-4">
            <Row label="Default LLM" hint="Pre-selected when creating new agents.">
              <Select value={defaultLlm} onValueChange={setDefaultLlm}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-5">OpenAI · GPT-5</SelectItem>
                  <SelectItem value="claude-4.5">Anthropic · Claude 4.5</SelectItem>
                  <SelectItem value="gemini-2.5">Google · Gemini 2.5</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Default environment" hint="Where new flows deploy first.">
              <Select value={defaultEnv} onValueChange={setDefaultEnv}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Default namespace" hint="Kubernetes namespace for deployments.">
              <Input className="w-48" defaultValue="ai-platform" />
            </Row>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 pt-4">
            <Row label="GitHub" hint="Sync templates and high-code repositories.">
              <Button variant="outline" size="sm">Connect</Button>
            </Row>
            <Row label="Slack" hint="Receive alerts in your channels.">
              <Button variant="outline" size="sm">Connect</Button>
            </Row>
            <Row label="Datadog" hint="Forward observability metrics.">
              <Button variant="outline" size="sm">Connect</Button>
            </Row>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border/50 bg-card/40 p-3">
      <div className="leading-tight">
        <Label className="text-sm font-semibold">{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  );
}
