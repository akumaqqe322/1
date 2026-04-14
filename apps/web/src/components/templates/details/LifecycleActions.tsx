import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Loader2, Rocket, Archive } from 'lucide-react';
import { TemplateVersion, TemplateVersionStatus, ValidationStatus } from '../../../types/template';
import { UserRole } from '../../../types/auth';
import { usePublishVersion, useArchiveVersion, useTemplate, useTemplateVersions } from '../../../hooks/useTemplate';

interface LifecycleActionProps {
  templateId: string;
  version: TemplateVersion;
  userRole?: UserRole;
}

export function PublishAction({ templateId, version, userRole }: LifecycleActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const publish = usePublishVersion();
  const { refetch: refetchTemplate } = useTemplate(templateId);
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handlePublish = async () => {
    try {
      await publish.mutateAsync({ templateId, versionId: version.id });
      await Promise.all([refetchTemplate(), refetchVersions()]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to publish version", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN;
  const isDraft = version.status === TemplateVersionStatus.DRAFT;
  const isValid = version.validationStatus === ValidationStatus.VALID;
  const canPublish = isAuthorized && isDraft && isValid;

  if (!isAuthorized || version.status === TemplateVersionStatus.PUBLISHED || version.status === TemplateVersionStatus.ARCHIVED) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50"
          disabled={!canPublish}
          title={!isValid ? "Version must be valid to publish" : "Publish Version"}
        >
          <Rocket className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish Version v{version.versionNumber}</DialogTitle>
          <DialogDescription>
            This will make this version the active template for all new document generations. 
            Any previously published version will be archived.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={publish.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={publish.isPending}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {publish.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Confirm Publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ArchiveAction({ templateId, version, userRole }: LifecycleActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const archive = useArchiveVersion();
  const { refetch: refetchTemplate } = useTemplate(templateId);
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handleArchive = async () => {
    try {
      await archive.mutateAsync({ templateId, versionId: version.id });
      await Promise.all([refetchTemplate(), refetchVersions()]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to archive version", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN;
  const isArchived = version.status === TemplateVersionStatus.ARCHIVED;
  const canArchive = isAuthorized && !isArchived;

  if (!isAuthorized || isArchived) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
          disabled={!canArchive}
          title="Archive Version"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Archive Version v{version.versionNumber}</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive this version? It will no longer be available for document generation or publishing.
            {version.status === TemplateVersionStatus.PUBLISHED && (
              <p className="mt-2 font-bold text-red-600">
                Warning: This is the currently published version. Archiving it will leave the template without a published version.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={archive.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleArchive} 
            disabled={archive.isPending}
            variant="destructive"
          >
            {archive.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving...
              </>
            ) : (
              "Confirm Archive"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
