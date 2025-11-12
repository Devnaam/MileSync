// src/services/chat.service.ts
import { prisma } from '@/lib/prisma';

export class ChatService {
  /**
   * Create or get conversation for a goal
   */
  static async getOrCreateConversation(goalId: string, userId: string) {
    // Find existing conversation for this goal
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Create new conversation if none exists
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

  /**
   * Get conversation messages
   */
  static async getMessages(conversationId: string) {
    return await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add user message
   */
  static async addUserMessage(conversationId: string, content: string) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content,
      },
    });

    // Update conversation last message
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 100),
        updatedAt: new Date(),
      },
    });

    return message;
  }

  /**
   * Add assistant message
   */
  static async addAssistantMessage(conversationId: string, content: string) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content,
      },
    });

    // Update conversation last message
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 100),
        updatedAt: new Date(),
      },
    });

    return message;
  }

  /**
   * Build context for AI from goal data
   */
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
   * Generate AI response (fallback without Gemini)
   */
  static generateFallbackResponse(userMessage: string, goalContext: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Pattern matching for common queries
    if (lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
      return "I understand you're facing challenges. Here's what I suggest:\n\n1. Break down the current task into smaller steps\n2. Review the resources provided for this topic\n3. Take a short break and come back with fresh perspective\n4. Try explaining what you've learned so far - this often reveals gaps\n\nWhat specific part are you struggling with?";
    }

    if (lowerMessage.includes('behind') || lowerMessage.includes('late')) {
      return "Don't worry about being behind schedule. Here's a recovery plan:\n\n1. Focus on high-priority tasks first\n2. Consider extending daily hours slightly for a few days\n3. Skip optional exercises if needed\n4. We can adjust the timeline if necessary\n\nRemember: consistency matters more than speed. Would you like me to suggest which tasks to prioritize?";
    }

    if (lowerMessage.includes('next') || lowerMessage.includes('what should')) {
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

    // Default response
    const progress = Math.round(parseFloat(goalContext.match(/progress: (\d+)%/)?.[1] || '0'));
    return `I'm here to help you achieve your goal! You're currently ${progress}% complete.\n\nYou can ask me about:\n- 📋 Current tasks and priorities\n- 💡 Study strategies and tips\n- 🚧 Overcoming challenges\n- 📅 Adjusting your schedule\n- 📚 Resources and materials\n- 🎯 Setting milestones\n\nWhat would you like to know?`;
  }
}
