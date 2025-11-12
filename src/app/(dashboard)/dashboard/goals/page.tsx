// src/app/(dashboard)/dashboard/goals/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Goal } from '@/types/goal.types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true;
    return goal.status.toLowerCase() === filter;
  });

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === 'ACTIVE').length,
    completed: goals.filter((g) => g.status === 'COMPLETED').length,
    paused: goals.filter((g) => g.status === 'PAUSED').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue mx-auto mb-4"></div>
        <p className="text-mediumGray">Loading goals...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">All Goals</h1>
          <p className="text-mediumGray">Manage and track all your learning goals</p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button variant="primary">+ Create New Goal</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-sm text-mediumGray mb-1">Total Goals</p>
          <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-mediumGray mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-mediumGray mb-1">Completed</p>
          <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-mediumGray mb-1">Paused</p>
          <p className="text-3xl font-bold text-gray-600">{stats.paused}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['all', 'active', 'completed', 'paused'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-accentBlue text-white'
                : 'bg-lightGray text-charcoal hover:bg-mediumGray hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-charcoal mb-2">
            {filter === 'all' ? 'No Goals Yet' : `No ${filter} Goals`}
          </h3>
          <p className="text-mediumGray mb-6">
            {filter === 'all'
              ? 'Create your first goal to get started'
              : `You don't have any ${filter} goals at the moment`}
          </p>
          <Link href="/dashboard/goals/new">
            <Button variant="primary" className="inline-flex">
              Create New Goal
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <Link href={`/dashboard/goals/${goal.id}`} key={goal.id}>
              <Card hover className="h-full flex flex-col">
                {/* Goal Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-charcoal mb-1">
                      {goal.title}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : goal.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-700'
                          : goal.status === 'PAUSED'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="text-3xl">
                    {goal.goalType === 'ACADEMIC'
                      ? '📚'
                      : goal.goalType === 'SKILL'
                      ? '💻'
                      : goal.goalType === 'FITNESS'
                      ? '💪'
                      : goal.goalType === 'CAREER'
                      ? '💼'
                      : goal.goalType === 'CREATIVE'
                      ? '🎨'
                      : '🎯'}
                  </div>
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-sm text-mediumGray mb-4 line-clamp-2 flex-1">
                    {goal.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-mediumGray mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round(goal.currentProgress)}%</span>
                  </div>
                  <div className="w-full bg-lightGray rounded-full h-2">
                    <div
                      className="bg-accentBlue rounded-full h-2 transition-all"
                      style={{ width: `${goal.currentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lightGray">
                  <div>
                    <p className="text-xs text-mediumGray">Duration</p>
                    <p className="text-sm font-semibold text-charcoal">
                      {goal.totalDuration} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-mediumGray">Daily Hours</p>
                    <p className="text-sm font-semibold text-charcoal">
                      {goal.hoursPerDay}h
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 text-xs text-mediumGray">
                  <p>
                    {new Date(goal.startDate).toLocaleDateString()} →{' '}
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
