// src/app/(dashboard)/dashboard/goals/[goalId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Goal } from '@/types/goal.types';
import { GoalPlanStructure } from '@/types/plan.types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PlanTreeView from '@/components/goals/PlanTreeView';

export default function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [plan, setPlan] = useState<GoalPlanStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  useEffect(() => {
    fetchGoalAndPlan();
  }, []);

  const fetchGoalAndPlan = async () => {
    try {
      // Fetch goal
      const goalsResponse = await fetch('/api/goals');
      const goalsData = await goalsResponse.json();
      const foundGoal = goalsData.goals.find((g: Goal) => g.id === goalId);

      if (!foundGoal) {
        throw new Error('Goal not found');
      }

      setGoal(foundGoal);

      // Fetch plan
      try {
        const planResponse = await fetch(`/api/goals/${goalId}/plan`);
        if (planResponse.ok) {
          const planData = await planResponse.json();
          setPlan(planData.plan);
        }
      } catch (err) {
        console.log('No plan yet');
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    console.log('Task toggle:', taskId, completed);
    // TODO: Implement task completion tracking
    // For now, just log it
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue mx-auto mb-4"></div>
        <p className="text-mediumGray">Loading goal...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Goal not found</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-accentBlue mb-4 hover:underline flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-charcoal mb-2">{goal.title}</h1>
        {goal.description && (
          <p className="text-lg text-mediumGray">{goal.description}</p>
        )}
      </div>

      {/* Goal Info Card */}
      <Card className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-mediumGray mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              goal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              goal.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {goal.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-mediumGray mb-1">Duration</p>
            <p className="text-lg font-semibold text-charcoal">{goal.totalDuration} days</p>
          </div>
          <div>
            <p className="text-sm text-mediumGray mb-1">Daily Hours</p>
            <p className="text-lg font-semibold text-charcoal">{goal.hoursPerDay}h</p>
          </div>
          <div>
            <p className="text-sm text-mediumGray mb-1">Start Date</p>
            <p className="text-lg font-semibold text-charcoal">
              {new Date(goal.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-mediumGray mb-1">Target Date</p>
            <p className="text-lg font-semibold text-charcoal">
              {new Date(goal.targetDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-lightGray">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-mediumGray">Overall Progress</span>
            <span className="text-lg font-bold text-accentBlue">
              {Math.round(goal.currentProgress)}%
            </span>
          </div>
          <div className="w-full bg-lightGray rounded-full h-4">
            <div
              className="bg-accentBlue rounded-full h-4 transition-all"
              style={{ width: `${goal.currentProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Plan Section */}
      {plan ? (
        <PlanTreeView plan={plan} onTaskToggle={handleTaskToggle} />
      ) : (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-charcoal mb-2">No Plan Generated Yet</h3>
          <p className="text-mediumGray mb-6">
            Generate a detailed learning plan to get started
          </p>
          <Button
            onClick={() => router.push(`/dashboard/goals/${goalId}/clarify`)}
            variant="primary"
          >
            Generate Plan Now
          </Button>
        </Card>
      )}
    </div>
  );
}
