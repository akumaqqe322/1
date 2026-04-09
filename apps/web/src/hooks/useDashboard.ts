import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface DashboardStats {
  templates: {
    total: number;
    active: number;
    archived: number;
  };
  documents: {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/dashboard/stats");
      return data;
    },
  });
};
