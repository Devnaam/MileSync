// src/components/goals/GoalForm.tsx
'use client';

import { useState } from 'react';
import { GoalTemplate, GoalFormData } from '@/types/goal.types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface GoalFormProps {
  template: GoalTemplate;
  onSubmit: (data: GoalFormData) => Promise<void>;
  onBack: () => void;
}

export default function GoalForm({ template, onSubmit, onBack }: GoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate default dates
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + template.defaultDuration);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: today.toISOString().split('T')[0],
    targetDate: defaultEndDate.toISOString().split('T')[0],
    hoursPerDay: template.defaultHoursPerDay,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.hoursPerDay < 0.5 || formData.hoursPerDay > 12) {
      newErrors.hoursPerDay = 'Hours per day must be between 0.5 and 12';
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.targetDate);
    if (end <= start) {
      newErrors.targetDate = 'Target date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const goalData: GoalFormData = {
        title: formData.title,
        description: formData.description,
        goalType: template.type,
        startDate: new Date(formData.startDate),
        targetDate: new Date(formData.targetDate),
        hoursPerDay: Number(formData.hoursPerDay),
      };

      await onSubmit(goalData);
    } catch (error) {
      console.error('Goal creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDays = Math.ceil(
    (new Date(formData.targetDate).getTime() -
      new Date(formData.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalHours = totalDays * formData.hoursPerDay;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Info */}
      <div className="card bg-cream border-accentBlue">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{template.icon}</span>
          <div>
            <h3 className="font-bold text-charcoal">{template.name}</h3>
            <p className="text-sm text-mediumGray">{template.description}</p>
          </div>
        </div>
      </div>

      {/* Goal Title */}
      <div>
        <Input
          label="Goal Title *"
          name="title"
          placeholder="e.g., Learn Full-Stack Development"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
        />
        <p className="mt-1 text-xs text-mediumGray">
          Be specific about what you want to achieve
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Description (Optional)
        </label>
        <textarea
          name="description"
          className="input min-h-[100px]"
          placeholder="Add more details about your goal, resources, or specific outcomes..."
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date *"
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
        />
        <Input
          label="Target Date *"
          type="date"
          name="targetDate"
          value={formData.targetDate}
          onChange={handleChange}
          error={errors.targetDate}
        />
      </div>

      {/* Hours Per Day */}
      <div>
        <Input
          label="Daily Commitment (hours) *"
          type="number"
          step="0.5"
          min="0.5"
          max="12"
          name="hoursPerDay"
          value={formData.hoursPerDay}
          onChange={handleChange}
          error={errors.hoursPerDay}
        />
        <p className="mt-1 text-xs text-mediumGray">
          How many hours can you dedicate per day?
        </p>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-cream to-white">
        <h4 className="font-semibold text-charcoal mb-3">Goal Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-accentBlue">{totalDays}</p>
            <p className="text-xs text-mediumGray">Total Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accentBlue">
              {formData.hoursPerDay}h
            </p>
            <p className="text-xs text-mediumGray">Per Day</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accentBlue">{totalHours}h</p>
            <p className="text-xs text-mediumGray">Total Hours</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="button" variant="secondary" onClick={onBack}>
          ← Back to Templates
        </Button>
        <Button type="submit" variant="primary" isLoading={loading} className="flex-1">
          Create Goal →
        </Button>
      </div>
    </form>
  );
}
