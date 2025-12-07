import { Suspense } from "react";
import ResumeClient from "./ResumeClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeClient />
    </Suspense>
  );
}
