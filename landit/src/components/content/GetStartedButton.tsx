import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

export const GetStartedButton: React.FC = () => (
  <Button variant="outline" className="flex items-center gap-2">
    <Calendar size={18} />
    Get Started
  </Button>
);