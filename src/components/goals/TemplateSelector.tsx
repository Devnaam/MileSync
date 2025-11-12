// src/components/goals/TemplateSelector.tsx
'use client';

import { useState } from 'react';
import { GoalTemplate } from '@/types/goal.types';
import Card from '@/components/ui/Card';

interface TemplateSelectorProps {
  templates: GoalTemplate[];
  onSelect: (template: GoalTemplate) => void;
  selectedId?: string;
}

export default function TemplateSelector({
  templates,
  onSelect,
  selectedId,
}: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className="text-left transition-all"
        >
          <Card
            hover
            className={`h-full ${
              selectedId === template.id
                ? 'ring-2 ring-accentBlue border-accentBlue'
                : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="text-5xl">{template.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-charcoal mb-2">
                  {template.name}
                </h3>
                <p className="text-mediumGray text-sm mb-4">
                  {template.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-xs text-mediumGray">
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{template.defaultDuration} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏰</span>
                    <span>{template.defaultHoursPerDay}h/day</span>
                  </div>
                </div>

                {/* Example */}
                <div className="mt-4 pt-4 border-t border-lightGray">
                  <p className="text-xs text-mediumGray">
                    <span className="font-semibold">Example:</span>{' '}
                    {template.example}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedId === template.id && (
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-accentBlue flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
