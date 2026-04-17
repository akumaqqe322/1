import React from "react";
import { Link } from "react-router-dom";
import { useCases } from "../hooks/useCases";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Briefcase, ChevronRight, User, Calendar, ExternalLink } from "lucide-react";
import { PageState } from "../components/shared/StatusBadge";

export default function CaseList() {
  const { data: cases, isLoading, isError } = useCases();

  if (isLoading) {
    return <PageState title="Loading cases..." icon="loading" />;
  }

  if (isError || !cases) {
    return <PageState title="Error loading cases" description="Please try again later." icon="error" />;
  }

  if (cases.length === 0) {
    return (
      <PageState 
        title="No cases found" 
        description="Cases are synchronized from the central system."
        icon="empty"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Active Cases</h1>
          <p className="text-gray-500 mt-1">Select a case to manage documents and generation.</p>
        </div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[150px] text-xs font-semibold uppercase tracking-wider">Case Number</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Client</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Opened</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id} className="group cursor-pointer" asChild>
                  <Link to={`/cases/${caseItem.id}`}>
                    <TableCell className="font-mono font-bold text-gray-900">
                      {caseItem.caseNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium text-gray-700">{caseItem.clientFullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-gray-500">{caseItem.caseType}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-bold">{caseItem.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-sm">{new Date(caseItem.issueDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="group-hover:bg-gray-100">
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </Link>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
