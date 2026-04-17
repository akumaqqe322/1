/**
 * Shared types and constants for the legal document constructor system.
 */

export interface User {
  id: string;
  email: string;
  name?: string;
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface DocumentMetadata {
  id: string;
  title: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CaseData {
  id: string;
  clientId: string;
  clientFullName: string;
  clientShortName: string;
  organization?: string;
  caseNumber: string;
  caseType: string;
  status: string;
  amount?: number;
  currency?: string;
  issueDate: string;
  dueDate?: string;
  courtName?: string;
  filingDate?: string;
  contractNumber?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface GenerationContext {
  case: {
    id: string;
    number: string;
    type: string;
    status: string;
    amount?: number;
    currency?: string;
    issueDate: string;
    dueDate?: string;
    contractNumber?: string;
  };
  client: {
    id: string;
    name: string;
    shortName: string;
    organization?: string;
  };
  variables: Record<string, any>; // Flattened variables for template injection
}

export const QUEUE_NAME = 'document-generation';
export const TEMPLATE_VALIDATION_QUEUE = 'template-validation';

/**
 * Resolves Redis connection configuration based on environment variables.
 * Priority: REDIS_URL > (REDIS_HOST + REDIS_PORT + REDIS_USER + REDIS_PASSWORD) > localhost
 */
export function getRedisConnection(): any {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || '6379', 10),
        username: url.username || undefined,
        password: url.password || undefined,
      };
    } catch (e) {
      // Fallback if URL parsing fails
    }
  }

  const host = process.env.REDIS_HOST || process.env.REDISHOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || process.env.REDISPORT || '6379', 10);
  const username = process.env.REDIS_USER || process.env.REDISUSER || undefined;
  const password = process.env.REDIS_PASSWORD || process.env.REDISPASSWORD || undefined;

  return {
    host,
    port,
    username,
    password,
  };
}
