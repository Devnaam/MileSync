// src/components/goals/PlanTreeView.tsx
'use client';

import { GoalPlanStructure } from '@/types/plan.types';
import MonthCard from './MonthCard';

interface PlanTreeViewProps {
  plan: GoalPlanStructure;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export default function PlanTreeView({ plan, onTaskToggle }: PlanTreeViewProps) {
  const currentDate = new Date();

  return (
    <div>
      {/* Plan Header */}
      <div className="mb-6 p-6 bg-gradient-to-r from-accentBlue to-blue-600 rounded-xl text-white">
        <h2 className="text-3xl font-bold mb-4">Your Complete Learning Path</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total Months</p>
            <p className="text-3xl font-bold">{plan.totalMonths}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Weeks</p>
            <p className="text-3xl font-bold">{plan.totalWeeks}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Days</p>
            <p className="text-3xl font-bold">{plan.totalDays}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Hours</p>
            <p className="text-3xl font-bold">{plan.totalHours}h</p>
          </div>
        </div>
        <p className="mt-4 text-blue-100 text-sm">
          Generated: {new Date(plan.generatedAt).toLocaleDateString()} • Version {plan.version}
        </p>
      </div>

      {/* Month Cards */}
      <div className="space-y-6">
        {plan.months.map((month) => (
          <MonthCard
            key={month.monthNumber}
            month={month}
            currentDate={currentDate}
            onTaskToggle={onTaskToggle}
          />
        ))}
      </div>
    </div>
  );
}
