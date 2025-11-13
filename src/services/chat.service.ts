// src/services/chat.service.ts
import { prisma } from '@/lib/prisma';
import { generateText } from '@/lib/gemini';

export class ChatService {
  static async getOrCreateConversation(goalId: string, userId: string) {
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          userId,
          goalId,
          title: 'Goal Discussion',
        },
      });
    }

    return conversation;
  }

  static async getMessages(conversationId: string) {
    return await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async addUserMessage(conversationId: string, content: string) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content,
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 100),
        updatedAt: new Date(),
      },
    });

    return message;
  }

  static async addAssistantMessage(conversationId: string, content: string) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content,
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 100),
        updatedAt: new Date(),
      },
    });

    return message;
  }

  static async buildGoalContext(goalId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        context: true,
        plan: true,
      },
    });

    if (!goal) return '';

    let context = `Goal Information:
- Title: ${goal.title}
- Type: ${goal.goalType}
- Duration: ${goal.totalDuration} days
- Daily commitment: ${goal.hoursPerDay} hours/day
- Current progress: ${Math.round(goal.currentProgress)}%
- Status: ${goal.status}`;

    if (goal.description) {
      context += `\n- Description: ${goal.description}`;
    }

    if (goal.context?.clarificationData) {
      const responses = goal.context.clarificationData as any[];
      context += '\n\nUser Context:\n';
      responses.forEach((r: any) => {
        context += `- ${r.question}\n  Answer: ${r.answer}\n`;
      });
    }

    return context;
  }

  /**
   * Generate AI response using Gemini with conversation history
   */
  static async generateAIResponse(
    userMessage: string,
    goalContext: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      // Build conversation history for context (last 6 messages)
      const recentHistory = conversationHistory
        .slice(-6)
        .map((msg) => `${msg.role === 'USER' ? 'Student' : 'Mentor'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `You are a supportive AI mentor helping a student achieve their learning goal. Be conversational, encouraging, and provide specific actionable advice.

**${goalContext}**

**Recent Conversation:**
${recentHistory}

**Student's Current Question:**
${userMessage}

**Guidelines for your response:**
1. Acknowledge their specific question or concern
2. Provide practical, actionable advice
3. Be encouraging and supportive
4. Reference their goal progress when relevant
5. Keep response concise (2-3 paragraphs)
6. If they ask about next steps, suggest specific tasks from their plan
7. If stuck, help them break down the problem

**Respond as their mentor:**`;

      console.log('🤖 Calling Gemini API for chat response...');
      const response = await generateText(prompt);
      console.log('✅ Gemini API response received');

      return response;
    } catch (error: any) {
      console.error('❌ Gemini API failed, using fallback:', error.message);
      // Fallback to pattern-based response
      return this.generateFallbackResponse(userMessage, goalContext);
    }
  }

  /**
   * Fallback response when Gemini fails
   */
  static generateFallbackResponse(userMessage: string, goalContext: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
      return "I understand you're facing challenges. Here's what I suggest:\n\n1. Break down the current task into smaller steps\n2. Review the resources provided for this topic\n3. Take a short break and come back with fresh perspective\n4. Try explaining what you've learned so far - this often reveals gaps\n\nWhat specific part are you struggling with?";
    }

    if (lowerMessage.includes('behind') || lowerMessage.includes('late')) {
      return "Don't worry about being behind schedule. Here's a recovery plan:\n\n1. Focus on high-priority tasks first\n2. Consider extending daily hours slightly for a few days\n3. Skip optional exercises if needed\n4. We can adjust the timeline if necessary\n\nRemember: consistency matters more than speed. Would you like me to suggest which tasks to prioritize?";
    }

    if (lowerMessage.includes('next') || lowerMessage.includes('what should') || lowerMessage.includes('focus')) {
      return "Based on your current progress, here's what to focus on next:\n\n1. Complete any pending tasks from today\n2. Review what you've learned so far\n3. Preview tomorrow's topics\n4. Prepare any resources you'll need\n\nCheck your daily guidance on the dashboard for specific tasks!";
    }

    if (lowerMessage.includes('motivate') || lowerMessage.includes('motivation')) {
      return "You're doing great! Remember why you started:\n\n✨ Every small step counts\n💪 You've already made progress\n🎯 Your goal is within reach\n🚀 Consistency beats perfection\n\nLook how far you've come! What made you start this journey?";
    }

    if (lowerMessage.includes('resource') || lowerMessage.includes('learn') || lowerMessage.includes('tutorial')) {
      return "Great question! Here are some learning tips:\n\n1. Use official documentation first\n2. Practice with real projects\n3. Join communities (Reddit, Discord, Stack Overflow)\n4. Watch video tutorials for complex topics\n5. Take notes and build a reference guide\n\nWhat specific topic do you want resources for?";
    }

    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm your AI mentor, here to help you achieve your goal.\n\nI can help you with:\n- Understanding your current tasks\n- Providing study strategies\n- Overcoming challenges\n- Staying motivated\n- Adjusting your schedule\n\nWhat would you like to discuss today?";
    }

    // Default response with goal context
    const progress = Math.round(parseFloat(goalContext.match(/progress: (\d+)%/)?.[1] || '0'));
    return `I'm here to help you achieve your goal! You're currently ${progress}% complete.\n\nYou can ask me about:\n- 📋 Current tasks and priorities\n- 💡 Study strategies and tips\n- 🚧 Overcoming challenges\n- 📅 Adjusting your schedule\n- 📚 Resources and materials\n- 🎯 Setting milestones\n\nWhat would you like to know?`;
  }
}

