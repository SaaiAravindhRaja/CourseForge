'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Bot,
  Brain,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  ArrowRight,
  Zap,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WelcomeHeroProps {
  onDemoClick: () => void;
}

const FEATURES = [
  { icon: Brain, text: 'Curriculum Design', color: 'text-purple-500' },
  { icon: PenTool, text: 'Lesson Writing', color: 'text-green-500' },
  { icon: ClipboardCheck, text: 'Quiz Generation', color: 'text-amber-500' },
  { icon: Lightbulb, text: 'Interactive Activities', color: 'text-pink-500' },
  { icon: Video, text: 'Video Scripts', color: 'text-cyan-500' },
];

const STATS = [
  { value: '6', label: 'AI Agents' },
  { value: '20+', label: 'Tools' },
  { value: '3', label: 'Gemini Models' },
];

export function WelcomeHero({ onDemoClick }: WelcomeHeroProps) {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 via-purple-500/20 to-pink-500/30 animate-pulse" />
        <div className="relative p-6 bg-gradient-to-br from-primary to-primary/60 rounded-3xl shadow-2xl shadow-primary/30">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
        {/* Orbiting icons */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
          {FEATURES.map((feature, i) => {
            const angle = (i * 72) * (Math.PI / 180);
            const x = Math.cos(angle) * 70;
            const y = Math.sin(angle) * 70;
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                  activeFeature === i ? 'scale-125 opacity-100' : 'scale-100 opacity-40'
                }`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <div className={`p-2 rounded-lg bg-background shadow-lg ${activeFeature === i ? 'ring-2 ring-primary' : ''}`}>
                  <Icon className={`h-4 w-4 ${feature.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
        CourseForge
      </h1>
      <p className="text-lg text-muted-foreground mb-2">
        Transform any document into a complete course
      </p>

      {/* Rotating feature text */}
      <div className="h-8 mb-6 overflow-hidden">
        <div
          className="transition-transform duration-500"
          style={{ transform: `translateY(-${activeFeature * 32}px)` }}
        >
          {FEATURES.map((feature, i) => (
            <div key={i} className="h-8 flex items-center justify-center gap-2">
              <feature.icon className={`h-4 w-4 ${feature.color}`} />
              <span className={`font-medium ${feature.color}`}>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25"
        >
          <Upload className="h-5 w-5" />
          Upload Document
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onDemoClick}
          className="gap-2 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10"
        >
          <Zap className="h-5 w-5 text-amber-500" />
          Quick Demo
        </Button>
      </div>

      {/* How it works */}
      <div className="max-w-2xl">
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">How it works</h3>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>Upload</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <Bot className="h-4 w-4 text-primary" />
            <span>AI Analyzes</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <GraduationCap className="h-4 w-4 text-green-500" />
            <span>Course Ready</span>
          </div>
        </div>
      </div>

      {/* Tech badge */}
      <div className="mt-8 flex items-center gap-2">
        <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1">
          <Zap className="h-3 w-3 text-amber-500" />
          Powered by Google Gemini
        </Badge>
        <Badge variant="outline" className="text-xs">
          Gemini API Hackathon 2025
        </Badge>
      </div>
    </div>
  );
}
