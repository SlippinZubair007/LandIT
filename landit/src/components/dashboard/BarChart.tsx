"use client";
import React, { useEffect, useState } from "react";

export const BarChart: React.FC = () => {
  const [data, setData] = useState({
    questions: 0,
    correct: 0,
    incorrect: 0,
  });

  // Generate random data ONLY on the client
  useEffect(() => {
    const randomQuestions = Math.floor(Math.random() * 20) + 5;
    const randomCorrect = Math.floor(Math.random() * randomQuestions);
    const randomIncorrect = randomQuestions - randomCorrect;

    setData({
      questions: randomQuestions,
      correct: randomCorrect,
      incorrect: randomIncorrect,
    });
  }, []);

  const maxValue = Math.max(data.questions, data.correct, data.incorrect) || 1;

  return (
    <div className="w-full h-48 flex items-end justify-center gap-8 px-8">
      {["questions", "correct", "incorrect"].map((key) => (
        <div key={key} className="flex flex-col items-center gap-2">
          <div style={{ height: "160px" }} className="flex items-end">
            <div
              className="w-16 bg-purple-500 rounded-t-lg transition-all min-h-[4px]"
              style={{
                height: `${
                  (data[key as keyof typeof data] / maxValue) * 100
                }%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
};
