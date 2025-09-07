"use client";

import { architectAgent } from '@/ai/flows/architect-agent';
import { generateArchitecturalPrompt } from '@/ai/flows/generate-architectural-prompt';
import { generateFloorPlan } from '@/ai/flows/generate-floor-plan';
import { refineFloorPlan } from '@/ai/flows/refine-floor-plan';
import { generateInteriorVision } from '@/ai/flows/generate-interior-vision';
import AnimatedLogo from '@/components/animated-logo';
import ChatMessage from '@/components/chat-message';
import { Logo } from '@/components/icons';
import ProgressTracker from '@/components/progress-tracker';
import SummaryPanel from '@/components/summary-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, ImageUp, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Keep the same type definition for requirements
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
  interiorImage: string;
};

type Message = {
  id: number;
  sender: 'user' | 'ai';
  content: React.ReactNode;
  isRhetorical?: boolean; // To prevent AI from responding to its own messages
};

const STAGE_KEYS: (keyof Requirements | 'introduction' | 'confirmation' | 'generation' | 'refinement' | 'floorplan' | 'interior' | 'done')[] = [
  'introduction',
  'vision',
  'squareFootage',
  'lotSize',
  'rooms',
  'budget',
  'architecturalStyle',
  'lifestyleNeeds',
  'specialRequirements',
  'materialPreferences',
  'aestheticPreferences',
  'confirmation',
  'generation',
  'refinement',
  'floorplan',
  'interior',
  'done',
];

const STAGE_TITLES: Record<string, string> = {
    introduction: 'Introduction',
    vision: 'Vision',
    squareFootage: 'Sizing',
    lotSize: 'Lot Size',
    rooms: 'Rooms',
    budget: 'Budget',
    architecturalStyle: 'Style',
    lifestyleNeeds: 'Lifestyle',
    specialRequirements: 'Special Needs',
    materialPreferences: 'Materials & Look',
    aestheticPreferences: 'Aesthetics',
    confirmation: 'Confirmation',
    generation: 'Generating Prompt',
    refinement: 'Refining Floor Plan',
    floorplan: 'Final Floor Plan',
    interior: 'Interior Vision',
    done: 'Final Designs'
};


