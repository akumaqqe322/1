import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCase, useCaseDocuments } from "../hooks/useCases";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft, 
  Briefcase, 
  Files, 
  User, 
  Calendar, 
  Info,
  ChevronRight,
  ExternalLink,
  Plus,
  Clock
} from "lucide-react";
import { PageState, StatusBadge } from "../components/shared/StatusBadge";
import { CaseDocumentsTab } from "../components/cases/CaseDocumentsTab";

export default function CaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: caseItem, isLoading, isError } = useCase(caseId);

  if (isLoading) {
    return <PageState title="Loading case details..." icon="loading" />;
  }

  if (isError || !caseItem) {
    return <PageState title="Case not found" icon="error" />;
  }

  return (
    <div className="space-y-6">
      <Link 
        to="/cases" 
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cases
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{caseItem.clientFullName}</h1>
            <Badge variant="outline" className="font-mono">{caseItem.caseNumber}</Badge>
            <Badge className="bg-blue-600 font-bold">{caseItem.status}</Badge>
          </div>
          <p className="text-gray-500">{caseItem.caseType}</p>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 border">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Files className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Case Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-0">
          <CaseDocumentsTab caseId={caseItem.id} />
        </TabsContent>

        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Case Description</CardTitle>
                <CardDescription>Details retrieved from the central matter management system.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {caseItem.description}
                </p>
                
                <Separator className="my-6" />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Opened At</p>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      {new Date(caseItem.issueDate).toLocaleDateString()}
                    </div>
                  </div>
                  {caseItem.dueDate && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deadline</p>
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Clock className="h-4 w-4 text-amber-500" />
                        {new Date(caseItem.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {caseItem.amount && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Estimated Value</p>
                      <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                        <span className="text-gray-400 mr-1">{caseItem.currency}</span>
                        {caseItem.amount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Matter ID</p>
                    <div className="flex items-center gap-2 text-gray-900 font-mono text-sm font-medium">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      {caseItem.id}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {caseItem.clientShortName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{caseItem.clientFullName}</p>
                    <p className="text-xs text-gray-500">{caseItem.organization || 'Individual Client'}</p>
                  </div>
                </div>
                <Separator />
                <Button variant="outline" className="w-full justify-between" disabled>
                  Matter Profile
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
