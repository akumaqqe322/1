import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AuditLog } from '../types/audit';

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data } = await api.get<AuditLog[]>('/audit');
      return data;
    },
  });
};
