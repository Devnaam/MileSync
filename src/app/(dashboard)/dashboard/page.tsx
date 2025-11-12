// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DailyGuidance from '@/components/dashboard/DailyGuidance';
import { Goal } from '@/types/goal.types';

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      setError(error.message);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={fetchGoals}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Dashboard</h1>
          <p className="text-mediumGray">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button variant="primary">+ Create New Goal</Button>
        </Link>
      </div>

      {/* Empty State */}
      {goals.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">No Goals Yet</h2>
          <p className="text-mediumGray mb-6 max-w-md mx-auto">
            Start your journey by creating your first goal. Choose from our templates
            and let AI break it down into daily actionable tasks.
          </p>
          <Link href="/dashboard/goals/new">
            <Button variant="primary" className="inline-flex">
              Create Your First Goal
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Guidance */}
            <div>
              <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center">
                <span className="text-2xl mr-2">✨</span>
                What Should I Do Today?
              </h2>
              <DailyGuidance />
            </div>

            {/* Goals List */}
            <div>
              <h2 className="text-xl font-bold text-charcoal mb-4">Your Goals</h2>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Link href={`/dashboard/goals/${goal.id}`} key={goal.id}>
                    <Card hover>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-charcoal flex-1">
                          {goal.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                            goal.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : goal.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {goal.status}
                        </span>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-mediumGray mb-3 line-clamp-2">
                          {goal.description}
                        </p>
                      )}

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
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <h3 className="text-lg font-bold text-charcoal mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-mediumGray">Active Goals</p>
                    <p className="text-2xl font-bold text-charcoal">
                      {goals.filter((g) => g.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-lightGray">
                  <div>
                    <p className="text-sm text-mediumGray">Avg Progress</p>
                    <p className="text-2xl font-bold text-charcoal">
                      {goals.length > 0
                        ? Math.round(
                            goals.reduce((sum, g) => sum + g.currentProgress, 0) /
                              goals.length
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-lightGray">
                  <div>
                    <p className="text-sm text-mediumGray">Completed</p>
                    <p className="text-2xl font-bold text-charcoal">
                      {goals.filter((g) => g.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-bold text-charcoal mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/goals/new">
                  <button className="w-full p-3 text-left rounded-lg bg-cream hover:bg-opacity-80 transition-all">
                    <p className="font-medium text-charcoal">➕ Create New Goal</p>
                  </button>
                </Link>
                <Link href="/dashboard/progress">
                  <button className="w-full p-3 text-left rounded-lg bg-cream hover:bg-opacity-80 transition-all">
                    <p className="font-medium text-charcoal">📈 View Progress</p>
                  </button>
                </Link>
                <Link href="/dashboard/chat">
                  <button className="w-full p-3 text-left rounded-lg bg-cream hover:bg-opacity-80 transition-all">
                    <p className="font-medium text-charcoal">💬 Chat with AI</p>
                  </button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
