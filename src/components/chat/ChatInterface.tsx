// src/components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatInterfaceProps {
  goalId: string;
  goalTitle: string;
}

export default function ChatInterface({ goalId, goalTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    "I'm stuck, can you help?",
    "What should I focus on next?",
    "I need motivation",
    "Can you recommend resources?",
  ];

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend || loading) return;

    setInput('');
    setLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId,
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setConversationId(data.conversationId);

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <Card className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-accentBlue flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal">AI Mentor</h2>
            <p className="text-sm text-mediumGray">Ask me anything about: {goalTitle}</p>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto mb-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">
              Start a Conversation
            </h3>
            <p className="text-mediumGray mb-6">
              Ask me anything about your goal, progress, or learning strategies
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action)}
                  className="p-3 text-left rounded-lg bg-cream hover:bg-opacity-80 transition-all border border-lightGray"
                >
                  <p className="text-sm font-medium text-charcoal">{action}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.createdAt}
              />
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-cream rounded-lg px-4 py-3 border border-lightGray">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-mediumGray rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-mediumGray rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-mediumGray rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Card>

      {/* Input */}
      <Card>
        <div className="flex space-x-3">
          <textarea
            className="input flex-1 min-h-[60px] max-h-[120px]"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            variant="primary"
            className="self-end"
          >
            {loading ? '...' : 'Send'}
          </Button>
        </div>
        <p className="text-xs text-mediumGray mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </Card>
    </div>
  );
}
