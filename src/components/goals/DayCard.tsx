// src/components/goals/DayCard.tsx
'use client';

import { useState } from 'react';
import { DayPlan } from '@/types/plan.types';
import Card from '@/components/ui/Card';

interface DayCardProps {
  day: DayPlan;
  isToday?: boolean;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export default function DayCard({ day, isToday = false, onTaskToggle }: DayCardProps) {
  const [expanded, setExpanded] = useState(isToday);

  const completedTasks = day.tasks.filter((t) => t.completed).length;
  const progressPercent = (completedTasks / day.tasks.length) * 100;

  return (
    <div
      className={`mb-3 ${
        isToday ? 'ring-2 ring-accentBlue' : ''
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className={`p-4 rounded-lg border-2 transition-all ${
          isToday 
            ? 'border-accentBlue bg-cream' 
            : day.completed
            ? 'border-green-300 bg-green-50'
            : 'border-lightGray bg-white hover:border-mediumGray'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Day indicator */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                isToday
                  ? 'bg-accentBlue text-white'
                  : day.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-lightGray text-charcoal'
              }`}>
                {day.dayNumber}
              </div>

              {/* Day info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-charcoal">
                    {day.title}
                  </h4>
                  {isToday && (
                    <span className="px-2 py-1 bg-accentBlue text-white text-xs rounded-full">
                      TODAY
                    </span>
                  )}
                </div>
                <p className="text-sm text-mediumGray">{day.focus}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-mediumGray">Tasks</p>
                <p className="text-sm font-semibold text-charcoal">
                  {completedTasks}/{day.tasks.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mediumGray">Hours</p>
                <p className="text-sm font-semibold text-charcoal">{day.totalHours}h</p>
              </div>
              <svg
                className={`w-5 h-5 text-mediumGray transition-transform ${
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

          {/* Progress bar */}
          <div className="mt-3 w-full bg-lightGray rounded-full h-1.5">
            <div
              className={`rounded-full h-1.5 transition-all ${
                day.completed ? 'bg-green-500' : 'bg-accentBlue'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Expanded tasks */}
      {expanded && (
        <div className="mt-2 ml-14 space-y-2">
          {day.tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-white border border-lightGray rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => onTaskToggle?.(task.id, e.target.checked)}
                  className="mt-1 h-5 w-5 text-accentBlue rounded border-mediumGray focus:ring-accentBlue"
                />
                <div className="flex-1">
                  <h5 className={`font-medium ${
                    task.completed ? 'line-through text-mediumGray' : 'text-charcoal'
                  }`}>
                    {task.title}
                  </h5>
                  <p className="text-sm text-mediumGray mt-1">{task.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-mediumGray">
                    <span>⏱️ {task.duration}h</span>
                    {task.timeBlock && <span>🕐 {task.timeBlock}</span>}
                    {task.resources && task.resources.length > 0 && (
                      <span>📚 {task.resources.length} resources</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
