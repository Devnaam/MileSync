// src/app/(dashboard)/dashboard/goals/[goalId]/clarify/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClarificationQuestion } from '@/services/ai.service';
import ClarificationChat from '@/components/goals/ClarificationChat';

export default function ClarifyGoalPage() {
    const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
    const [goalTitle, setGoalTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const params = useParams();
    const goalId = params.goalId as string;

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            // Get goal details first
            const goalResponse = await fetch(`/api/goals`);
            const goalData = await goalResponse.json();
            const goal = goalData.goals.find((g: any) => g.id === goalId);

            if (goal) {
                setGoalTitle(goal.title);
            }

            // Get clarification questions
            const response = await fetch(`/api/goals/${goalId}/clarify`);

            if (!response.ok) {
                throw new Error('Failed to generate questions');
            }

            const data = await response.json();
            setQuestions(data.questions);
        } catch (error: any) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (responses: Array<{ questionId: string; answer: string }>) => {
        try {
            console.log('💾 Submitting clarification responses...');

            // Save responses
            const response = await fetch(`/api/goals/${goalId}/clarify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ responses }),
            });

            if (!response.ok) {
                throw new Error('Failed to save responses');
            }

            console.log('✅ Responses saved');
            console.log('🎯 Generating plan...');

            // Generate plan
            const planResponse = await fetch(`/api/goals/${goalId}/plan`, {
                method: 'POST',
            });

            if (!planResponse.ok) {
                throw new Error('Failed to generate plan');
            }

            console.log('✅ Plan generated successfully');

            // Redirect to goal detail page
            router.push(`/dashboard/goals/${goalId}`);
        } catch (error: any) {
            console.error('Error:', error);
            alert(`Failed: ${error.message}. Please try again.`);
        }
    };


    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accentBlue mx-auto mb-4"></div>
                <p className="text-mediumGray">Preparing questions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button onClick={() => router.back()} className="text-accentBlue">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <ClarificationChat
            goalId={goalId}
            goalTitle={goalTitle}
            questions={questions}
            onComplete={handleComplete}
        />
    );
}
