import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Eye } from 'lucide-react';
import { TemplateVersion } from '../../../types/template';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SchemaViewer } from '../SchemaViewer';

interface VersionDetailsDialogProps {
  version: TemplateVersion;
}

export function VersionDetailsDialog({ version }: VersionDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" title="View Logic & Details">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono">v{version.versionNumber}</Badge>
            <StatusBadge status={version.status} type="version" />
          </div>
          <DialogTitle>Version Details</DialogTitle>
          <DialogDescription>
            Logic definition and metadata for this template version.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Changelog</h4>
            <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 italic">
              {version.changelog || "No changelog provided"}
            </div>
          </div>

          <Separator />

          <SchemaViewer 
            title="Variables" 
            schema={version.variablesSchemaJson} 
            emptyMessage="No variables defined for this version."
          />

          <Separator />

          <SchemaViewer 
            title="Conditions" 
            schema={version.conditionsSchemaJson} 
            emptyMessage="No conditions defined for this version."
          />

          <div className="pt-4 grid grid-cols-2 gap-4 text-[10px] text-gray-400">
            <div className="flex flex-col gap-1">
              <span className="font-semibold uppercase tracking-wider">Created At</span>
              <span>{new Date(version.createdAt).toLocaleString()}</span>
            </div>
            {version.publishedAt && (
              <div className="flex flex-col gap-1">
                <span className="font-semibold uppercase tracking-wider">Published At</span>
                <span>{new Date(version.publishedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
