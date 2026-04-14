import { useAuditLogs } from "../hooks/useAuditLogs";
import { PageState } from "../components/shared/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  RefreshCcw, 
  User, 
  Activity,
  Database,
  Clock,
  ArrowLeft
} from "lucide-react";
import { cn } from "../lib/utils";

const MetadataDisplay = ({ metadata }: { metadata: any }) => {
  if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {Object.entries(metadata).map(([key, value]) => (
        <span 
          key={key} 
          className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 font-mono inline-flex items-center gap-1"
        >
          <span className="font-semibold text-gray-400">{key}:</span> 
          <span className="truncate max-w-[150px]">{String(value)}</span>
        </span>
      ))}
    </div>
  );
};

export default function Audit() {
  const { user } = useAuth();
  const { data: logs, isLoading, isError, error, refetch } = useAuditLogs();

  if (user?.role !== UserRole.ADMIN) {
    return (
      <PageState 
        title="Access Denied" 
        description="You do not have permission to view the audit logs. This area is restricted to administrators."
        icon="error"
        action={
          <Button asChild variant="outline">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        }
        className="h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Track all system activity and administrative actions within Cassatix.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> 
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[500px]">
        {isLoading ? (
          <PageState 
            title="Loading audit logs..." 
            icon="loading" 
            className="min-h-[500px]"
          />
        ) : isError ? (
          <PageState 
            title="Failed to load audit logs" 
            description={error instanceof Error ? error.message : "An unexpected error occurred."}
            icon="error"
            action={<Button variant="outline" onClick={() => refetch()}>Try Again</Button>}
            className="min-h-[500px]"
          />
        ) : logs && logs.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Action & Entity</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Actor</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter bg-white border-gray-200 text-gray-700">
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-gray-400 text-xs">on</span>
                          <span className="flex items-center gap-1 text-xs font-medium text-gray-600">
                            <Database className="h-3 w-3" />
                            {log.entityType}
                          </span>
                          <code className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded">
                            {log.entityId.slice(0, 8)}
                          </code>
                        </div>
                        <MetadataDisplay metadata={log.metadataJson} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{log.actor.name || 'System'}</span>
                        <span className="text-[10px] text-gray-500">{log.actor.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-center gap-1.5 py-1 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {new Date(log.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-[10px]">
                          {new Date(log.createdAt).toLocaleTimeString(undefined, { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <PageState 
            title="No audit logs found"
            description="System activity and administrative actions will appear here once they occur."
            icon="empty"
            className="min-h-[500px]"
          />
        )}
      </div>
    </div>
  );
}
