"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type Requirements = {
  vision: string;
  squareFootage: string;
  lotSize: string;
  rooms: string;
  budget: string;
  architecturalStyle: string;
  lifestyleNeeds: string;
  specialRequirements: string;
  materialPreferences: string;
  aestheticPreferences: string;
  inspirationImage: string;
  architecturalPrompt: string;
  floorPlanImage: string;
};

interface SummaryPanelProps {
  requirements: Partial<Requirements>;
}

const formatTitle = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

export default function SummaryPanel({ requirements }: SummaryPanelProps) {
    const requirementEntries = Object.entries(requirements).filter(([key]) => !['inspirationImage', 'architecturalPrompt', 'floorPlanImage'].includes(key));

  return (
    <Card className="flex-1 overflow-hidden shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Your Dream Home</CardTitle>
        <CardDescription>A summary of your preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 h-[calc(100%-120px)] overflow-y-auto pr-2">
        <ul className="space-y-3 text-sm">
          {requirementEntries.length > 0 ? (
            requirementEntries.map(([key, value]) => value && (
              <li key={key}>
                <p className="font-semibold text-muted-foreground">{formatTitle(key)}</p>
                <p className="text-foreground">{String(value)}</p>
              </li>
            ))
          ) : (
            <p className="text-muted-foreground">Your requirements will appear here as you answer questions.</p>
          )}
        </ul>
        {requirements.inspirationImage && (
            <div>
                <p className="font-semibold text-muted-foreground mb-2">Inspiration</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                     <Image src={requirements.inspirationImage} alt="Inspiration" layout="fill" objectFit="cover" />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
