
import React, { useState, useEffect, useRef } from 'react';
import { createSageSession } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { ACTION_POINTS } from '../services/gamificationConfig';

interface SageChatProps {
  context: string;
  type: string;
}

interface Message {
  id: string;
  sender: 'user' | 'sage';
  text: string;
}

const SageChat: React.FC<SageChatProps> = ({ context, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { awardKarma } = useAuth();

  // Initialize Session only when opened
  useEffect(() => {
    if (isOpen && !chatSession) {
      setMessages([{
        id: 'init',
        sender: 'sage',
        text: `Namaste. I have contemplated your ${type} reading. What seeks clarification, seeker?`
      }]);
      try {
          const session = createSageSession(context, type);
          setChatSession(session);
      } catch (e) {
          console.error("Chat init failed", e);
      }
    }
  }, [isOpen, context, type, chatSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const result = await chatSession.sendMessage({ message: input });
        const sageMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            sender: 'sage', 
            text: result.text || "The stars are silent momentarily." 
        };
        setMessages(prev => [...prev, sageMsg]);
        awardKarma(5); // Small reward for engagement
    } catch (e) {
        setMessages(prev => [...prev, { id: 'err', sender: 'sage', text: "The connection to the ether is weak. Please try again." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full border-2 border-amber-400 shadow-[0_0_20px_rgba(139,92,246,0.6)] flex items-center justify-center animate-pulse hover:scale-110 transition-transform"
          title="Ask the Sage"
        >
          <span className="text-2xl">🧙‍♂️</span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 h-[80vh] md:h-[600px] z-[60] flex flex-col bg-gray-900/95 backdrop-blur-xl border border-amber-500/30 rounded-t-xl md:rounded-2xl shadow-2xl animate-fade-in-up">
          
          {/* HEADER */}
          <div className="flex justify-between items-center p-4 border-b border-amber-500/20 bg-gradient-to-r from-indigo-900 to-black rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-amber-400/50 flex items-center justify-center">
                <span className="text-2xl">🔮</span>
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-amber-200">Sage Vashishtha</h3>
                <p className="text-[10px] text-purple-300 font-mono tracking-wider">VEDIC GUIDE • ONLINE</p>
              </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400"
            >
                ✕
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-amber-900/60 text-amber-100 border border-amber-700/50 rounded-br-none' 
                      : 'bg-indigo-900/60 text-indigo-100 border border-indigo-500/30 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-indigo-900/40 px-4 py-2 rounded-full border border-indigo-500/20 flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t border-amber-500/20 bg-black/40">
            <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  disabled={isTyping}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1 top-1 w-10 h-10 bg-amber-600 hover:bg-amber-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➤
                </button>
            </div>
            <p className="text-[9px] text-center text-gray-500 mt-2">AI guidance may vary. Trust your intuition.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SageChat;
