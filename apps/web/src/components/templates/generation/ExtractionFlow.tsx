import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ManualForm } from './ManualForm';
import { GoogleGenAI, Type } from "@google/genai";

interface ExtractionFlowProps {
  onDataExtracted: (data: Record<string, any>) => void;
  extractedData: Record<string, any>;
  setExtractedData: (data: Record<string, any>) => void;
}

export function ExtractionFlow({ onDataExtracted, extractedData, setExtractedData }: ExtractionFlowProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await extractData(base64, file.type);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("Failed to read file.");
      setIsExtracting(false);
    }
  };

  const extractData = async (base64: string, mimeType: string) => {
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
       const response = await ai.models.generateContent({
         model: "gemini-3-flash-preview",
         contents: [
            {
              inlineData: {
                data: base64,
                mimeType: mimeType === 'application/pdf' ? 'application/pdf' : 'image/jpeg'
              }
            },
            {
              text: "Extract key legal and business details from this document. If a field is not found, leave it blank."
            }
         ],
         config: {
           responseMimeType: "application/json",
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               clientName: { type: Type.STRING, description: "Full legal name of the client or party" },
               caseNumber: { type: Type.STRING, description: "Matter or case reference number" },
               caseType: { type: Type.STRING, description: "Type of matter (e.g. Litigation, M&A)" },
               courtName: { type: Type.STRING, description: "Jurisdiction or court name" },
               registryRef: { type: Type.STRING, description: "Official registry reference" },
               amountFormatted: { type: Type.STRING, description: "Financial value with currency" },
               contractId: { type: Type.STRING, description: "Number of the associated contract" },
               openingDate: { type: Type.STRING, description: "Date the document was issued or opened" },
             }
           }
         }
       });

       const result = JSON.parse(response.text);
       setExtractedData(result);
       setIsExtracting(false);
    } catch (err) {
      console.error(err);
      setError("AI extraction failed. Please try again or enter data manually.");
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!extractedData && !isExtracting && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-10 bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="p-3 bg-white rounded-full shadow-sm mb-4">
            <FileUp className="h-8 w-8 text-purple-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">Upload Source Document</h4>
          <p className="text-xs text-gray-400 mb-4 text-center max-w-[250px]">
            We'll use AI to extract fields from your PDF or image to save you time.
          </p>
          <input 
            type="file" 
            id="extraction-upload" 
            className="hidden" 
            accept="application/pdf,image/*"
            onChange={handleFileUpload}
          />
          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <Button asChild variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <label htmlFor="extraction-upload" className="cursor-pointer">
                Select Document
              </label>
            </Button>
            
            {(error || fileName) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-blue-600 hover:text-blue-700"
                onClick={() => setExtractedData({})}
              >
                Skip to Manual Entry
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 flex flex-col items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 w-full">
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <AlertCircle className="h-3 w-3" />
                Extraction Error
              </div>
              <p className="text-[10px] text-center leading-tight">{error}</p>
            </div>
          )}
        </div>
      )}

      {isExtracting && (
        <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 italic">Analyzing {fileName}...</h4>
            <p className="text-[10px] text-gray-500 mt-1">Our AI is extracting relevant legal context. Please wait.</p>
          </div>
        </div>
      )}

      {extractedData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-green-700 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Extraction Complete
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-green-600 hover:text-green-700 p-0" onClick={() => setExtractedData(undefined)}>
              Clear & Restart
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Review & Correct Extraction</Label>
            <ManualForm data={extractedData} onChange={setExtractedData} />
          </div>
        </div>
      )}
    </div>
  );
}
