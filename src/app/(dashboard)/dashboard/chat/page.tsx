// src/app/(dashboard)/dashboard/chat/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import Card from '@/components/ui/Card';
import { Goal } from '@/types/goal.types';

export default function ChatPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const goalIdFromUrl = searchParams.get('goalId');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      const activeGoals = data.goals.filter((g: Goal) => g.status === 'ACTIVE');
      setGoals(activeGoals);

      // Auto-select goal from URL or first active goal
      if (goalIdFromUrl) {
        const goal = activeGoals.find((g: Goal) => g.id === goalIdFromUrl);
        if (goal) setSelectedGoal(goal);
      } else if (activeGoals.length > 0) {
        setSelectedGoal(activeGoals[0]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue mx-auto mb-4"></div>
        <p className="text-mediumGray">Loading chat...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-charcoal mb-2">No Active Goals</h2>
        <p className="text-mediumGray">
          Create a goal first to chat with your AI mentor
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-charcoal mb-2">AI Mentor Chat</h1>
        <p className="text-mediumGray">
          Get personalized guidance and support for your goals
        </p>
      </div>

      {/* Goal Selector */}
      {goals.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-charcoal mb-2">
            Select a goal to discuss:
          </label>
          <select
            className="input w-full md:w-96"
            value={selectedGoal?.id || ''}
            onChange={(e) => {
              const goal = goals.find((g) => g.id === e.target.value);
              if (goal) setSelectedGoal(goal);
            }}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chat Interface */}
      {selectedGoal && (
        <ChatInterface goalId={selectedGoal.id} goalTitle={selectedGoal.title} />
      )}
    </div>
  );
}
