// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Goal {
  id: string;
  title: string;
  goalType: string;
  status: string;
  currentProgress: number;
  targetDate: string;
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
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
        <p className="text-mediumGray">Loading your goals...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Dashboard</h1>
          <p className="text-mediumGray">Track your goals and daily progress</p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button variant="primary">
            + Create New Goal
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">No Goals Yet</h2>
          <p className="text-mediumGray mb-6">
            Start your journey by creating your first goal
          </p>
          <Link href="/dashboard/goals/new">
            <Button variant="primary">Create Your First Goal</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mediumGray mb-1">Active Goals</p>
                  <p className="text-3xl font-bold text-charcoal">
                    {goals.filter(g => g.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mediumGray mb-1">Avg Progress</p>
                  <p className="text-3xl font-bold text-charcoal">
                    {Math.round(
                      goals.reduce((sum, g) => sum + g.currentProgress, 0) / goals.length
                    )}%
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mediumGray mb-1">Completed</p>
                  <p className="text-3xl font-bold text-charcoal">
                    {goals.filter(g => g.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </Card>
          </div>

          {/* Goals List */}
          <div>
            <h2 className="text-xl font-bold text-charcoal mb-4">Your Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <Link href={`/dashboard/goals/${goal.id}`} key={goal.id}>
                  <Card hover>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-charcoal">{goal.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        goal.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-mediumGray mb-2">
                        <span>Progress</span>
                        <span>{Math.round(goal.currentProgress)}%</span>
                      </div>
                      <div className="w-full bg-lightGray rounded-full h-2">
                        <div
                          className="bg-accentBlue rounded-full h-2 transition-all"
                          style={{ width: `${goal.currentProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-mediumGray capitalize">
                        {goal.goalType.toLowerCase()}
                      </span>
                      <span className="text-mediumGray">
                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
