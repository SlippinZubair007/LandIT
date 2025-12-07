"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import ResumeUploadSection from "../../components/resume/ResumeUploadSection";

export default function ResumeClient() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const jobs = useQuery(
    api.jobDescriptions.getAllJobDescriptions,
    user ? { userId: user.id } : "skip"
  );

  const resumes = useQuery(
    api.resume.getResumesByJob,
    user && jobId ? { userId: user.id, jobDescriptionId: jobId } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 via-purple-200 to-white dark:from-purple-900 dark:via-purple-700 dark:to-black transition-colors duration-300">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 via-purple-200 to-white dark:from-purple-900 dark:via-purple-700 dark:to-black transition-colors duration-300">
        <div className="text-gray-600 dark:text-gray-300">Please sign in to continue</div>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-700 via-purple-200 to-white dark:from-purple-900 dark:via-purple-700 dark:to-black transition-colors duration-300 p-10 -mt-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Select a Job Description
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Choose a job to analyze your resume against
            </p>

            {jobs && jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.map((job: any) => (
                  <a
                    key={job._id}
                    href={`/resume?jobId=${job._id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    {job.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.company}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No job descriptions found
                </p>
                <a
                  href="/job-description"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                >
                  Create a job description first →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const selectedJob = jobs?.find((j) => j._id === jobId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Resume Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload your resume for{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {selectedJob?.title || "this position"}
            </span>
          </p>
        </div>

        <ResumeUploadSection
          userId={user.id}
          jobDescriptionId={jobId}
          resumes={resumes || []}
        />
      </div>
    </div>
  );
}
