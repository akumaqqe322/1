import React, { useState } from "react";
import { useCreateTemplate, CreateTemplateInput } from "../../hooks/useTemplates";
import { TemplateStatus } from "../../types/template";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, AlertCircle } from "lucide-react";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = ["CONTRACT", "NDA", "PLEADING", "CORPORATE"];
const CASE_TYPES = ["LITIGATION", "CORPORATE", "FAMILY", "REAL_ESTATE"];

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState<CreateTemplateInput>({
    name: "",
    code: "",
    category: "",
    caseType: "",
    status: TemplateStatus.ACTIVE,
  });

  const { mutate, isPending, error, reset } = useCreateTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          name: "",
          code: "",
          category: "",
          caseType: "",
          status: TemplateStatus.ACTIVE,
        });
        reset();
      },
    });
  };

  const handleChange = (key: keyof CreateTemplateInput, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 pb-4 bg-slate-50/50 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">Create New Template</DialogTitle>
              <DialogDescription className="text-slate-500">
                Define the metadata for your new document template. You can upload the DOCX file in the next step.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-5 bg-white">
            {error && (
              <div className="flex items-center gap-3 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-medium">{error instanceof Error ? error.message : "Failed to create template"}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g. Standard Service Agreement"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-slate-500">Template Code</Label>
              <Input
                id="code"
                placeholder="e.g. SSA-2024"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-mono text-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleChange("category", v)}
                  required
                >
                  <SelectTrigger id="category" className="h-10 border-slate-200 bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="caseType" className="text-xs font-bold uppercase tracking-wider text-slate-500">Case Type</Label>
                <Select
                  value={formData.caseType}
                  onValueChange={(v) => handleChange("caseType", v)}
                  required
                >
                  <SelectTrigger id="caseType" className="h-10 border-slate-200 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl">
                    {CASE_TYPES.map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {ct.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange("status", v as TemplateStatus)}
                required
              >
                <SelectTrigger id="status" className="h-10 border-slate-200 bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl">
                  <SelectItem value={TemplateStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={TemplateStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-t">
            <DialogFooter className="gap-3 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 px-8"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Template
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
