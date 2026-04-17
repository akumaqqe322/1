import React, { useState } from 'react';
import { useCaseDocuments } from '../../hooks/useCases';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Plus, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ExternalLink,
  History,
  Files
} from 'lucide-react';
import { StatusBadge, PageState } from '../shared/StatusBadge';
import { DocumentStatus } from '../../types/document';
import { api } from '../../lib/api';
import { GenerateDocumentDialog } from './GenerateDocumentDialog';
import { Badge } from '../ui/badge';

interface CaseDocumentsTabProps {
  caseId: string;
}

export function CaseDocumentsTab({ caseId }: CaseDocumentsTabProps) {
  const { data: documents, isLoading } = useCaseDocuments(caseId);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const { data } = await api.get<{ url: string }>(`/documents/${docId}/download`);
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  if (isLoading) {
    return (
      <PageState 
        title="Loading documents..." 
        icon="loading" 
        className="p-12 border rounded-lg bg-gray-50/50"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Case Documents</h2>
          <p className="text-sm text-gray-500">View and generate documents for this case.</p>
        </div>
        <Button onClick={() => setIsGenerateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Generate New
        </Button>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        {documents && documents.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Document</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Template Version</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{doc.template.name}</span>
                        <span className="text-xs text-gray-400 font-mono italic">{doc.generationType}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {doc.template.code} v??
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type="document" showIcon />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={doc.status !== DocumentStatus.COMPLETED}
                      onClick={() => handleDownload(doc.id, `${doc.template.name}.docx`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <Files className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              Start by generating a new document from one of the available legal templates.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => setIsGenerateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate First Document
            </Button>
          </div>
        )}
      </Card>

      <GenerateDocumentDialog 
        caseId={caseId} 
        isOpen={isGenerateOpen} 
        onClose={() => setIsGenerateOpen(false)} 
      />
    </div>
  );
}
