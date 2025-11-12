// src/components/chat/MessageBubble.tsx
'use client';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-accentBlue' : 'bg-cream'
        }`}>
          <span className="text-sm">
            {isUser ? '👤' : '🤖'}
          </span>
        </div>

        {/* Message */}
        <div>
          <div className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-accentBlue text-white' 
              : 'bg-cream text-charcoal border border-lightGray'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
          {timestamp && (
            <p className="text-xs text-mediumGray mt-1 px-2">
              {new Date(timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
