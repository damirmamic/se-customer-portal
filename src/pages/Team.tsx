import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "admin" | "operations_engineer" | "customer";

interface TeamMember {
  id: string;
  user_id: string;
  role: AppRole;
  email?: string;
  name?: string;
  created_at: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
  status: "pending" | "accepted" | "expired" | "cancelled";
  created_at: string;
  expires_at: string;
}

const getRoleBadge = (role: AppRole) => {
  const styles = {
    admin: "bg-destructive/20 text-destructive border-destructive/30",
    operations_engineer: "bg-warning/20 text-warning border-warning/30",
    customer: "bg-info/20 text-info border-info/30",
  };
  const labels = {
    admin: "Admin",
    operations_engineer: "Ops Engineer",
    customer: "Customer",
  };
  return <Badge className={styles[role]}>{labels[role]}</Badge>;
};

const getStatusBadge = (status: TeamInvitation["status"]) => {
  const config = {
    pending: { icon: Clock, className: "text-warning border-warning/30", label: "Pending" },
    accepted: { icon: CheckCircle2, className: "text-success border-success/30", label: "Accepted" },
    expired: { icon: XCircle, className: "text-muted-foreground border-muted", label: "Expired" },
    cancelled: { icon: XCircle, className: "text-destructive border-destructive/30", label: "Cancelled" },
  };
  const { icon: Icon, className, label } = config[status];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

const Team = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("customer");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch team members (users with roles)
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch pending invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ["teamInvitations"],
    queryFn: async (): Promise<TeamInvitation[]> => {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map((inv) => ({
        ...inv,
        status: inv.status as TeamInvitation["status"],
      }));
    },
  });

  // Send invitation mutation
  const sendInvite = useMutation({
    mutationFn: async ({ email, name, role }: { email: string; name?: string; role: AppRole }) => {
      const { data, error } = await supabase.functions.invoke("send-team-invite", {
        body: { email, name, role },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teamInvitations"] });
      if (data?.warning) {
        toast.warning(`Invitation created, but email delivery failed. The user can still sign in.`);
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`);
      }
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("customer");
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    },
  });

  // Cancel invitation mutation
  const cancelInvite = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamInvitations"] });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      console.error("Failed to cancel invitation:", error);
      toast.error("Failed to cancel invitation");
    },
  });

  // Resend invitation mutation
  const resendInvite = useMutation({
    mutationFn: async (invitation: TeamInvitation) => {
      // Cancel old invitation and create new one
      await supabase
        .from("team_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitation.id);

      const { data, error } = await supabase.functions.invoke("send-team-invite", {
        body: { email: invitation.email, name: invitation.name, role: invitation.role },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamInvitations"] });
      toast.success("Invitation resent");
    },
    onError: (error) => {
      console.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation");
    },
  });

  const handleInvite = () => {
    if (!inviteEmail) return;
    sendInvite.mutate({ email: inviteEmail, name: inviteName || undefined, role: inviteRole });
  };

  const isLoading = membersLoading || invitationsLoading;
  const activeMembers = members.length;
  const pendingInvites = invitations.filter((i) => i.status === "pending").length;
  const admins = members.filter((m) => m.role === "admin").length;
  const engineers = members.filter((m) => m.role === "operations_engineer").length;

  // Filter invitations by search
  const filteredInvitations = invitations.filter((inv) =>
    inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team</h1>
            <p className="text-muted-foreground">Manage team members and permissions</p>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to join your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="operations_engineer">Operations Engineer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail || sendInvite.isPending}>
                  {sendInvite.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground">{activeMembers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invites</p>
                  <p className="text-2xl font-bold text-warning">{pendingInvites}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-foreground">{admins}</p>
                </div>
                <Shield className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engineers</p>
                  <p className="text-2xl font-bold text-foreground">{engineers}</p>
                </div>
                <Users className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search invitations..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Team Members */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Active members with access to this organization</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No team members yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Invite team members to collaborate
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {member.user_id.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground font-mono text-sm">
                            {member.user_id === user?.id ? "You" : member.user_id.substring(0, 8)}
                          </h3>
                          {getRoleBadge(member.role)}
                          <Badge variant="outline" className="text-success border-success/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(member.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invitations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>Pending and past team invitations</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No invitations</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send invitations to grow your team
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {(invitation.name || invitation.email)
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">
                            {invitation.name || invitation.email.split("@")[0]}
                          </h3>
                          {getRoleBadge(invitation.role)}
                          {getStatusBadge(invitation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {invitation.email}
                        </p>
                      </div>
                    </div>
                    {invitation.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvite.mutate(invitation)}
                          disabled={resendInvite.isPending}
                        >
                          <RefreshCw className={`w-4 h-4 mr-1 ${resendInvite.isPending ? "animate-spin" : ""}`} />
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvite.mutate(invitation.id)}
                          disabled={cancelInvite.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Team;
