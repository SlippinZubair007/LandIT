// ============================================
// FILE PATH: src/app/interview/page.tsx
// ============================================
// Create this NEW file - Main interview page

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import InterviewStart from "@/components/interview/InterviewStart";
import InterviewSession from "@/components/interview/InterviewSession";
import InterviewHistory from "@/components/interview/InterviewHistory";

export default function InterviewPage() {
  const { user } = useUser();
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const interviewHistory = useQuery(
    api.interview.getInterviewHistory,
    user ? { userId: user.id } : "skip"
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 via-purple-200 to-white dark:from-purple-900 dark:via-purple-700 dark:to-black
      transition-colors duration-300">
        <div className="text-gray-600">Please sign in to access interviews</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 via-purple-200 to-white dark:from-purple-900 dark:via-purple-700 dark:to-black
      transition-colors duration-300">

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 -mt-6">
        {activeInterviewId ? (
          <InterviewSession
            interviewId={activeInterviewId}
            userId={user.id}
            onComplete={() => setActiveInterviewId(null)}
          />
        ) : showHistory ? (
          <InterviewHistory
            history={interviewHistory || []}
            onBack={() => setShowHistory(false)}
          />
        ) : (
          <InterviewStart
            userId={user.id}
            onStartInterview={setActiveInterviewId}
            onShowHistory={() => setShowHistory(true)}
            hasHistory={(interviewHistory?.length || 0) > 0}
          />
        )}
      </main>
    </div>
  );
}