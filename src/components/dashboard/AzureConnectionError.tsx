import { AlertTriangle, CheckCircle2, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AzureConnectionErrorProps {
  error: string;
  onRetry: () => void;
  loading: boolean;
}

const troubleshootingSteps = [
  {
    title: "Verify Azure App Registration",
    steps: [
      "Go to Azure Portal → Microsoft Entra ID → App registrations",
      "Select your app registration",
      "Verify the Application (client) ID matches AZURE_CLIENT_ID",
      "Verify the Directory (tenant) ID matches AZURE_TENANT_ID",
    ],
  },
  {
    title: "Check API Permissions",
    steps: [
      "In your app registration, go to 'API permissions'",
      "Ensure 'Azure Service Management' with 'user_impersonation' is added",
      "Ensure 'Log Analytics API' with 'Data.Read' is added",
      "Click 'Grant admin consent' if not already granted",
    ],
  },
  {
    title: "Verify Client Secret",
    steps: [
      "Go to 'Certificates & secrets' in your app registration",
      "Ensure your client secret hasn't expired",
      "If expired, create a new secret and update AZURE_CLIENT_SECRET",
    ],
  },
  {
    title: "Check Azure RBAC Roles",
    steps: [
      "Go to your Azure Subscription → Access control (IAM)",
      "Click 'Add role assignment'",
      "Assign 'Reader' role to your app's service principal",
      "Assign 'Monitoring Reader' role for metrics access",
      "Assign 'Log Analytics Reader' for log queries",
    ],
  },
];

export function AzureConnectionError({ error, onRetry, loading }: AzureConnectionErrorProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes("401") || errorMessage.includes("unauthorized") || errorMessage.includes("Unauthorized")) {
      return {
        type: "Authentication Error",
        description: "The Azure credentials are invalid or expired.",
        suggestedFix: "Check your AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID values.",
      };
    }
    if (errorMessage.includes("403") || errorMessage.includes("forbidden") || errorMessage.includes("Forbidden")) {
      return {
        type: "Authorization Error",
        description: "The app doesn't have permission to access Azure resources.",
        suggestedFix: "Ensure the app has proper RBAC roles assigned in Azure.",
      };
    }
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return {
        type: "Resource Not Found",
        description: "The requested Azure resource or subscription doesn't exist.",
        suggestedFix: "Verify the subscription ID and resource paths are correct.",
      };
    }
    if (errorMessage.includes("network") || errorMessage.includes("timeout") || errorMessage.includes("ECONNREFUSED")) {
      return {
        type: "Network Error",
        description: "Unable to connect to Azure APIs.",
        suggestedFix: "Check your network connection and try again.",
      };
    }
    return {
      type: "Connection Error",
      description: "Failed to connect to Azure Monitor.",
      suggestedFix: "Review the error details and check your Azure configuration.",
    };
  };

  const errorInfo = getErrorType(error);

  return (
    <div className="glass-card border-destructive/50 overflow-hidden">
      {/* Error Header */}
      <div className="bg-destructive/10 p-4 border-b border-destructive/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">{errorInfo.type}</h3>
            <p className="text-sm text-muted-foreground mt-1">{errorInfo.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      </div>

      {/* Error Details */}
      <div className="p-4 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Error message:</span>
          <code className="px-2 py-1 bg-background rounded text-xs text-destructive font-mono">
            {error}
          </code>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Suggested fix:</span>
          <span className="text-foreground">{errorInfo.suggestedFix}</span>
        </div>
      </div>

      {/* Troubleshooting Steps */}
      <div className="p-4">
        <h4 className="font-medium text-foreground mb-3">Troubleshooting Guide</h4>
        <div className="space-y-2">
          {troubleshootingSteps.map((section, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <span className="font-medium text-sm text-foreground">
                  {index + 1}. {section.title}
                </span>
                {expandedSection === index ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedSection === index && (
                <div className="p-3 bg-background">
                  <ul className="space-y-2">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* External Links */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="flex flex-wrap gap-3">
          <a
            href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Azure App Registrations
          </a>
          <a
            href="https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/rest-api-walkthrough"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Azure Monitor REST API Docs
          </a>
          <a
            href="https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Azure RBAC Roles Reference
          </a>
        </div>
      </div>
    </div>
  );
}
