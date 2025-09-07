"use client";

import { generateArchitecturalPrompt } from '@/ai/flows/generate-architectural-prompt';
import { generateFloorPlan } from '@/ai/flows/generate-floor-plan';
import AnimatedLogo from '@/components/animated-logo';
import ChatMessage from '@/components/chat-message';
import { Logo } from '@/components/icons';
import ProgressTracker from '@/components/progress-tracker';
import SummaryPanel from '@/components/summary-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Copy, Download, ImageUp, Send } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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

type Message = {
  id: number;
  sender: 'user' | 'ai';
  content: React.ReactNode;
};

type Stage = {
  key: keyof Requirements | 'welcome' | 'confirmation' | 'generation' | 'floorplan' | 'done';
  title: string;
  question: string;
  quickReplies?: string[];
};

const STAGES: Stage[] = [
  { key: 'welcome', title: 'Introduction', question: "Welcome to ArchAI, your personal AI architect! I'm here to help you conceptualize and design your dream home. To start, could you tell me a little about your overall vision?" },
  { key: 'squareFootage', title: 'Sizing', question: "Great vision! Now let's talk about the scale. What's the total square footage you're imagining for the house, and what's the size of the lot?" },
  { key: 'rooms', title: 'Rooms', question: 'Perfect. How many rooms are you picturing, and what kinds of spaces are essential for you (e.g., 3 bedrooms, 2.5 bathrooms, a home office, a gym)?' },
  { key: 'budget', title: 'Budget', question: 'What is your estimated budget range for this project? This helps in suggesting appropriate materials and complexity.' },
  { key: 'architecturalStyle', title: 'Style', question: 'What architectural style are you drawn to? Feel free to describe it, or select from some common styles below.', quickReplies: ['Modern', 'Traditional', 'Contemporary', 'Minimalist', 'Industrial', 'Farmhouse'] },
  { key: 'lifestyleNeeds', title: 'Lifestyle', question: 'How do you see yourself living in this home? For example, do you work from home, entertain often, or have a large family?' },
  { key: 'specialRequirements', title: 'Special Needs', question: 'Are there any special requirements to consider, such as accessibility (like ramps or elevators), eco-friendly/sustainable design, or smart home features?' },
  { key: 'materialPreferences', title: 'Materials & Look', question: "Let's get into the look and feel. What materials and aesthetic preferences do you have? You can also upload an inspiration image to help me visualize." },
  { key: 'confirmation', title: 'Confirmation', question: "Excellent! I've gathered the initial details. Please review them on the summary panel. Does everything look correct before we proceed?" },
  { key: 'generation', title: 'Generating Prompt', question: "I'm now generating a detailed architectural prompt based on your vision. This may take a moment..." },
  { key: 'floorplan', title: 'Floor Plan', question: "Now, I'm creating a draft floor plan based on your prompt. This is an exciting step! This can take up to a minute." },
  { key: 'done', title: 'Final Designs', question: 'Here is the detailed architectural prompt for your dream home and the generated floor plan. You can use this with other generative design tools.' },
];

