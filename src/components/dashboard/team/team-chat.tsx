// src/components/dashboard/team/team-chat.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/context/locale-context";
import { Send, Phone, Video } from "lucide-react";


export function TeamChat() {
    const { t } = useLocale();

    // Données de simulation pour l'interface
    const selectedMember = { name: "Alice Dupont", avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxldHVkaWFudHxlbnwwfHx8fDE3NTY1NjM2MzB8MA&ixlib=rb-4.1.0&q=80&w=1080", "data-ai-hint": "woman avatar" };
    const messages = [
        { from: "me", text: "Bonjour Alice, peux-tu me faire un point sur le dossier X ?" },
        { from: "other", text: "Bonjour ! Bien sûr, je vous envoie ça dans l'après-midi." },
        { from: "me", text: "Parfait, merci." },
    ];

    return (
        <div className="flex flex-col h-full bg-background md:bg-transparent">
            <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={selectedMember.avatar} data-ai-hint={selectedMember['data-ai-hint']}/>
                        <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">{selectedMember.name}</p>
                        <p className="text-xs text-green-500">En ligne</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Phone className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon"><Video className="h-5 w-5"/></Button>
                </div>
            </header>
            
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                             {message.from === 'other' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedMember.avatar} data-ai-hint={selectedMember['data-ai-hint']} />
                                    <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                             )}
                              <div className={`rounded-lg px-4 py-2 max-w-sm ${message.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            
            <footer className="p-4 border-t flex-shrink-0">
                 <div className="relative">
                    <Input placeholder="Écrire un message..." className="pr-12"/>
                    <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                        <Send className="h-4 w-4"/>
                    </Button>
                 </div>
            </footer>
        </div>
    )
}
