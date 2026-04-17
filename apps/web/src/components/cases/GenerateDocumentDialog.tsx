import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTemplates } from '../../hooks/useTemplates';
import { useGeneratePreview, useGenerateFinal } from '../../hooks/useTemplate';
import { TemplateStatus, ValidationStatus } from '../../types/template';
import { OutputFormat } from '../../types/document';
import { FileText, Loader2, Sparkles, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { GenerationMode, ModeSelector } from '../templates/generation/ModeSelector';
import { CaseSelector } from '../templates/generation/CaseSelector';
import { ManualForm } from '../templates/generation/ManualForm';
import { ExtractionFlow } from '../templates/generation/ExtractionFlow';
import { CaseData } from '@app/shared';

interface GenerateDocumentDialogProps {
  caseId?: string; // Optional because we might select it in the dialog
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'MODE' | 'Sourcing' | 'TEMPLATE';

export function GenerateDocumentDialog({ caseId: initialCaseId, isOpen, onClose }: GenerateDocumentDialogProps) {
  const [step, setStep] = useState<Step>('MODE');
  const [mode, setMode] = useState<GenerationMode | null>(null);
  
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.DOCX);
  const [generationType, setGenerationType] = useState<'PREVIEW' | 'FINAL'>('FINAL');
  
  // Data state
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [manualData, setManualData] = useState<Record<string, any>>({});
  const [extractedData, setExtractedData] = useState<Record<string, any> | undefined>(undefined);

  const generatePreview = useGeneratePreview();
  const generateFinal = useGenerateFinal();

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);
  
  const handleModeSelect = (m: GenerationMode) => {
    setMode(m);
    setStep('Sourcing');
  };

  const handleBack = () => {
    if (step === 'TEMPLATE') setStep('Sourcing');
    else if (step === 'Sourcing') setStep('MODE');
  };

  const canContinueToTemplate = 
    (mode === GenerationMode.CASE && selectedCase) ||
    (mode === GenerationMode.EXTRACTION && extractedData) ||
    (mode === GenerationMode.MANUAL && Object.keys(manualData).length > 0);

  const canGenerate = selectedTemplate && (
    (generationType === 'FINAL' && selectedTemplate.publishedVersionId) ||
    (generationType === 'PREVIEW' && selectedTemplate.versions?.some(v => v.validationStatus === ValidationStatus.VALID))
  );

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    const generationPayload = {
      templateId: selectedTemplate.id,
      outputFormat,
      caseId: mode === GenerationMode.CASE ? selectedCase?.id : undefined,
      customVariables: mode === GenerationMode.MANUAL ? manualData : (mode === GenerationMode.EXTRACTION ? extractedData : undefined)
    };

    try {
      if (generationType === 'FINAL') {
        if (!selectedTemplate.publishedVersionId) return;
        await generateFinal.mutateAsync({
          ...generationPayload,
          versionId: selectedTemplate.publishedVersionId,
        });
      } else {
        const latestValidVersion = selectedTemplate.versions
          ?.filter(v => v.validationStatus === ValidationStatus.VALID)
          .sort((a, b) => b.versionNumber - a.versionNumber)[0];
        
        if (!latestValidVersion) return;
        
        await generatePreview.mutateAsync({
          ...generationPayload,
          versionId: latestValidVersion.id,
        });
      }
      onClose();
      // Reset state for next time
      setStep('MODE');
      setMode(null);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const isLoading = generatePreview.isPending || generateFinal.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {step === 'MODE' && "Select Data Source"}
            {step === 'Sourcing' && (mode === GenerationMode.CASE ? "Select Case" : mode === GenerationMode.EXTRACTION ? "Document Extraction" : "Input Manual Data")}
            {step === 'TEMPLATE' && "Select Template & Options"}
          </DialogTitle>
          <DialogDescription>
            {step === 'MODE' && "How would you like to provide data for the document?"}
            {step === 'Sourcing' && "Provide the specific information needed for generation."}
            {step === 'TEMPLATE' && "Choose which document template to use with your data."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-h-[350px]">
          {step === 'MODE' && (
            <ModeSelector selectedMode={mode} onSelect={handleModeSelect} />
          )}

          {step === 'Sourcing' && (
            <>
              {mode === GenerationMode.CASE && (
                <CaseSelector 
                  selectedCaseId={selectedCase?.id} 
                  onSelect={setSelectedCase} 
                />
              )}
              {mode === GenerationMode.MANUAL && (
                <ManualForm data={manualData} onChange={setManualData} />
              )}
              {mode === GenerationMode.EXTRACTION && (
                <ExtractionFlow 
                  extractedData={extractedData || {}} 
                  setExtractedData={setExtractedData} 
                  onDataExtracted={setExtractedData}
                />
              )}
            </>
          )}

          {step === 'TEMPLATE' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Select Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.filter(t => t.status === TemplateStatus.ACTIVE).map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t.name}</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">{t.code}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Generation Workflow</Label>
                <Tabs 
                  value={generationType} 
                  onValueChange={(v) => setGenerationType(v as 'PREVIEW' | 'FINAL')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="PREVIEW">Preview (Draft)</TabsTrigger>
                    <TabsTrigger value="FINAL">Final (Live)</TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="text-[10px] text-gray-500 mt-1 italic">
                  {generationType === 'PREVIEW' 
                    ? "Uses the latest valid draft version for internal review." 
                    : "Uses the officially published production version."}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OutputFormat.DOCX}>Word (.docx)</SelectItem>
                    <SelectItem value={OutputFormat.PDF}>PDF (.pdf)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center !justify-between gap-2 border-t pt-4">
          <div className="flex gap-2">
            {step !== 'MODE' && (
              <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-400">
              Cancel
            </Button>
          </div>

          {step === 'TEMPLATE' ? (
            <Button 
              onClick={handleGenerate} 
              disabled={!canGenerate || isLoading}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => setStep('TEMPLATE')}
              disabled={!canContinueToTemplate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue to Template
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
