import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Briefcase, FileSearch, Keyboard, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export enum GenerationMode {
  CASE = 'CASE',
  EXTRACTION = 'EXTRACTION',
  MANUAL = 'MANUAL'
}

interface ModeSelectorProps {
  selectedMode: GenerationMode | null;
  onSelect: (mode: GenerationMode) => void;
}

export function ModeSelector({ selectedMode, onSelect }: ModeSelectorProps) {
  const modes = [
    {
      id: GenerationMode.CASE,
      title: 'Existing Case',
      description: 'Use data from a case in the system.',
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: GenerationMode.EXTRACTION,
      title: 'Document AI',
      description: 'Upload a document to extract fields automatically.',
      icon: FileSearch,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      id: GenerationMode.MANUAL,
      title: 'Manual Entry',
      description: 'Type in all generation parameters manually.',
      icon: Keyboard,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid gap-3">
      {modes.map((mode) => (
        <Card 
          key={mode.id}
          className={cn(
            "cursor-pointer transition-all border-2",
            selectedMode === mode.id ? "border-blue-600 ring-2 ring-blue-50" : "hover:border-gray-200"
          )}
          onClick={() => onSelect(mode.id)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("p-2 rounded-lg", mode.bg)}>
              <mode.icon className={cn("h-6 w-6", mode.color)} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{mode.title}</h4>
              <p className="text-xs text-gray-500">{mode.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
