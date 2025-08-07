"use client"
import ReactMarkdown from "react-markdown"
import React, { useEffect, useRef, useState } from "react"
import { franc } from "franc"

import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

import { useChat } from "ai/react"

import { ArrowUpIcon, AlertCircle, Mic, MicOff, Send, Bot, User, Sparkles, MessageCircle, Tv, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { InquiryForm } from "@/components/inquiry-form"

// Helper for Hinglish/Taglish detection
function detectScript(text: string): 'latin' | 'other' {
  const latin = text.match(/[a-zA-Z]/g)?.length || 0;
  const nonLatin = text.length - latin;
  return latin > nonLatin ? 'latin' : 'other';
}

export function ChatForm({ className, ...props }: React.ComponentProps<"div">) {
  // Get websiteId from URL parameters or default to akashdth
  const [websiteId, setWebsiteId] = useState<string>('akashdth')
  const [websiteInfo, setWebsiteInfo] = useState<{name: string, domain: string} | null>(null)

  useEffect(() => {
    // Get websiteId from URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const paramWebsiteId = urlParams.get('websiteId')
      if (paramWebsiteId) {
        setWebsiteId(paramWebsiteId)
      }
      
      // Set website info for display
      const websiteConfigs: Record<string, {name: string, domain: string}> = {
        'akashdth': { name: 'AkashDTH', domain: 'akashdth.com' },
        'streamplay': { name: 'StreamPlay', domain: 'streamplay.com' },
        'matchbestgroup': { name: 'MatchBest Group', domain: 'matchbestgroup.com' },
        'website3': { name: 'Website3', domain: 'website3.com' },
        'cignal': { name: 'Cignal', domain: 'cignal.tv' }
      }
      
      const currentWebsite = websiteConfigs[paramWebsiteId || 'akashdth']
      setWebsiteInfo(currentWebsite)
    }
  }, [])

  const { messages, input, setInput, append, isLoading, error, reload } = useChat({
    api: "/api/chat",
    body: {
      websiteId: websiteId
    },
    onError: (error) => {
      console.error("Chat error details:", error)
    },
  })

  // Inquiry form state
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryType, setInquiryType] = useState('')

  // Voice-to-text (speech recognition) state and handlers
  const [isListening, setIsListening] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const [speechError, setSpeechError] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when new messages arrive or AI is typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Function to auto-execute commands
  const executeCommand = (command: string) => {
    append({ role: "user", content: command })
  }

  // Check for inquiry keywords in messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'user') {
      const userMessage = lastMessage.content.toLowerCase()
      
      // Check for demo requests
      if (userMessage.includes('demo') || userMessage.includes('book demo') || userMessage.includes('request demo')) {
        setInquiryType('demo')
        setShowInquiryForm(true)
        return
      }
      
      // Check for trial requests
      if (userMessage.includes('trial') || userMessage.includes('free trial') || userMessage.includes('start trial')) {
        setInquiryType('trial')
        setShowInquiryForm(true)
        return
      }
      
      // Check for consultation requests
      if (userMessage.includes('consultation') || userMessage.includes('schedule') || userMessage.includes('appointment')) {
        setInquiryType('consultation')
        setShowInquiryForm(true)
        return
      }
      
      // Check for subscription requests
      if (userMessage.includes('subscribe') || userMessage.includes('sign up') || userMessage.includes('get plan')) {
        setInquiryType('subscription')
        setShowInquiryForm(true)
        return
      }
      
      // Check for support requests
      if (userMessage.includes('support') || userMessage.includes('help') || userMessage.includes('technical')) {
        setInquiryType('support')
        setShowInquiryForm(true)
        return
      }
    }
  }, [messages])

  // Cleanup effect for speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      // Check browser compatibility first
      if (typeof window === 'undefined') {
        setSpeechError('Speech recognition is not available in this environment.');
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      // Check if we're on HTTPS (required for microphone access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setSpeechError('Speech recognition requires HTTPS. Please use a secure connection.');
        return;
      }

      startListening();
    }
  };

  const startListening = () => {
    setSpeechError(null);
    setIsInitializing(true);
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setSpeechError('Speech recognition is not available in this environment.');
      setIsInitializing(false);
      return;
    }

    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setIsInitializing(false);
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsInitializing(false);
        setIsListening(true);
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        
        // Directly send the message instead of setting it in input field
        if (transcript.trim()) {
          append({ role: "user", content: transcript.trim() });
        }
        
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsInitializing(false);
        
        switch (event.error) {
          case 'network':
            setSpeechError('Network error. Please check your internet connection.');
            break;
          case 'not-allowed':
            setSpeechError('Microphone access denied. Please allow microphone access in your browser settings.');
            break;
          case 'no-speech':
            setSpeechError('No speech detected. Please try speaking again.');
            break;
          default:
            setSpeechError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsInitializing(false);
        console.log('Speech recognition ended');
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setSpeechError('Failed to start speech recognition. Please try again.');
      setIsInitializing(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
    setIsInitializing(false);
  };

  const handleInputChange = (v: string): void => {
    setInput(v)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    append({ role: "user", content: input })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      append({ role: "user", content: input })
      setInput("")
    }
  }

  const handleRetry = () => {
    reload()
  }

  const formatTime = (dateInput: string | Date): string => {
    const date = new Date(dateInput)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const hasStartedChat = messages.length > 0

  const messageList = (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((message, index) => {
        const isUser = message.role === "user"
        const isLastMessage = index === messages.length - 1
        const showAvatar = true

        return (
          <div
            key={message.id || index}
            className={cn(
              "flex items-start gap-3 transition-all duration-500",
              isUser ? "flex-row-reverse" : "flex-row",
              isLastMessage && "animate-in slide-in-from-bottom-4 fade-in-0"
            )}
          >
            {showAvatar && (
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-lg",
                isUser 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-200" 
                  : "bg-gradient-to-br from-purple-500 to-purple-600 ring-2 ring-purple-200"
              )}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
            )}
            
            <div className={cn(
              "flex-1 max-w-[85%] space-y-1",
              isUser ? "text-right" : "text-left"
            )}>
              <div className={cn(
                "inline-block rounded-xl px-3 py-2 shadow-md transition-all duration-300 hover:shadow-lg",
                isUser
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-md hover:border-purple-200"
              )}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed text-sm">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5 text-sm">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5 text-sm">{children}</ol>,
                      li: ({ children }) => <li className="text-xs">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                      a: ({ href, children }) => (
                        <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className={cn(
                "text-xs text-gray-500 flex items-center",
                isUser ? "justify-end" : "justify-start"
              )}>
                <span>{formatTime(message.createdAt || new Date())}</span>
                {!isUser && (
                  <div className="ml-2 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">AI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
      
      {isLoading && (
        <div className="flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg ring-2 ring-purple-200">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 max-w-[85%] space-y-1">
            <div className="bg-white border border-gray-200 rounded-xl rounded-bl-md px-3 py-2 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">AI is thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50", className)} {...props}>
        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-10 left-5 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-10 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-10 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Messages Area */}
          <div className="flex-1">
            {!hasStartedChat ? (
              <div className="flex items-center justify-center h-full px-4">
                <div className="text-center max-w-xl">
                  {/* Hero Section */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-2xl animate-pulse">
                      <Tv className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to {websiteInfo?.name || 'Our Service'}!
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                     I'm your AI assistant, ready to help you with plans, channels, subscriptions, and more. 
                    Let's make your entertainment experience amazing! 🎬✨
                  </p>
                  
                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => executeCommand("What plans do you offer?")}
                      className="group p-3 text-left bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Tv className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">View Plans</div>
                          <div className="text-xs text-gray-500">See packages</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => executeCommand("I want to book a demo")}
                      className="group p-3 text-left bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">Book Demo</div>
                          <div className="text-xs text-gray-500">Schedule demo</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => executeCommand("What channels are included?")}
                      className="group p-3 text-left bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageCircle className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">Channel List</div>
                          <div className="text-xs text-gray-500">Browse channels</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => executeCommand("I need technical support")}
                      className="group p-3 text-left bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">Get Support</div>
                          <div className="text-xs text-gray-500">Technical help</div>
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  {/* Features */}
                  <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>24/7 Available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span>Instant Responses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      <span>Smart AI</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              messageList
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-3 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <AutoResizeTextarea
                  onKeyDown={handleKeyDown}
                  onChange={handleInputChange}
                  value={input}
                  placeholder={`Ask me anything about ${websiteInfo?.name || 'our services'}...`}
                  disabled={isLoading}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 pr-12 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md text-sm"
                  style={{ minHeight: 40, maxHeight: 80 }}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleMicClick}
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105",
                          isListening ? "bg-red-100 text-red-600 animate-pulse shadow-lg" :
                          isInitializing ? "bg-blue-100 text-blue-600 animate-pulse shadow-lg" :
                          "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:shadow-md"
                        )}
                        aria-label={isListening ? "Stop listening" : isInitializing ? "Initializing..." : "Start voice input"}
                        disabled={isLoading || isInitializing}
                      >
                        {isListening ? <Mic className="w-3 h-3" /> :
                         isInitializing ? <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> :
                         <MicOff className="w-3 h-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isListening ? "Listening... Click to stop." :
                       isInitializing ? "Initializing microphone..." :
                       "Voice to text"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {/* Speech Error */}
            {speechError && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertCircle className="w-3 h-3" />
                <span className="flex-1">{speechError}</span>
                <button
                  onClick={() => {
                    setSpeechError(null);
                    setTimeout(() => handleMicClick(), 100);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Privacy Notice */}
            {messages.length === 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                By chatting here, you consent to our{' '}
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline font-medium">Privacy Policy</a>
              </div>
            )}
          </div>
        </div>

        {/* Inquiry Form */}
        <InquiryForm
          inquiryType={inquiryType}
          isOpen={showInquiryForm}

          onClose={() => setShowInquiryForm(false)}
          onSubmit={(data) => {
            console.log('Inquiry submitted:', data)
            setShowInquiryForm(false)
          }}
        />
      </div>
    </TooltipProvider>
  )
}