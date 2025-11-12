// src/app/(dashboard)/dashboard/goals/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoalTemplate, GoalFormData } from '@/types/goal.types';
import { goalTemplates } from '@/lib/templates';
import TemplateSelector from '@/components/goals/TemplateSelector';
import GoalForm from '@/components/goals/GoalForm';

export default function NewGoalPage() {
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const router = useRouter();

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setStep('form');
  };

  const handleBack = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleSubmit = async (data: GoalFormData) => {
    try {
      console.log('Creating goal:', data);

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create goal');
      }

      const { goal } = await response.json();
      console.log('Goal created:', goal);

      // Redirect to dashboard
      router.push(`/dashboard/goals/${goal.id}/clarify`);
    } catch (error: any) {
      console.error('Goal creation error:', error);
      alert(error.message || 'Failed to create goal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Create New Goal</h1>
        <p className="text-mediumGray">
          {step === 'template'
            ? 'Choose a template to get started with a structured plan'
            : 'Fill in the details for your goal'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center mb-8">
        <div className="flex items-center">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step === 'template'
                ? 'bg-accentBlue text-white'
                : 'bg-cream text-charcoal'
            }`}
          >
            1
          </div>
          <span className="ml-3 font-medium text-charcoal">Choose Template</span>
        </div>
        <div className="flex-1 h-1 mx-4 bg-lightGray">
          <div
            className={`h-full transition-all ${
              step === 'form' ? 'w-full bg-accentBlue' : 'w-0'
            }`}
          />
        </div>
        <div className="flex items-center">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              step === 'form'
                ? 'bg-accentBlue text-white'
                : 'bg-lightGray text-mediumGray'
            }`}
          >
            2
          </div>
          <span
            className={`ml-3 font-medium ${
              step === 'form' ? 'text-charcoal' : 'text-mediumGray'
            }`}
          >
            Goal Details
          </span>
        </div>
      </div>

      {/* Content */}
      {step === 'template' && (
        <TemplateSelector
          templates={goalTemplates}
          onSelect={handleTemplateSelect}
          selectedId={selectedTemplate?.id}
        />
      )}

      {step === 'form' && selectedTemplate && (
        <GoalForm
          template={selectedTemplate}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
