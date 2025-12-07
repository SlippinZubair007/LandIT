"use client";
import { Suspense } from "react";
import AnalysisContent from "./AnalysisContent"; // We'll move your original page code here

export const dynamic = "force-dynamic";

export default function AnalysisPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
