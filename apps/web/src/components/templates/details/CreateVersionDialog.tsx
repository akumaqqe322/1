import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../../types/auth';
import { useCreateTemplateVersion, useTemplateVersions } from '../../../hooks/useTemplate';
import { SchemaEditor } from '../SchemaEditor';

interface CreateVersionDialogProps {
  templateId: string;
  userRole?: UserRole;
}

export function CreateVersionDialog({ templateId, userRole }: CreateVersionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [changelog, setChangelog] = useState("");
  const [variablesSchema, setVariablesSchema] = useState('{\n  "type": "object",\n  "properties": {}\n}');
  const [conditionsSchema, setConditionsSchema] = useState('{\n  "type": "object",\n  "properties": {}\n}');
  const [error, setError] = useState<string | null>(null);
  
  const createVersion = useCreateTemplateVersion();
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handleCreate = async () => {
    setError(null);
    
    let variablesJson = undefined;
    let conditionsJson = undefined;

    try {
      if (variablesSchema.trim()) {
        variablesJson = JSON.parse(variablesSchema);
      }
    } catch (e) {
      setError("Invalid JSON in Variables Schema");
      return;
    }

    try {
      if (conditionsSchema.trim()) {
        conditionsJson = JSON.parse(conditionsSchema);
      }
    } catch (e) {
      setError("Invalid JSON in Conditions Schema");
      return;
    }

    try {
      await createVersion.mutateAsync({
        templateId,
        changelog,
        variablesSchemaJson: variablesJson,
        conditionsSchemaJson: conditionsJson,
      });
      await refetchVersions();
      setIsOpen(false);
      setChangelog("");
      setVariablesSchema('{\n  "type": "object",\n  "properties": {}\n}');
      setConditionsSchema('{\n  "type": "object",\n  "properties": {}\n}');
    } catch (error) {
      console.error("Failed to create version", error);
      setError("Failed to create version. Please check your inputs.");
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  if (!isAuthorized) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Create Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            Define a new version for this template. You can upload the file after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="changelog" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Changelog
            </Label>
            <Textarea
              id="changelog"
              placeholder="Describe what changed in this version..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="bg-gray-50/50 min-h-[80px]"
            />
          </div>
          
          <Separator />

          <SchemaEditor 
            title="Variables Schema" 
            value={variablesSchema} 
            onChange={setVariablesSchema}
            placeholder='{ "type": "object", "properties": { ... } }'
          />

          <Separator />

          <SchemaEditor 
            title="Conditions Schema" 
            value={conditionsSchema} 
            onChange={setConditionsSchema}
            placeholder='{ "type": "object", "properties": { ... } }'
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
        <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={createVersion.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!changelog || createVersion.isPending}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {createVersion.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Version"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
