// src/components/goals/WeekCard.tsx
'use client';

import { useState } from 'react';
import { WeekPlan } from '@/types/plan.types';
import DayCard from './DayCard';

interface WeekCardProps {
  week: WeekPlan;
  currentDate?: Date;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export default function WeekCard({ week, currentDate, onTaskToggle }: WeekCardProps) {
  const [expanded, setExpanded] = useState(false);

  const completedDays = week.days.filter((d) => d.completed).length;
  const progressPercent = (completedDays / week.days.length) * 100;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="p-4 rounded-lg border-2 border-lightGray bg-white hover:border-mediumGray transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-cream flex items-center justify-center">
                <span className="text-lg font-bold text-charcoal">W{week.weekNumber}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal">{week.title}</h3>
                <p className="text-sm text-mediumGray">{week.objective}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xs text-mediumGray">Progress</p>
                <p className="text-lg font-semibold text-charcoal">
                  {Math.round(progressPercent)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mediumGray">Days</p>
                <p className="text-lg font-semibold text-charcoal">
                  {completedDays}/{week.days.length}
                </p>
              </div>
              <svg
                className={`w-6 h-6 text-mediumGray transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="mt-3 w-full bg-lightGray rounded-full h-2">
            <div
              className="bg-accentBlue rounded-full h-2 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-mediumGray">
            <span>{week.startDate} → {week.endDate}</span>
            <span>{week.totalHours} hours total</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 ml-8 space-y-3">
          {week.days.map((day) => {
            const isToday = currentDate && day.date === currentDate.toISOString().split('T')[0];
            return (
              <DayCard
                key={day.dayNumber}
                day={day}
                isToday={isToday}
                onTaskToggle={onTaskToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