export default function Home() {
  const [requirements, setRequirements] = useState<Partial<Requirements>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStageKey, setCurrentStageKey] = useState<string>('introduction');
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addMessage = useCallback((sender: 'user' | 'ai', content: React.ReactNode, isRhetorical = false) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, content, isRhetorical }]);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    addMessage('user', message);
    setInput('');
    setIsLoading(true);

    const nonRhetoricalMessages = messages
      .filter(m => !m.isRhetorical && typeof m.content === 'string')
      .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: [{ text: m.content as string }]
      }));

    try {
      console.log('Sending to architectAgent:', {
        history: nonRhetoricalMessages,
        requirements,
        currentMessage: message,
      });
      const result = await architectAgent({
        history: nonRhetoricalMessages as any,
        requirements,
        currentMessage: message,
      });
      console.log('Received from architectAgent:', result);


      if(result.requirements) {
        setRequirements(result.requirements);
      }
      
      if(result.nextStage) {
        setCurrentStageKey(result.nextStage);
      }
      
      addMessage('ai', result.response);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get a response from the AI. Please try again.",
      });
      addMessage('ai', "I seem to be have some trouble connecting. Could you try that again?");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage, toast, messages, requirements]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setRequirements(prev => ({...prev, inspirationImage: base64String}));
        addMessage('user', <div className="flex items-center gap-2">Uploaded an inspiration image.</div>, true);
        addMessage('ai', "I've received your inspiration image. It will be a great reference!", true);
        toast({ title: "Image uploaded successfully!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Prompt copied to clipboard!" });
  };

  const handleDownloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: `${filename} download started!` });
  };

  const handleGenerateInterior = async () => {
    if(!requirements.floorPlanImage || !requirements.aestheticPreferences || !requirements.architecturalStyle) return;
    setIsLoading(true);
    addMessage('ai', "Creating an interior design vision based on your new floor plan. This is where the magic happens!", true);
    setCurrentStageKey('interior');
    try {
        const { interiorImage } = await generateInteriorVision({
            floorPlanImage: requirements.floorPlanImage,
            aestheticPreferences: requirements.aestheticPreferences,
            architecturalStyle: requirements.architecturalStyle,
        });
        setRequirements(prev => ({...prev, interiorImage: interiorImage}));
        addMessage('ai', <div className="space-y-4">
              <p>Here is an interior design concept for your main living space. This should give you a feel for the home's atmosphere.</p>
              <Card className="bg-card/70">
                  <CardContent className="p-2">
                      <Image src={interiorImage} alt="Generated Interior Vision" width={1024} height={768} className="rounded-md w-full h-auto" />
                  </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadImage(interiorImage, 'interior-vision.png')}><Download className="mr-2 h-4 w-4" />Download Interior Vision</Button>
              </div>
            </div>, true);
        setCurrentStageKey('done');
    } catch(e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error Generating Interior Vision', description: 'Could not generate the interior design image.'});
        addMessage('ai', 'There was an error generating the interior vision. We can proceed without it.');
        setCurrentStageKey('done');
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
          addMessage('ai', "Welcome to ArchAI, your personal AI architect! I'm here to help you conceptualize and design your dream home. To start, could you tell me a little about your overall vision?");
          setIsLoading(false);
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStageIndex = STAGE_KEYS.indexOf(currentStageKey);
  const isConversationDone = currentStageIndex >= STAGE_KEYS.indexOf('confirmation');

  useEffect(() => {
    const performGeneration = async () => {
      // Stage 1: Generate Architectural Prompt
      if(currentStageKey === 'generation' && requirements.rooms){
          setIsLoading(true);
          addMessage('ai', "I'm now generating a detailed architectural prompt based on your vision. This may take a moment...", true);
          try {
              const promptInput = {
                squareFootage: requirements.squareFootage || '',
                lotSize: requirements.lotSize || '',
                numRooms: requirements.rooms || '',
                roomTypes: requirements.rooms || '',
                budget: requirements.budget || '',
                architecturalStyle: requirements.architecturalStyle || '',
                lifestyleNeeds: requirements.lifestyleNeeds || '',
                specialRequirements: requirements.specialRequirements || '',
                materialPreferences: requirements.materialPreferences || '',
                aestheticPreferences: requirements.aestheticPreferences || '',
                inspirationImage: requirements.inspirationImage || undefined,
              };
              const { architecturalPrompt } = await generateArchitecturalPrompt(promptInput);
              setRequirements(prev => ({...prev, architecturalPrompt: architecturalPrompt}));
              setCurrentStageKey('refinement'); // Go to refinement next
          } catch(e) {
              console.error(e)
              toast({ variant: 'destructive', title: 'Error Generating Prompt', description: 'Could not generate the architectural prompt.'});
              addMessage('ai', 'There was an error generating the prompt. Please try again later.');
              setCurrentStageKey('confirmation'); // Go back
          } finally {
              setIsLoading(false);
          }
      }

      // Stage 2: Generate and then Refine Floor Plan
      if(currentStageKey === 'refinement' && requirements.architecturalPrompt){
          setIsLoading(true);
          addMessage('ai', "Creating a draft floor plan...", true);
          try {
              // First, generate the initial floor plan
              const { floorPlanImage: v1Image } = await generateFloorPlan({ architecturalPrompt: requirements.architecturalPrompt! });
              
              addMessage('ai', "Draft created. Now, I'll ask our Master Architect AI to review and refine it for accuracy and quality. This is the key step!", true);
              
              const allRequirements = Object.entries(requirements)
                .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${value}`)
                .join('\n');

              const { refinedFloorPlanImage } = await refineFloorPlan({
                  floorPlanImage: v1Image,
                  requirements: allRequirements,
                  originalPrompt: requirements.architecturalPrompt!,
              });

              setRequirements(prev => ({...prev, floorPlanImage: refinedFloorPlanImage}));
              setCurrentStageKey('floorplan');

          } catch(e) {
              console.error(e);
              toast({ variant: 'destructive', title: 'Error Generating Floor Plan', description: 'Could not generate or refine the floor plan image.'});
              addMessage('ai', 'There was an error during the floor plan creation process. Please try again later.');
              setCurrentStageKey('confirmation'); // Go back
          } finally {
              setIsLoading(false);
          }
      }


      // Stage 3: Display Final Floor Plan and Prompt
      if(currentStageKey === 'floorplan' && requirements.architecturalPrompt && requirements.floorPlanImage){
          addMessage('ai', <div className="space-y-4">
              <p>The final, refined floor plan is ready! I've incorporated feedback from our AI architect to ensure it's as accurate as possible.</p>
              {requirements.floorPlanImage && (
                <Card className="bg-card/70">
                    <CardContent className="p-2">
                        <Image src={requirements.floorPlanImage} alt="Generated Floor Plan" width={1024} height={1024} className="rounded-md w-full h-auto" />
                    </CardContent>
                </Card>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadImage(requirements.floorPlanImage!, 'floor-plan-refined.png')}><Download className="mr-2 h-4 w-4" />Download Floor Plan</Button>
                <Button size="sm" onClick={handleGenerateInterior} disabled={isLoading}><Sparkles className="mr-2 h-4 w-4" />Generate Interior Vision</Button>
              </div>

              <Card className="bg-card/70">
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Architectural Prompt</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 whitespace-pre-wrap font-code text-xs relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopyToClipboard(requirements.architecturalPrompt!)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    {requirements.architecturalPrompt}
                </CardContent>
              </Card>
            </div>, true);
            // Don't advance stage here, wait for user to click
      }
    }
    performGeneration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageKey, addMessage, toast, requirements]);


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
        <ProgressTracker stages={Object.values(STAGE_TITLES)} currentStageIndex={currentStageIndex} />
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
              disabled={isLoading || isConversationDone}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isConversationDone || currentStageKey !== 'materialPreferences'}
                aria-label="Upload Image"
                title="Upload Inspiration Image"
              >
                <ImageUp className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => handleSendMessage(input)} 
                disabled={isLoading || !input.trim() || isConversationDone}
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
