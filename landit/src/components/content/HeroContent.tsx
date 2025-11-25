import React from 'react';
import { useTheme } from '../common/ThemeContext';

export const HeroTitle: React.FC = () => {
  const { isDark } = useTheme();
  
  return (
    <>
      Land your dream job with{' '}
      <span className={isDark ? 'text-purple-300' : 'text-purple-900'}>
        AI-powered
      </span>
      <br />
      job preparation
    </>
  );
};
export const HeroDescription: React.FC = () => (
  <>
    Skip the guesswork and accelerate your job search.
    Our AI platform eliminates interview anxiety, optimizes
    your resume, and gives you the technical edge to land offers faster.
  </>
);