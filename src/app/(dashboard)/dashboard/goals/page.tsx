// src/app/(dashboard)/dashboard/goals/page.tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function GoalsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">My Goals</h1>
          <p className="text-mediumGray">Manage all your goals in one place</p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button variant="primary">+ Create New Goal</Button>
        </Link>
      </div>

      <Card className="text-center py-12">
        <p className="text-mediumGray">Goals list coming soon...</p>
      </Card>
    </div>
  );
}
