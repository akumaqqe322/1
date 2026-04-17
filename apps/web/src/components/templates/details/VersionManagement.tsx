import React from 'react';
import { Template, TemplateVersion, TemplateVersionStatus } from '../../../types/template';
import { UserRole } from '../../../types/auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  CheckCircle2, 
  FileEdit, 
  History, 
  Plus, 
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  Download
} from 'lucide-react';
import { StatusBadge, PageState } from '../../shared/StatusBadge';
import { UploadAction } from './UploadAction';
import { PublishAction, ArchiveAction } from './LifecycleActions';
import { PreviewAction, FinalAction } from './GenerationActions';
import { VersionDetailsDialog } from './VersionDetailsDialog';
import { CreateVersionDialog } from './CreateVersionDialog';
import { cn } from '../../../lib/utils';

interface VersionManagementProps {
  template: Template;
  versions: TemplateVersion[];
  isLoading: boolean;
  userRole?: UserRole;
}

export function VersionManagement({
  template,
  versions,
  isLoading,
  userRole,
}: VersionManagementProps) {
  if (isLoading) {
    return <PageState title="Loading versions..." icon="loading" className="p-12" />;
  }

  const liveVersion = versions.find(v => v.status === TemplateVersionStatus.PUBLISHED);
  const draftVersion = versions.find(v => v.status === TemplateVersionStatus.DRAFT);
  const archivedVersions = versions
    .filter(v => v.status === TemplateVersionStatus.ARCHIVED)
    .sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="space-y-8">
      {/* 1. LIVE VERSION SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Environment
          </h3>
          {liveVersion && (
            <Badge className="bg-green-100 text-green-700 border-green-200">v{liveVersion.versionNumber}</Badge>
          )}
        </div>
        
        {liveVersion ? (
          <Card className="border-green-200 bg-green-50/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <CheckCircle2 className="h-24 w-24 text-green-900" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-green-900 flex items-center gap-2">
                    Production Version
                  </CardTitle>
                  <CardDescription className="text-green-700/70">
                    This version is currently used for all LIVE document generation in Cases.
                  </CardDescription>
                </div>
                <StatusBadge status={liveVersion.status} type="version" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900">{liveVersion.fileName || 'template.docx'}</p>
                    <p className="text-[10px] text-green-600">Updated {new Date(liveVersion.publishedAt || liveVersion.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Separator orientation="vertical" className="h-10 bg-green-200" />
                
                <div className="flex items-center gap-2">
                  <PreviewAction templateId={template.id} version={liveVersion} userRole={userRole} />
                  <FinalAction templateId={template.id} template={template} version={liveVersion} userRole={userRole} />
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                   <VersionDetailsDialog version={liveVersion} />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">No version is currently LIVE</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[300px]">
                You must publish a validated draft to enable production document generation.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 2. WORKING DRAFT SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            Working Draft
          </h3>
          {!draftVersion && (
            <CreateVersionDialog templateId={template.id} userRole={userRole} />
          )}
        </div>

        {draftVersion ? (
          <Card className="border-blue-200 bg-white shadow-sm ring-1 ring-blue-50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-blue-900">v{draftVersion.versionNumber}: Developmental Draft</CardTitle>
                  <CardDescription>
                    Currently being edited. Use this version for internal testing and validation.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={draftVersion.status} type="version" />
                  {draftVersion.validationStatus && (
                    <StatusBadge status={draftVersion.validationStatus} type="validation" showIcon />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      draftVersion.fileName ? "bg-blue-100" : "bg-amber-100"
                    )}>
                      <FileText className={cn(
                        "h-5 w-5",
                        draftVersion.fileName ? "text-blue-600" : "text-amber-600"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">{draftVersion.fileName || 'Awaiting file upload...'}</p>
                      <p className="text-[10px] text-blue-600 italic">{draftVersion.changelog || 'No recent changes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UploadAction templateId={template.id} version={draftVersion} userRole={userRole} />
                    {draftVersion.fileName && (
                       <>
                        <Separator orientation="vertical" className="h-8 mx-2" />
                        <PreviewAction templateId={template.id} version={draftVersion} userRole={userRole} />
                       </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last saved {new Date(draftVersion.createdAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <VersionDetailsDialog version={draftVersion} />
                    <PublishAction 
                      templateId={template.id} 
                      version={draftVersion} 
                      userRole={userRole} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="p-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center bg-gray-50/30">
            <Plus className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No active draft</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Create a new version to start making improvements to this template.</p>
            <CreateVersionDialog templateId={template.id} userRole={userRole} />
          </div>
        )}
      </section>

      {/* 3. VERSION HISTORY / ARCHIVE */}
      <section className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <History className="h-4 w-4" />
          Version History & Archives
        </h3>
        
        {archivedVersions.length > 0 ? (
          <Card className="border shadow-none bg-gray-50/30 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {archivedVersions.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-mono font-bold text-xs text-gray-500">
                      v{v.versionNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{v.fileName || 'Untitled Version'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <StatusBadge status={v.status} type="version" className="text-[8px] h-3.5" />
                        <span className="text-[10px] text-gray-400">Archived on {new Date(v.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100">
                     <VersionDetailsDialog version={v} />
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" disabled>
                        <Download className="h-3.5 w-3.5" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <p className="text-xs text-gray-400 italic pl-6">No historical records available.</p>
        )}
      </section>
    </div>
  );
}
