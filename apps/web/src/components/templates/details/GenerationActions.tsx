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
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';
import { 
  Loader2, 
  FileText, 
  CheckCircle2, 
  Download, 
  AlertCircle 
} from 'lucide-react';
import { TemplateVersion, TemplateVersionStatus, ValidationStatus, Template } from '../../../types/template';
import { UserRole } from '../../../types/auth';
import { DocumentStatus, OutputFormat } from '../../../types/document';
import { useGeneratePreview, useGenerateFinal } from '../../../hooks/useTemplate';
import { StatusBadge } from '../../../components/shared/StatusBadge';

interface GenerationActionProps {
  templateId: string;
  version: TemplateVersion;
  userRole?: UserRole;
  onSuccess: (docId: string) => void;
  activeDocId: string | null;
  activeDoc: any;
}

export function PreviewAction({ templateId, version, userRole, onSuccess, activeDocId, activeDoc }: GenerationActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.DOCX);
  const generatePreview = useGeneratePreview();

  const isThisVersionActive = activeDocId && activeDoc?.templateVersionId === version.id;

  const handleRequest = async () => {
    if (!caseId) return;
    try {
      const doc = await generatePreview.mutateAsync({
        templateId,
        versionId: version.id,
        caseId,
        outputFormat,
      });
      onSuccess(doc.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to request preview", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  const hasFile = !!version.storagePath;
  const isValid = version.validationStatus === ValidationStatus.VALID;
  const canPreview = isAuthorized && hasFile && isValid;

  if (isThisVersionActive && activeDoc) {
    return (
      <div className="flex flex-col items-end gap-1">
        <StatusBadge 
          status={activeDoc.status} 
          type="document" 
          showIcon 
          label="Preview"
          className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200"
        >
          {activeDoc.status === DocumentStatus.COMPLETED && activeDoc.storagePath && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" asChild title="Download Preview">
              <a href={`/api/documents/${activeDoc.id}/download`} target="_blank" rel="noreferrer">
                <Download className="h-3 w-3" />
              </a>
            </Button>
          )}
          {activeDoc.status === DocumentStatus.FAILED && activeDoc.errorMessage && (
            <AlertCircle className="h-3.5 w-3.5 text-red-400 cursor-help" title={activeDoc.errorMessage} />
          )}
        </StatusBadge>
        <div className="flex flex-col items-end text-[10px] text-gray-400">
          <span className="font-medium text-gray-500">Case: {activeDoc.caseId}</span>
          {activeDoc.completedAt && (
            <span>Generated: {new Date(activeDoc.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    );
  }

  if (userRole === UserRole.PARTNER) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs font-semibold"
          disabled={!canPreview}
          title={!hasFile ? "No file uploaded" : !isValid ? `Validation: ${version.validationStatus || 'Pending'}` : "Request Preview"}
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Preview</DialogTitle>
          <DialogDescription>
            Generate a preview document for v{version.versionNumber} using case data from Cassatix.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="caseId" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Case ID
            </Label>
            <Input
              id="caseId"
              placeholder="e.g. CASE-2024-001"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="bg-gray-50/50"
            />
            <p className="text-[10px] text-gray-400">
              Enter a valid Case ID to populate the template variables.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="previewFormat" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Output Format
            </Label>
            <Select 
              value={outputFormat} 
              onValueChange={(v) => setOutputFormat(v as OutputFormat)}
            >
              <SelectTrigger id="previewFormat" className="bg-gray-50/50">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OutputFormat.DOCX}>Word Document (.docx)</SelectItem>
                <SelectItem value={OutputFormat.PDF}>PDF Document (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={generatePreview.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequest} 
            disabled={!caseId || generatePreview.isPending}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {generatePreview.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              "Generate Preview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FinalActionProps extends GenerationActionProps {
  template: Template;
}

export function FinalAction({ templateId, template, version, userRole, onSuccess, activeDocId, activeDoc }: FinalActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.DOCX);
  const generateFinal = useGenerateFinal();

  const isThisVersionActive = activeDocId && activeDoc?.templateVersionId === version.id;

  const handleRequest = async () => {
    if (!caseId) return;
    try {
      const doc = await generateFinal.mutateAsync({
        templateId,
        versionId: version.id,
        caseId,
        outputFormat,
      });
      onSuccess(doc.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to request final generation", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  const isPublished = version.status === TemplateVersionStatus.PUBLISHED && template.publishedVersionId === version.id;
  const hasFile = !!version.storagePath;
  const isValid = version.validationStatus === ValidationStatus.VALID;
  const canGenerate = isAuthorized && isPublished && hasFile && isValid;

  if (isThisVersionActive && activeDoc) {
    return (
      <div className="flex flex-col items-end gap-1">
        <StatusBadge 
          status={activeDoc.status} 
          type="document" 
          showIcon 
          label="Final"
          className="px-2 py-1 bg-purple-50 rounded-md border border-purple-200"
        >
          {activeDoc.status === DocumentStatus.COMPLETED && activeDoc.storagePath && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-600" asChild title="Download Final Document">
              <a href={`/api/documents/${activeDoc.id}/download`} target="_blank" rel="noreferrer">
                <Download className="h-3 w-3" />
              </a>
            </Button>
          )}
          {activeDoc.status === DocumentStatus.FAILED && activeDoc.errorMessage && (
            <AlertCircle className="h-3.5 w-3.5 text-red-400 cursor-help" title={activeDoc.errorMessage} />
          )}
        </StatusBadge>
        <div className="flex flex-col items-end text-[10px] text-gray-400">
          <span className="font-medium text-gray-500">Case: {activeDoc.caseId}</span>
          {activeDoc.completedAt && (
            <span>Generated: {new Date(activeDoc.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    );
  }

  if (!isPublished || userRole === UserRole.PARTNER) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="h-8 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!canGenerate}
          title={!hasFile ? "No file uploaded" : !isValid ? `Validation: ${version.validationStatus || 'Pending'}` : "Request Final Generation"}
        >
          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
          Final
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Final Generation</DialogTitle>
          <DialogDescription>
            Generate the final document for v{version.versionNumber}. This action is logged and intended for production use.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="caseId" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Case ID
            </Label>
            <Input
              id="caseId"
              placeholder="e.g. CASE-2024-001"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="bg-gray-50/50"
            />
            <p className="text-[10px] text-gray-400">
              Enter the official Case ID from Cassatix.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="finalFormat" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Output Format
            </Label>
            <Select 
              value={outputFormat} 
              onValueChange={(v) => setOutputFormat(v as OutputFormat)}
            >
              <SelectTrigger id="finalFormat" className="bg-gray-50/50">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OutputFormat.DOCX}>Word Document (.docx)</SelectItem>
                <SelectItem value={OutputFormat.PDF}>PDF Document (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={generateFinal.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequest} 
            disabled={!caseId || generateFinal.isPending}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {generateFinal.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Final Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
