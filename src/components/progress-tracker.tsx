"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";

interface ProgressTrackerProps {
  stages: string[];
  currentStageIndex: number;
}

export default function ProgressTracker({ stages, currentStageIndex }: ProgressTrackerProps) {
  return (
    <div>
      <h2 className="text-lg font-headline font-semibold mb-4">Your Progress</h2>
      <ul className="space-y-4">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <li key={index} className="flex items-center gap-4">
              <div className="flex items-center justify-center h-6 w-6">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : isCurrent ? (
                  <LoaderCircle className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "font-medium",
                isCompleted && "text-muted-foreground line-through",
                isCurrent && "text-primary font-bold"
              )}>
                {stage}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
