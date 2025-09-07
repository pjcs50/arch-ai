"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { ReactNode } from "react";

interface ChatMessageProps {
  sender: 'user' | 'ai';
  content: ReactNode;
}

export default function ChatMessage({ sender, content }: ChatMessageProps) {
  const isUser = sender === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-4 w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border-2 border-primary/50">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-4 py-3 shadow-md',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border'
        )}
      >
        {typeof content === 'string' ? (
          <p className="text-sm">{content}</p>
        ) : (
          <div className="text-sm">{content}</div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
