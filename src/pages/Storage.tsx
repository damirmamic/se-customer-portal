import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  HardDrive, 
  Upload, 
  Download, 
  Trash2, 
  Folder, 
  FileText, 
  Image, 
  Video,
  MoreVertical,
  Plus,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StorageBucket {
  id: string;
  name: string;
  region: string;
  used: number;
  total: number;
  files: number;
  type: "standard" | "archive" | "cdn";
  lastModified: string;
}

const buckets: StorageBucket[] = [
  {
    id: "1",
    name: "production-assets",
    region: "US East",
    used: 856,
    total: 1000,
    files: 24589,
    type: "cdn",
    lastModified: "2024-12-24T10:30:00Z",
  },
  {
    id: "2",
    name: "user-uploads",
    region: "US East",
    used: 1245,
    total: 2000,
    files: 156789,
    type: "standard",
    lastModified: "2024-12-24T11:15:00Z",
  },
  {
    id: "3",
    name: "backup-archive",
    region: "US West",
    used: 4500,
    total: 10000,
    files: 890,
    type: "archive",
    lastModified: "2024-12-24T02:00:00Z",
  },
  {
    id: "4",
    name: "logs-storage",
    region: "EU West",
    used: 320,
    total: 500,
    files: 45678,
    type: "standard",
    lastModified: "2024-12-24T11:45:00Z",
  },
];

const recentFiles = [
  { name: "api-response-log.json", size: "2.4 MB", type: "json", uploaded: "5 min ago" },
  { name: "user-avatar-4521.png", size: "156 KB", type: "image", uploaded: "12 min ago" },
  { name: "monthly-report.pdf", size: "4.8 MB", type: "document", uploaded: "1 hour ago" },
  { name: "product-demo.mp4", size: "245 MB", type: "video", uploaded: "2 hours ago" },
  { name: "config-backup.zip", size: "12 MB", type: "archive", uploaded: "3 hours ago" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return <Image className="w-5 h-5 text-info" />;
    case "video":
      return <Video className="w-5 h-5 text-primary" />;
    case "document":
    case "json":
      return <FileText className="w-5 h-5 text-warning" />;
    default:
      return <Folder className="w-5 h-5 text-muted-foreground" />;
  }
};

const Storage = () => {
  const totalStorage = buckets.reduce((acc, b) => acc + b.total, 0);
  const usedStorage = buckets.reduce((acc, b) => acc + b.used, 0);
  const totalFiles = buckets.reduce((acc, b) => acc + b.files, 0);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Storage</h1>
            <p className="text-muted-foreground">Manage your file storage and buckets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Bucket
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Storage</p>
                  <p className="text-2xl font-bold text-foreground">{(usedStorage / 1000).toFixed(1)} TB</p>
                </div>
                <HardDrive className="w-8 h-8 text-primary" />
              </div>
              <Progress value={(usedStorage / totalStorage) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">of {(totalStorage / 1000).toFixed(1)} TB allocated</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold text-foreground">{(totalFiles / 1000).toFixed(0)}K</p>
                </div>
                <FileText className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Buckets</p>
                  <p className="text-2xl font-bold text-foreground">{buckets.length}</p>
                </div>
                <Folder className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bandwidth Today</p>
                  <p className="text-2xl font-bold text-foreground">245 GB</p>
                </div>
                <Download className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search files and buckets..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buckets */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Storage Buckets</CardTitle>
                <CardDescription>Manage your storage buckets and regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {buckets.map((bucket) => {
                    const usagePercent = (bucket.used / bucket.total) * 100;
                    return (
                      <div
                        key={bucket.id}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Folder className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-foreground">{bucket.name}</h3>
                                <Badge variant="outline">{bucket.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {bucket.region} • {bucket.files.toLocaleString()} files
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Contents</DropdownMenuItem>
                              <DropdownMenuItem>Bucket Settings</DropdownMenuItem>
                              <DropdownMenuItem>Access Policies</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete Bucket</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                          <Progress value={usagePercent} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{bucket.used} GB used</span>
                            <span>{bucket.total} GB total</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Files */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Latest uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{file.uploaded}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Storage;
