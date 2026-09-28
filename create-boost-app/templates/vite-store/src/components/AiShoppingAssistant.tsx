import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../data/products';
import {
  SparklesIcon,
  CloseIcon,
  ShoppingBagIcon,
  CheckIcon,
} from './Icons';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: Product[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Bhai under ₹2,000 best streetwear dikhao',
  'Top selling hoodies konsi hain?',
  'Trending oversized t-shirts',
  'Winter jackets with heavy discounts',
];

export const AiShoppingAssistant: React.FC = () => {
  const location = useLocation();
  const { products, addToCart } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste bhai! 👋 Main tera personal AI Shopping Assistant hoon. Bata kya search kar raha hai? (e.g. "Bhai under ₹2,000 best oversized t-shirt chahiye")',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

    try {
      const res = await fetch(`${apiBase}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, prompt: query }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.reply || 'Ye rahe aapke liye best recommendations:',
          products: data.products || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
        return;
      }
    } catch {
      // Local Fallback Intelligence
    }

    // Local heuristic recommendations
    const lower = query.toLowerCase();
    const matched = products.filter((p) => {
      const titleMatches = p.title.toLowerCase().includes(lower);
      const categoryMatches = p.category.toLowerCase().includes(lower);
      const tagMatches = p.tags?.some((t) => lower.includes(t.toLowerCase()));
      const budgetMatch = lower.includes('2000') || lower.includes('2k') ? p.price <= 2000 : true;
      return (titleMatches || categoryMatches || tagMatches || lower.includes('top') || lower.includes('best')) && budgetMatch;
    });

    const recommended = matched.length > 0 ? matched.slice(0, 3) : products.slice(0, 3);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Bhai aapki request ke hisaab se curated best streetwear pieces yahan hain:`,
          products: recommended,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickAdd = (p: Product) => {
    addToCart(p);
    setAddedItemMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [p.id]: false }));
    }, 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            border: '2px solid #38bdf8',
            borderRadius: '9999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            fontWeight: 700,
            fontSize: '13px',
            transition: 'transform 0.2s ease',
          }}
          className="animate-pop-in"
        >
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
          </div>
          <span>AI Shopping Stylist</span>
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            borderRadius: '16px',
            border: '1px solid #27272a',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#18181b',
              borderBottom: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>Boost AI Stylist</div>
                <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Online • Instant D2C Recommendations</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a1a1aa',
                cursor: 'pointer',
                padding: '4px',
              }}
              aria-label="Close assistant"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    backgroundColor: m.sender === 'user' ? '#0284c7' : '#18181b',
                    color: '#ffffff',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    border: m.sender === 'user' ? 'none' : '1px solid #27272a',
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: '10px', color: '#71717a', marginTop: '4px', padding: '0 4px' }}>
                  {m.timestamp}
                </span>

                {/* Embedded Product Cards */}
                {m.products && m.products.length > 0 && (
                  <div
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {m.products.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          backgroundColor: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          padding: '8px 10px',
                        }}
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {p.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>₹{p.price}</span>
                            {p.compareAtPrice > p.price && (
                              <span style={{ fontSize: '11px', color: '#71717a', textDecoration: 'line-through' }}>
                                ₹{p.compareAtPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          style={{
                            backgroundColor: addedItemMap[p.id] ? '#059669' : '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0,
                          }}
                        >
                          {addedItemMap[p.id] ? (
                            <>
                              <CheckIcon size={12} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBagIcon size={12} />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px' }}>
                <SparklesIcon size={14} className="animate-spin" />
                <span>AI is searching our catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#18181b',
              borderTop: '1px solid #27272a',
              overflowX: 'auto',
              display: 'flex',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                style={{
                  backgroundColor: '#27272a',
                  color: '#cbd5e1',
                  border: '1px solid #3f3f46',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px',
              backgroundColor: '#09090b',
              borderTop: '1px solid #27272a',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. under ₹2k hoodies)..."
              style={{
                flex: 1,
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !isLoading ? 1 : 0.5,
              }}
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </>
  );
};
