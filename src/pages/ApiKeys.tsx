import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
}

const ApiKeys = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState("read");
  const [newKeyGenerated, setNewKeyGenerated] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleCreateKey = () => {
    const generatedKey = `sk_${newKeyPermissions === "full" ? "prod" : newKeyPermissions}_${Math.random().toString(36).substring(2, 15)}`;
    setNewKeyGenerated(generatedKey);
    
    const newKey: ApiKey = {
      id: Math.random().toString(36).substring(7),
      name: newKeyName,
      prefix: `${generatedKey.substring(0, 8)}****${generatedKey.slice(-6)}`,
      permissions: newKeyPermissions,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
      expiresAt: null,
    };
    
    setKeys([newKey, ...keys]);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((key) => key.id !== id));
    toast.success("API key deleted");
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setNewKeyName("");
    setNewKeyPermissions("read");
    setNewKeyGenerated(null);
    setShowKey(false);
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case "full":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Full Access</Badge>;
      case "write":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Read/Write</Badge>;
      case "read":
        return <Badge className="bg-info/20 text-info border-info/30">Read Only</Badge>;
      default:
        return <Badge variant="outline">{permission}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
            <p className="text-muted-foreground">Manage your API keys for programmatic access</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              {!newKeyGenerated ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Create a new API key for programmatic access to your resources.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permissions">Permissions</Label>
                      <Select value={newKeyPermissions} onValueChange={setNewKeyPermissions}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read Only</SelectItem>
                          <SelectItem value="write">Read/Write</SelectItem>
                          <SelectItem value="full">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKey} disabled={!newKeyName}>
                      Create Key
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Save Your API Key
                    </DialogTitle>
                    <DialogDescription>
                      This is the only time you'll see this key. Copy it now and store it securely.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="relative">
                      <Input
                        type={showKey ? "text" : "password"}
                        value={newKeyGenerated}
                        readOnly
                        className="pr-20 font-mono text-sm"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyKey(newKeyGenerated)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCloseDialog}>Done</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Security Notice */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-4 py-4">
            <Shield className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Keep your API keys secure</p>
              <p className="text-sm text-muted-foreground">
                Never share your API keys or commit them to version control. Use environment variables to store them securely.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Active API Keys</CardTitle>
            <CardDescription>You have {keys.length} active API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No API keys created yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create an API key to get programmatic access
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{key.name}</p>
                          {getPermissionBadge(key.permissions)}
                        </div>
                        <p className="text-sm font-mono text-muted-foreground">{key.prefix}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right text-sm">
                        <span className="text-muted-foreground">
                          Created {key.createdAt}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Use your API key in requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="text-sm overflow-x-auto">
                <code className="text-muted-foreground">
{`curl -X GET "https://api.cloudops.example/v1/resources" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ApiKeys;
