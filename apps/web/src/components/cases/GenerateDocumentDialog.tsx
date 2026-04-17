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
import { FileText, Loader2, Sparkles, Send, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { GenerationMode, ModeSelector } from '../templates/generation/ModeSelector';
import { CaseSelector } from '../templates/generation/CaseSelector';
import { ManualForm } from '../templates/generation/ManualForm';
import { ExtractionFlow } from '../templates/generation/ExtractionFlow';
import { CaseData } from '@app/shared';

import { GenerationStatusStep } from '../templates/generation/GenerationStatusStep';

interface GenerateDocumentDialogProps {
  caseId?: string; // Optional because we might select it in the dialog
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'MODE' | 'Sourcing' | 'TEMPLATE' | 'GENERATION';

export function GenerateDocumentDialog({ caseId: initialCaseId, isOpen, onClose }: GenerateDocumentDialogProps) {
  const [step, setStep] = useState<Step>('MODE');
  const [mode, setMode] = useState<GenerationMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.DOCX);
  const [generationType, setGenerationType] = useState<'PREVIEW' | 'FINAL'>('FINAL');
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  
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
    setError(null);

    const generationPayload = {
      templateId: selectedTemplate.id,
      outputFormat,
      caseId: mode === GenerationMode.CASE ? selectedCase?.id : undefined,
      customVariables: mode === GenerationMode.MANUAL ? manualData : (mode === GenerationMode.EXTRACTION ? extractedData : undefined)
    };

    try {
      let result;
      if (generationType === 'FINAL') {
        if (!selectedTemplate.publishedVersionId) {
           setError("This template has no published version for live generation.");
           return;
        }
        result = await generateFinal.mutateAsync({
          ...generationPayload,
          versionId: selectedTemplate.publishedVersionId,
        });
      } else {
        const latestValidVersion = selectedTemplate.versions
          ?.filter(v => v.validationStatus === ValidationStatus.VALID)
          .sort((a, b) => b.versionNumber - a.versionNumber)[0];
        
        if (!latestValidVersion) {
          setError("No validated version found to preview. Please upload and validate a version first.");
          return;
        }
        
        result = await generatePreview.mutateAsync({
          ...generationPayload,
          versionId: latestValidVersion.id,
        });
      }
      
      setGeneratedDocId(result.id);
      setStep('GENERATION');
    } catch (err: any) {
      console.error('Generation request failed:', err);
      // Backend structured error handling - DomainException check
      const apiError = err.response?.data?.message || err.message;
      const errorCode = err.response?.data?.code;

      if (errorCode === 'INCOMPLETE_CASE_DATA') {
        setError("The selected case is missing required legal fields. You can switch to Manual mode to fill them in.");
      } else {
        setError(apiError);
      }
    }
  };

  const handleReset = () => {
    setStep('MODE');
    setMode(null);
    setGeneratedDocId(null);
    setError(null);
  };

  const isLoading = generatePreview.isPending || generateFinal.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {step === 'MODE' && "Select Data Source"}
            {step === 'Sourcing' && (mode === GenerationMode.CASE ? "Select Case" : mode === GenerationMode.EXTRACTION ? "Document Extraction" : "Input Manual Data")}
            {step === 'TEMPLATE' && "Select Template & Options"}
            {step === 'GENERATION' && "Generating Document"}
          </DialogTitle>
          <DialogDescription>
            {step === 'MODE' && "How would you like to provide data for the document?"}
            {step === 'Sourcing' && "Provide the specific information needed for generation."}
            {step === 'TEMPLATE' && "Choose which document template to use with your data."}
            {step === 'GENERATION' && "Please wait while we assemble your document."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 min-h-[350px]">
          {error && step !== 'GENERATION' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-xs animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Generation Error</p>
                <p>{error}</p>
                {error.includes("switch to Manual mode") && (
                   <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-red-800 font-bold decoration-red-800"
                    onClick={() => {
                        setMode(GenerationMode.MANUAL);
                        setStep('Sourcing');
                        setError(null);
                    }}
                   >
                     Switch to Manual Entry
                   </Button>
                )}
              </div>
            </div>
          )}

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
                {selectedTemplate && generationType === 'FINAL' && !selectedTemplate.publishedVersionId && (
                  <p className="text-[10px] text-red-500 font-medium">This template has no active version published for production use.</p>
                )}
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

          {step === 'GENERATION' && generatedDocId && (
            <GenerationStatusStep 
              documentId={generatedDocId} 
              onRetry={() => {
                setGeneratedDocId(null);
                setStep('TEMPLATE');
              }}
              onClose={onClose}
            />
          )}
        </div>

        {step !== 'GENERATION' && (
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
                    Initializing...
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
        )}
      </DialogContent>
    </Dialog>
  );
}
