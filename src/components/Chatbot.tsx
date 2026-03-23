import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Send, X, MessageSquare, Sparkles } from 'lucide-react';
import { shopConfig, aboutConfig } from '../config';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: "Welcome to AtCozy's Private Concierge. I'm your boutique assistant. How may I help you find your perfect European look today?",
      timestamp: new Date()
    }
  ]);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(windowRef.current,
        { opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power4.out' }
      );
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // AI Logic (Simulated for Now)
    setTimeout(() => {
      let botResponse = "I'm delighted to assist you. Our collections are sourced from Turkey, France, and Italy. Are you looking for something specific like a dress or knitwear?";
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('dress')) {
        const dresses = shopConfig.products.filter(p => p.category === 'Dresses');
        botResponse = `We have some exquisite dresses currently. For example, our ${dresses[0]?.name} is a favorite. Would you like to see more?`;
      } else if (lowerInput.includes('shipping') || lowerInput.includes('return')) {
        botResponse = "We offer private shipping across North America and Europe. Returns are accepted within 14 days to ensure your absolute satisfaction.";
      } else if (lowerInput.includes('about') || lowerInput.includes('who')) {
        botResponse = aboutConfig.description;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[1200] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={windowRef}
          className="w-[380px] h-[550px] bg-[#0B0B0D]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-6"
        >
          {/* Header */}
          <div className="bg-[#D4A24F] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-black">
              <img 
                src="/atcozy_chatbot_logo.png" 
                alt="AtCozy Concierge Logo"
                className="w-10 h-10 rounded-full object-cover border border-black/10"
              />
              <div>
                <h3 className="font-bold text-sm tracking-widest uppercase">AtCozy AI</h3>
                <span className="text-[10px] opacity-70">Concierge • Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 scroll-smooth hide-scrollbar space-y-4">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex w-full ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.type === 'user' 
                  ? 'bg-[#D4A24F] text-black rounded-tr-none' 
                  : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            <div className="flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="How can we help you?"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4A24F] transition-all"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 bg-[#D4A24F] text-black rounded-xl flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble Trigger */}
      <button
        ref={bubbleRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#0B0B0D] border-2 border-[#D4A24F] text-[#D4A24F] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,162,79,0.2)] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        {isOpen ? (
          <X className="w-8 h-8 rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-8 h-8 group-hover:scale-0 transition-transform duration-300" />
            <Sparkles className="absolute inset-0 w-8 h-8 scale-0 group-hover:scale-100 transition-transform duration-300" />
          </div>
        )}
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-[#D4A24F]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Floating Badge (Only when closed) */}
      {!isOpen && (
        <div className="absolute top-0 right-full mr-4 translate-y-4 animate-pulse-glow">
          <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-xl">
             Ask Concierge
          </div>
        </div>
      )}
    </div>
  );
}
