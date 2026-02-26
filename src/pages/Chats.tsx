import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Send, Paperclip, X } from "lucide-react";
import { ChatBubble } from "@/components/shared/ChatBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const chats = [
  { id: 1, agent: "CSO", name: "Michael", preview: "I've completed the market analysis for Q4...", time: "2m ago", unread: true },
  { id: 2, agent: "CFO", name: "Raphael", preview: "Updated cash flow projections are ready.", time: "15m ago", unread: true },
  { id: 3, agent: "COO", name: "Mary", preview: "Process optimization review is complete.", time: "1h ago", unread: false },
  { id: 4, agent: "CRO", name: "Gabriel", preview: "Revenue growth metrics report is now available.", time: "3h ago", unread: false },
  { id: 5, agent: "CTO", name: "Emily", preview: "Technical roadmap has been updated.", time: "1d ago", unread: false },
];

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: File[];
}

const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      role: "user",
      content: "Can you analyze the Q4 market trends?",
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      role: "assistant",
      content: "Sure! Here is the analysis for **Q4 Market Trends**.\n\n### Key Highlights\n- **Revenue**: Up by 15%\n- **User Growth**: +5k new users\n\n| Metric | Q3 | Q4 | Change |\n|---|---|---|---|\n| Revenue | $1.2M | $1.38M | +15% |\n| Users | 45k | 50k | +11% |\n\n> Note: The growth was primarily driven by the new feature launch in October.",
      timestamp: "10:31 AM"
    }
  ],
  2: [
    {
      id: 1,
      role: "assistant",
      content: "Updated cash flow projections are ready. Would you like me to summarize the key variances?",
      timestamp: "10:15 AM"
    }
  ]
};

export default function Chats() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files || [])]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (selectedChatId) {
      setMessages(mockMessages[selectedChatId] || []);
    }
  }, [selectedChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isStreaming]);

  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || !selectedChatId) return;

    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setAttachments([]);
    setIsStreaming(true);

    // Simulate streaming response
    const responseContent = "This is a **simulated streaming response** to show how markdown renders in *real-time*.\n\nHere's a code block:\n```javascript\nconsole.log('Hello World');\n```\n\nAnd a list:\n1. Item one\n2. Item two\n3. Item three";

    const assistantMessageId = Date.now() + 1;
    let currentContent = "";

    // Add empty assistant message first
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    const words = responseContent.split(" ");

    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      currentContent += (i > 0 ? " " : "") + words[i];

      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: currentContent }
          : msg
      ));
    }

    setIsStreaming(false);
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="animate-fade-in h-[calc(100vh-6rem)] flex flex-col">
      <PageHeader
        title="Chats"
        description="View all conversations with your AI agents"
      />

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Chat List */}
        <Card className="w-full max-w-md flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </div>
          <CardContent className="p-2 flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted mb-1",
                  selectedChatId === chat.id ? "bg-muted" : ""
                )}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {chat.agent}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{chat.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {chat.preview}
                  </p>
                </div>
                {chat.unread && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col h-full overflow-hidden">
          {selectedChatId ? (
            <>
              <CardHeader className="py-4 border-b border-border flex flex-row items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {selectedChat?.agent}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{selectedChat?.name}</h3>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  <div className="space-y-4 pb-4">
                    {messages.map((msg, index) => {
                      const isLast = index === messages.length - 1;
                      const showTyping = isStreaming && isLast && msg.role === "assistant" && (msg.content || "").trim().length === 0;
                      return (
                        <ChatBubble
                          key={msg.id}
                          content={msg.content}
                          role={msg.role}
                          timestamp={msg.timestamp}
                          name={msg.role === "assistant" ? selectedChat?.name : "You"}
                          isLoading={showTyping}
                          attachments={msg.attachments}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="p-4 border-t border-border mt-auto">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs group">
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isStreaming || (!input.trim() && attachments.length === 0)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Select a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a chat from the list to view the full conversation history with your AI agents.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
