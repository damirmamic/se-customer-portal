import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Building2, Phone, MapPin, Shield, Clock, Save, Camera } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, roles } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    company: user?.user_metadata?.company || "CloudOps Inc.",
    department: user?.user_metadata?.department || "Engineering",
    location: user?.user_metadata?.location || "",
  });

  const handleSave = () => {
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  }) : "Unknown";

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="glass-card">
          <CardHeader className="relative pb-0">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{displayName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      "Edit Profile"
                    )}
                  </Button>
                </div>

                {/* Roles & Status */}
                <div className="flex items-center gap-2 mt-4">
                  {roles.map((role) => (
                    <Badge key={role} variant="outline" className="capitalize">
                      <Shield className="w-3 h-3 mr-1" />
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="text-success border-success/30">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator className="my-6" />

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.fullName || "Not set"}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </Label>
                <p className="text-foreground py-2">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.phone || "Not set"}</p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Company
                </Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.company || "Not set"}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Department
                </Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Your department"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.department || "Not set"}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.location || "Not set"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
            <CardDescription>Your account details and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Member Since
                </Label>
                <p className="text-foreground">{memberSince}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Authentication Provider
                </Label>
                <p className="text-foreground capitalize">
                  {user?.app_metadata?.provider || "Microsoft Entra ID"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Last Sign In</Label>
                <p className="text-foreground">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">User ID</Label>
                <p className="text-foreground text-sm font-mono truncate">{user?.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
