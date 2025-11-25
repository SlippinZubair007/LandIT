import React from 'react';
import { Header } from '../layout/Header';
import { Hero } from '../layout/Hero';
import { Logo } from '../content/Logo';
import { ThemeToggle } from '../content/ThemeToggle';
import { GetStartedButton } from '../content/GetStartedButton';
import { HeroTitle, HeroDescription } from '../content/HeroContent';
import { Button } from '../ui/Button';
import { useTheme } from '../common/ThemeContext';

export const HomePage: React.FC = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <Header 
        logo={<Logo />} 
        actions={<><GetStartedButton /><ThemeToggle /></>} 
      />
      <Hero 
        title={<HeroTitle />}
        description={<HeroDescription />}
        cta={<Button>Get Started for Free</Button>}
      />
    </div>
  );
};
