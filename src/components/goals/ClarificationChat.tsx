// src/components/goals/ClarificationChat.tsx
'use client';

import { useState } from 'react';
import { ClarificationQuestion } from '@/services/ai.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface ClarificationChatProps {
  goalId: string;
  goalTitle: string;
  questions: ClarificationQuestion[];
  onComplete: (responses: Array<{ questionId: string; answer: string }>) => Promise<void>;
}

export default function ClarificationChat({
  goalId,
  goalTitle,
  questions,
  onComplete,
}: ClarificationChatProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    // Save current answer
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: currentAnswer,
    }));

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer('');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestionId = questions[currentQuestionIndex - 1].id;
      setCurrentAnswer(responses[prevQuestionId] || '');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalResponses = {
        ...responses,
        [currentQuestion.id]: currentAnswer,
      };

      const responsesArray = Object.entries(finalResponses).map(([questionId, answer]) => ({
        questionId,
        answer,
        question: questions.find((q) => q.id === questionId)?.question || '',
      }));

      await onComplete(responsesArray);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">
          Let's understand your goal better
        </h1>
        <p className="text-mediumGray">
          Answer a few questions so I can create the perfect plan for: <strong>{goalTitle}</strong>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-mediumGray mb-2">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-lightGray rounded-full h-2">
          <div
            className="bg-accentBlue rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accentBlue text-white flex items-center justify-center font-bold">
              {currentQuestionIndex + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                {currentQuestion.question}
              </h3>
              <p className="text-sm text-mediumGray italic">
                💡 {currentQuestion.context}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <textarea
              className="input min-h-[120px] w-full"
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleNext();
                }
              }}
              autoFocus
            />
            <p className="text-xs text-mediumGray mt-2">
              Press Ctrl+Enter to submit
            </p>
          </div>
        </div>
      </Card>

      {/* Previous Answers */}
      {currentQuestionIndex > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-mediumGray mb-3">
            Your previous answers:
          </h4>
          <div className="space-y-2">
            {questions.slice(0, currentQuestionIndex).map((q, idx) => (
              <div key={q.id} className="bg-cream border border-lightGray rounded-lg p-3">
                <p className="text-xs text-mediumGray mb-1">
                  Q{idx + 1}: {q.question}
                </p>
                <p className="text-sm text-charcoal">{responses[q.id]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {currentQuestionIndex > 0 && (
          <Button variant="secondary" onClick={handleBack}>
            ← Back
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleNext}
          isLoading={loading}
          disabled={!currentAnswer.trim()}
          className="flex-1"
        >
          {isLastQuestion ? '✨ Generate My Plan' : 'Next Question →'}
        </Button>
      </div>
    </div>
  );
}
