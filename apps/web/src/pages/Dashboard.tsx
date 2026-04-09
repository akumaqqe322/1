import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Layers, History, ShieldCheck, Loader2 } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboard";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    { 
      title: "Total Templates", 
      value: stats?.templates.total ?? 0, 
      icon: Layers, 
      color: "text-blue-500",
      description: `${stats?.templates.active ?? 0} active`
    },
    { 
      title: "Generated Docs", 
      value: stats?.documents.total ?? 0, 
      icon: FileText, 
      color: "text-green-500",
      description: `${stats?.documents.completed ?? 0} completed`
    },
    { 
      title: "Pending Jobs", 
      value: (stats?.documents.queued ?? 0) + (stats?.documents.processing ?? 0), 
      icon: History, 
      color: "text-amber-500",
      description: "Queued or processing"
    },
    { 
      title: "Failed Docs", 
      value: stats?.documents.failed ?? 0, 
      icon: ShieldCheck, 
      color: "text-red-500",
      description: "Requires attention"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
