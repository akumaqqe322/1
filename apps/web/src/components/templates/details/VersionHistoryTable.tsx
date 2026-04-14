import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ExternalLink } from 'lucide-react';
import { Template, TemplateVersion } from '../../../types/template';
import { UserRole } from '../../../types/auth';
import { StatusBadge, PageState } from '../../../components/shared/StatusBadge';
import { cn } from '../../../lib/utils';
import { UploadAction } from './UploadAction';
import { PublishAction, ArchiveAction } from './LifecycleActions';
import { PreviewAction, FinalAction } from './GenerationActions';
import { VersionDetailsDialog } from './VersionDetailsDialog';

interface VersionHistoryTableProps {
  template: Template;
  versions: TemplateVersion[];
  isLoading: boolean;
  userRole?: UserRole;
  activeDocId: string | null;
  activeDoc: any;
  onDocSuccess: (docId: string) => void;
  activeFinalDocId: string | null;
  activeFinalDoc: any;
  onFinalDocSuccess: (docId: string) => void;
}

export function VersionHistoryTable({
  template,
  versions,
  isLoading,
  userRole,
  activeDocId,
  activeDoc,
  onDocSuccess,
  activeFinalDocId,
  activeFinalDoc,
  onFinalDocSuccess
}: VersionHistoryTableProps) {
  if (isLoading) {
    return (
      <PageState 
        title="Loading versions..." 
        icon="loading" 
        className="p-12"
      />
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <PageState 
        title="No version history" 
        description="Create a new version to start tracking changes."
        icon="empty"
        className="p-12"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider">Version</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider">File Name</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider">Validation</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider">Created</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider">Changelog</TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {versions.sort((a, b) => b.versionNumber - a.versionNumber).map((version) => {
          const isPublished = template.publishedVersionId === version.id;
          
          return (
            <TableRow 
              key={version.id} 
              className={cn(
                "group",
                isPublished && "bg-green-50/30 hover:bg-green-50/50"
              )}
            >
              <TableCell className="font-mono font-bold text-gray-900">
                <div className="flex items-center gap-2">
                  v{version.versionNumber}
                  {isPublished && (
                    <Badge className="bg-green-600 text-white border-none text-[8px] h-4 px-1">LIVE</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={version.status} type="version" />
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                {version.fileName || <span className="text-gray-400 italic">No file uploaded</span>}
              </TableCell>
              <TableCell>
                {version.validationStatus ? (
                  <StatusBadge status={version.validationStatus} type="validation" showIcon />
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-700">{new Date(version.createdAt).toLocaleDateString()}</span>
                  <span className="text-[10px] text-gray-400">{new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[250px]">
                <p className="text-xs text-gray-500 truncate italic">
                  {version.changelog || "No changelog provided"}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <UploadAction 
                    templateId={template.id} 
                    version={version} 
                    userRole={userRole}
                  />
                  <PublishAction 
                    templateId={template.id} 
                    version={version} 
                    userRole={userRole}
                  />
                  <ArchiveAction 
                    templateId={template.id} 
                    version={version} 
                    userRole={userRole}
                  />
                  <PreviewAction 
                    templateId={template.id} 
                    version={version} 
                    userRole={userRole}
                    onSuccess={onDocSuccess}
                    activeDocId={activeDocId}
                    activeDoc={activeDoc}
                  />
                  <FinalAction 
                    templateId={template.id} 
                    template={template}
                    version={version} 
                    userRole={userRole}
                    onSuccess={onFinalDocSuccess}
                    activeDocId={activeFinalDocId}
                    activeDoc={activeFinalDoc}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" title="View External Reference">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <VersionDetailsDialog version={version} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
