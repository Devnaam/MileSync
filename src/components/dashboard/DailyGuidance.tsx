// src/components/dashboard/DailyGuidance.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
}

interface TodaysGuidance {
  goalId: string;
  goalTitle: string;
  goalType: string;
  todaysTasks: {
    dayNumber: number;
    title: string;
    focus: string;
    tasks: DailyTask[];
    totalHours: number;
  } | null;
}

export default function DailyGuidance() {
  const [guidance, setGuidance] = useState<TodaysGuidance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      const response = await fetch('/api/daily-guidance');
      const data = await response.json();
      
      if (data.guidance) {
        setGuidance(data.guidance);
      }
    } catch (error) {
      console.error('Error fetching guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-32 bg-lightGray rounded"></div>
      </Card>
    );
  }

  if (guidance.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-6xl mb-4">📅</p>
          <h3 className="text-lg font-semibold text-charcoal mb-2">
            No Tasks Scheduled for Today
          </h3>
          <p className="text-sm text-mediumGray">
            Looks like you're ahead of schedule or haven't started yet!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {guidance.map((item) => {
        if (!item.todaysTasks) return null;

        const { goalId, goalTitle, todaysTasks } = item;
        const completedTasks = todaysTasks.tasks.filter((t) => t.completed).length;

        return (
          <Card key={goalId} className="bg-gradient-to-r from-cream to-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-charcoal">{goalTitle}</h3>
                  <span className="px-2 py-1 bg-accentBlue text-white text-xs rounded-full">
                    Day {todaysTasks.dayNumber}
                  </span>
                </div>
                <p className="text-mediumGray text-sm mb-1">
                  <span className="font-semibold">Focus:</span> {todaysTasks.focus}
                </p>
                <p className="text-mediumGray text-sm">
                  <span className="font-semibold">Today:</span> {todaysTasks.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accentBlue">
                  {todaysTasks.totalHours}h
                </p>
                <p className="text-xs text-mediumGray">Total time</p>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-2 mb-4">
              {todaysTasks.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-lightGray"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accentBlue text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-charcoal">{task.title}</h4>
                    <p className="text-sm text-mediumGray">{task.description}</p>
                    <p className="text-xs text-mediumGray mt-1">⏱️ {task.duration}h</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-mediumGray mb-1">
                <span>Progress</span>
                <span>
                  {completedTasks}/{todaysTasks.tasks.length} tasks
                </span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-2">
                <div
                  className="bg-accentBlue rounded-full h-2 transition-all"
                  style={{
                    width: `${(completedTasks / todaysTasks.tasks.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Action */}
            <Link href={`/dashboard/goals/${goalId}`}>
              <Button variant="primary" className="w-full">
                View Full Plan →
              </Button>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
