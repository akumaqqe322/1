import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { CaseData } from '@app/shared';
import { GeneratedDocument } from '../types/document';

export const useCases = () => {
  return useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const { data } = await api.get<CaseData[]>('/cases');
      return data;
    },
  });
};

export const useCase = (id: string | undefined) => {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: async () => {
      if (!id) throw new Error('Case ID is required');
      const { data } = await api.get<CaseData>(`/cases/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCaseDocuments = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ['cases', caseId, 'documents'],
    queryFn: async () => {
      if (!caseId) throw new Error('Case ID is required');
      const { data } = await api.get<GeneratedDocument[]>(`/cases/${caseId}/documents`);
      return data;
    },
    enabled: !!caseId,
    refetchInterval: (query) => {
      const docs = query.state.data;
      const hasRunning = docs?.some(d => d.status === 'QUEUED' || d.status === 'PROCESSING');
      return hasRunning ? 3000 : false;
    }
  });
};

export const useCaseContext = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ['cases', caseId, 'context'],
    queryFn: async () => {
      if (!caseId) throw new Error('Case ID is required');
      const { data } = await api.get<any>(`/cases/${caseId}/context`);
      return data;
    },
    enabled: !!caseId,
  });
};
