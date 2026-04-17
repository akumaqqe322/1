import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from "@google/genai";
import { Env } from '../config/env.schema';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

@Injectable()
export class ExtractionService {
  private ai: GoogleGenAI | null = null;

  constructor(private configService: ConfigService<Env>) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI(apiKey);
    }
  }

  async extractFromText(text: string) {
    if (!this.ai) {
      throw new DomainException(
        'AI Extraction service is not configured. GEMINI_API_KEY is missing.',
        ErrorCode.EXTRACTION_FAILURE,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const result = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ text: `Extract key legal and business details from the following document text. If a field is not found or unclear, leave it blank.\n\nDocument Text:\n${text}` }],
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
      
      try {
        return JSON.parse(result.text);
      } catch (parseError) {
        throw new DomainException(
          'AI returned malformed data that could not be parsed.',
          ErrorCode.EXTRACTION_FAILURE,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { rawResponse: result.text }
        );
      }
    } catch (error) {
      if (error instanceof DomainException) throw error;
      
      throw new DomainException(
        `AI extraction failed: ${error.message}`,
        ErrorCode.EXTRACTION_FAILURE,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }
}