export default function Home() {
  const [requirements, setRequirements] = useState<Partial<Requirements>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addMessage = useCallback((sender: 'user' | 'ai', content: React.ReactNode) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, content }]);
  }, []);

  const processAIResponse = useCallback(async (currentInput: string, stage: Stage) => {
    if (stage.key === 'welcome') {
      setRequirements(prev => ({ ...prev, vision: currentInput }));
    } else if (stage.key !== 'confirmation' && stage.key !== 'generation' && stage.key !== 'floorplan' && stage.key !== 'done') {
      const key = stage.key as keyof Omit<Requirements, 'vision' | 'inspirationImage'>;

      const keys = ['squareFootage', 'lotSize'];
      if(keys.includes(key)) {
        const [sq, lot] = currentInput.split(/,|\band\b/).map(s => s.trim());
        setRequirements(prev => ({ ...prev, squareFootage: sq, lotSize: lot || '' }));
      } else {
        setRequirements(prev => ({ ...prev, [key]: currentInput }));
      }
    }

    if (currentInput.toLowerCase().includes('yes') && stage.key === 'confirmation') {
        setCurrentStageIndex(prev => prev + 1);
    } else if (stage.key === 'confirmation') {
        addMessage('ai', "No problem. Which part would you like to change? Just tell me the section and the new details.");
        setCurrentStageIndex(STAGES.findIndex(s => s.key === 'squareFootage')); // Go back to start of questions
    } else {
        setCurrentStageIndex(prev => prev + 1);
    }
  }, [addMessage]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    addMessage('user', message);
    setInput('');
    setIsLoading(true);

    try {
      await processAIResponse(message, STAGES[currentStageIndex]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get a response from the AI. Please try again.",
      });
      addMessage('ai', "I seem to be having some trouble connecting. Could you try that again?");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentStageIndex, processAIResponse, toast, addMessage]);

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setRequirements(prev => ({...prev, inspirationImage: base64String}));
        addMessage('user', <div className="flex items-center gap-2">Uploaded an inspiration image.</div>);
        addMessage('ai', "I've received your inspiration image. It will be a great reference!");
        toast({ title: "Image uploaded successfully!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Prompt copied to clipboard!" });
  };

  const handleDownloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'floor-plan.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Floor plan download started!" });
  };

  useEffect(() => {
    const savedRequirements = localStorage.getItem('archai-requirements');
    const savedMessages = localStorage.getItem('archai-messages');
    const savedStage = localStorage.getItem('archai-stage');
    if (savedRequirements && savedMessages && savedStage) {
        setRequirements(JSON.parse(savedRequirements));
        setMessages(JSON.parse(savedMessages));
        setCurrentStageIndex(JSON.parse(savedStage));
    } else {
        setIsLoading(true);
        setTimeout(() => {
            addMessage('ai', STAGES[0].question);
            setIsLoading(false);
        }, 1000);
    }
  }, [addMessage]);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('archai-requirements', JSON.stringify(requirements));
        localStorage.setItem('archai-messages', JSON.stringify(messages));
        localStorage.setItem('archai-stage', JSON.stringify(currentStageIndex));
    }
  }, [requirements, messages, currentStageIndex]);

  useEffect(() => {
    const currentStage = STAGES[currentStageIndex];
    if (currentStage && messages.length > 0) {
      if(currentStage.key !== 'welcome' && !['generation', 'floorplan', 'done'].includes(currentStage.key) && messages[messages.length - 1]?.sender === 'user') {
        const quickReplies = currentStage.quickReplies ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {currentStage.quickReplies.map(reply => (
              <Button key={reply} variant="outline" size="sm" onClick={() => handleQuickReply(reply)}>{reply}</Button>
            ))}
          </div>
        ) : null;
        
        const messageContent = (
          <div>
            <p>{currentStage.question}</p>
            {quickReplies}
          </div>
        );
        addMessage('ai', messageContent);
      }
      
      if(currentStage.key === 'generation'){
        const generatePrompt = async () => {
            setIsLoading(true);
            addMessage('ai', currentStage.question);
            try {
                const { architecturalPrompt } = await generateArchitecturalPrompt(requirements as any);
                setRequirements(prev => ({...prev, architecturalPrompt: architecturalPrompt}));
                setCurrentStageIndex(prev => prev + 1);
            } catch(e) {
                toast({ variant: 'destructive', title: 'Error Generating Prompt', description: 'Could not generate the architectural prompt.'});
                addMessage('ai', 'There was an error generating the prompt. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }
        generatePrompt();
      }

      if(currentStage.key === 'floorplan'){
        const createFloorPlan = async () => {
            setIsLoading(true);
            addMessage('ai', currentStage.question);
            try {
                const { floorPlanImage } = await generateFloorPlan({ architecturalPrompt: requirements.architecturalPrompt! });
                setRequirements(prev => ({...prev, floorPlanImage: floorPlanImage}));
                setCurrentStageIndex(prev => prev + 1);
            } catch(e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Error Generating Floor Plan', description: 'Could not generate the floor plan image.'});
                addMessage('ai', 'There was an error generating the floor plan. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }
        createFloorPlan();
      }

      if(currentStage.key === 'done' && requirements.architecturalPrompt && requirements.floorPlanImage){
          addMessage('ai', <div className="space-y-4">
              <p>{currentStage.question}</p>
              {requirements.floorPlanImage && (
                <Card className="bg-card/70">
                    <CardContent className="p-2">
                        <Image src={requirements.floorPlanImage} alt="Generated Floor Plan" width={500} height={500} className="rounded-md w-full h-auto" />
                    </CardContent>
                </Card>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadImage(requirements.floorPlanImage!)}><Download className="mr-2 h-4 w-4" />Download</Button>
              </div>

              <Card className="bg-card/70">
                <CardContent className="p-4 whitespace-pre-wrap font-code text-xs relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopyToClipboard(requirements.architecturalPrompt!)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    {requirements.architecturalPrompt}
                </CardContent>
              </Card>
            </div>);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageIndex, requirements.architecturalPrompt]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="flex h-svh w-full bg-background font-body text-foreground">
      <aside className="hidden md:flex flex-col w-96 bg-card border-r p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">ArchAI</h1>
        </div>
        <ProgressTracker stages={STAGES.map(s => s.title)} currentStageIndex={currentStageIndex} />
        <SummaryPanel requirements={requirements} />
      </aside>

      <main className="flex flex-1 flex-col h-svh">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} sender={msg.sender} content={msg.content} />
          ))}
          {isLoading && <ChatMessage sender="ai" content={<div className="flex items-center gap-2"><AnimatedLogo /><span>Thinking...</span></div>} />}
        </div>
        <div className="border-t bg-card p-4">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder="Type your message here..."
              className="pr-24 min-h-[48px] resize-none"
              disabled={isLoading || currentStageIndex >= STAGES.findIndex(s => s.key === 'confirmation')}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || STAGES[currentStageIndex]?.key !== 'materialPreferences'}
                aria-label="Upload Image"
                title="Upload Inspiration Image"
              >
                <ImageUp className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => handleSendMessage(input)} 
                disabled={isLoading || !input.trim() || currentStageIndex >= STAGES.findIndex(s => s.key === 'confirmation')}
                aria-label="Send Message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
