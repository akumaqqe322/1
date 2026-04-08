export enum TemplateStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Template {
  id: string;
  name: string;
  code: string;
  category: string;
  caseType: string;
  status: TemplateStatus;
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilters {
  status?: TemplateStatus;
  category?: string;
  caseType?: string;
  search?: string;
}
