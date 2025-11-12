// src/app/page.tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-charcoal mb-6">
            Transform Goals into
            <span className="text-accentBlue"> Daily Actions</span>
          </h1>
          <p className="text-xl text-mediumGray mb-8 max-w-2xl mx-auto">
            MileSync is your AI-powered mentor that breaks down long-term goals into 
            achievable daily plans, guiding you every step of the way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" className="text-lg px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-3">
                Log In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Smart Goal Breakdown
            </h3>
            <p className="text-mediumGray">
              AI analyzes your goals and creates month → week → day plans automatically
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Daily Guidance
            </h3>
            <p className="text-mediumGray">
              Get personalized "what should I do today?" answers with time-blocked schedules
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Progress Tracking
            </h3>
            <p className="text-mediumGray">
              Monitor your journey with visual progress indicators and weekly reviews
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
