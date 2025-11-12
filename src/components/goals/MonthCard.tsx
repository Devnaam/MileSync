// src/components/goals/MonthCard.tsx
'use client';

import { useState } from 'react';
import { MonthPlan } from '@/types/plan.types';
import WeekCard from './WeekCard';

interface MonthCardProps {
  month: MonthPlan;
  currentDate?: Date;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export default function MonthCard({ month, currentDate, onTaskToggle }: MonthCardProps) {
  const [expanded, setExpanded] = useState(true); // Expanded by default

  const completedWeeks = month.weeks.filter((w) => 
    w.days.every((d) => d.completed)
  ).length;
  const progressPercent = (completedWeeks / month.weeks.length) * 100;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="p-6 rounded-xl bg-gradient-to-r from-cream to-white border-2 border-accentBlue hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-accentBlue flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{month.monthNumber}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-charcoal">{month.title}</h2>
                <p className="text-mediumGray mt-1">{month.milestone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-mediumGray">Progress</p>
                <p className="text-2xl font-bold text-accentBlue">
                  {Math.round(progressPercent)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-mediumGray">Weeks</p>
                <p className="text-2xl font-bold text-charcoal">
                  {completedWeeks}/{month.weeks.length}
                </p>
              </div>
              <svg
                className={`w-8 h-8 text-accentBlue transition-transform ${
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

          <div className="w-full bg-lightGray rounded-full h-3">
            <div
              className="bg-accentBlue rounded-full h-3 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-mediumGray">
            <span>📅 {month.startDate} → {month.endDate}</span>
            <span>⏱️ {month.totalHours} total hours</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 ml-8 space-y-4">
          {month.weeks.map((week) => (
            <WeekCard
              key={week.weekNumber}
              week={week}
              currentDate={currentDate}
              onTaskToggle={onTaskToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
