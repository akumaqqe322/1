import React, { useState } from 'react';
import { useCases } from '../../../hooks/useCases';
import { Input } from '../../ui/input';
import { Search, Loader2, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CaseData } from '@app/shared';

interface CaseSelectorProps {
  onSelect: (caseData: CaseData) => void;
  selectedCaseId?: string;
}

export function CaseSelector({ onSelect, selectedCaseId }: CaseSelectorProps) {
  const { data: cases, isLoading } = useCases();
  const [search, setSearch] = useState("");

  const filteredCases = cases?.filter(c => 
    c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.clientFullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search cases by number or client name..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="h-[250px] border rounded-md p-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : filteredCases?.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No cases found.</p>
        ) : (
          <div className="space-y-1">
            {filteredCases?.map((c) => (
              <div 
                key={c.id}
                className={cn(
                  "p-3 rounded-md cursor-pointer flex items-center justify-between transition-colors",
                  selectedCaseId === c.id ? "bg-blue-50 border-blue-100" : "hover:bg-gray-50"
                )}
                onClick={() => onSelect(c)}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{c.caseNumber}</p>
                  <p className="text-xs text-gray-500">{c.clientFullName}</p>
                </div>
                {selectedCaseId === c.id && <Check className="h-4 w-4 text-blue-600" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
