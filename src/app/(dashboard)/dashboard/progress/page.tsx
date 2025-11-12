// src/app/(dashboard)/dashboard/progress/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Goal } from '@/types/goal.types';
import Card from '@/components/ui/Card';

interface ProgressLog {
  id: string;
  goalId: string;
  logDate: Date;
  tasksCompleted: number;
  totalTasks: number;
  hoursLogged: number;
  completionRate: number;
  notes: string | null;
  blockers: string | null;
}

export default function ProgressPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      const data = await response.json();
      const activeGoals = data.goals.filter((g: Goal) => g.status === 'ACTIVE');
      setGoals(activeGoals);

      if (activeGoals.length > 0) {
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
        <p className="text-mediumGray">Loading progress...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-charcoal mb-8">Progress Tracking</h1>
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-charcoal mb-2">No Active Goals</h3>
          <p className="text-mediumGray">
            Create a goal to start tracking your progress
          </p>
        </Card>
      </div>
    );
  }

  const calculateStreak = () => {
    // Calculate current streak (consecutive days)
    return 0; // Placeholder
  };

  const getTotalHoursLogged = () => {
    return logs.reduce((sum, log) => sum + log.hoursLogged, 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Progress Tracking</h1>
        <p className="text-mediumGray">Monitor your learning journey and celebrate wins</p>
      </div>

      {/* Goal Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-charcoal mb-2">
          Select Goal:
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

      {selectedGoal && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-sm text-mediumGray mb-2">Overall Progress</p>
                <p className="text-4xl font-bold text-accentBlue">
                  {Math.round(selectedGoal.currentProgress)}%
                </p>
                <div className="mt-3 w-full bg-lightGray rounded-full h-2">
                  <div
                    className="bg-accentBlue rounded-full h-2 transition-all"
                    style={{ width: `${selectedGoal.currentProgress}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-sm text-mediumGray mb-2">Current Streak</p>
                <p className="text-4xl font-bold text-green-600">
                  {calculateStreak()}
                </p>
                <p className="text-xs text-mediumGray mt-2">days in a row</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-sm text-mediumGray mb-2">Total Hours</p>
                <p className="text-4xl font-bold text-purple-600">
                  {getTotalHoursLogged()}h
                </p>
                <p className="text-xs text-mediumGray mt-2">logged</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-sm text-mediumGray mb-2">Days Remaining</p>
                <p className="text-4xl font-bold text-orange-600">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(selectedGoal.targetDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                </p>
                <p className="text-xs text-mediumGray mt-2">until target date</p>
              </div>
            </Card>
          </div>

          {/* Goal Info */}
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-charcoal mb-4">{selectedGoal.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-mediumGray">Type</p>
                <p className="font-semibold text-charcoal capitalize">
                  {selectedGoal.goalType.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-mediumGray">Duration</p>
                <p className="font-semibold text-charcoal">
                  {selectedGoal.totalDuration} days
                </p>
              </div>
              <div>
                <p className="text-sm text-mediumGray">Daily Commitment</p>
                <p className="font-semibold text-charcoal">
                  {selectedGoal.hoursPerDay}h/day
                </p>
              </div>
              <div>
                <p className="text-sm text-mediumGray">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedGoal.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedGoal.status}
                </span>
              </div>
            </div>
          </Card>

          {/* Progress Logs */}
          <Card>
            <h3 className="text-xl font-bold text-charcoal mb-4">Recent Activity</h3>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📝</div>
                <p className="text-mediumGray">No progress logged yet</p>
                <p className="text-sm text-mediumGray mt-2">
                  Start completing tasks to see your activity here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-cream rounded-lg border border-lightGray"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-charcoal">
                        {new Date(log.logDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <span className="text-sm font-semibold text-accentBlue">
                        {Math.round(log.completionRate)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-mediumGray">Tasks Completed</p>
                        <p className="font-semibold text-charcoal">
                          {log.tasksCompleted}/{log.totalTasks}
                        </p>
                      </div>
                      <div>
                        <p className="text-mediumGray">Hours Logged</p>
                        <p className="font-semibold text-charcoal">{log.hoursLogged}h</p>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="mt-3 pt-3 border-t border-lightGray">
                        <p className="text-sm text-mediumGray">Notes: {log.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
