"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  onUpdateRequirements: (newRequirements: Partial<Requirements>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const formatTitle = (key: string) => {
  if (key === 'squareFootage') return 'Square Footage';
  if (key === 'lotSize') return 'Lot Size';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

export default function SummaryPanel({ requirements, onUpdateRequirements, isOpen, setIsOpen }: SummaryPanelProps) {
  const [editableRequirements, setEditableRequirements] = useState(requirements);

  useEffect(() => {
    setEditableRequirements(requirements);
  }, [requirements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableRequirements(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdateRequirements(editableRequirements);
    setIsOpen(false);
  };

  const requirementEntries = Object.entries(requirements).filter(([key]) => !['inspirationImage', 'architecturalPrompt', 'floorPlanImage', 'vision', 'interiorImage'].includes(key) && requirements[key as keyof typeof requirements]);

  const editableFields = Object.keys(requirements).filter(key => !['inspirationImage', 'architecturalPrompt', 'floorPlanImage', 'interiorImage'].includes(key)) as (keyof Omit<Requirements, 'interiorImage'>)[];


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="flex-1 overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Your Dream Home</CardTitle>
            <CardDescription>A summary of your preferences. Click to edit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 h-[calc(100%-120px)] overflow-y-auto pr-2">
            {requirements.vision && (
                <div>
                    <p className="font-semibold text-muted-foreground">Vision</p>
                    <p className="text-sm text-foreground italic">"{String(requirements.vision)}"</p>
                </div>
            )}
            <ul className="space-y-3 text-sm">
              {requirementEntries.length > 0 ? (
                requirementEntries.map(([key, value]) => value && (
                  <li key={key}>
                    <p className="font-semibold text-muted-foreground">{formatTitle(key)}</p>
                    <p className="text-foreground">{String(value)}</p>
                  </li>
                ))
              ) : (
                !requirements.vision && <p className="text-muted-foreground">Your requirements will appear here as you answer questions.</p>
              )}
            </ul>
            {requirements.inspirationImage && (
                <div>
                    <p className="font-semibold text-muted-foreground mb-2">Inspiration</p>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                         <Image src={requirements.inspirationImage} alt="Inspiration" fill objectFit="cover" />
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Your Preferences</DialogTitle>
          <DialogDescription>
            Make changes to your requirements below. Your assistant will adapt.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="grid gap-4 py-4">
            {editableFields.map(key => (
              <div className="grid grid-cols-4 items-center gap-4" key={key}>
                <Label htmlFor={key} className="text-right">
                  {formatTitle(key)}
                </Label>
                <Input
                  id={key}
                  name={key}
                  value={editableRequirements[key] || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
            <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
