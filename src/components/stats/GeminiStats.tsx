'use client';

import { useState, useEffect } from 'react';
import { Zap, Clock, MessageSquare, Cpu, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GeminiStatsProps {
  isGenerating?: boolean;
}

interface Stats {
  totalCalls: number;
  tokensGenerated: number;
  modelsUsed: Set<string>;
  avgResponseTime: number;
  lastCallTime: number;
}

// Global stats tracker
let globalStats: Stats = {
  totalCalls: 0,
  tokensGenerated: 0,
  modelsUsed: new Set(),
  avgResponseTime: 0,
  lastCallTime: 0,
};

export function trackGeminiCall(model: string, tokens: number, responseTime: number) {
  globalStats.totalCalls++;
  globalStats.tokensGenerated += tokens;
  globalStats.modelsUsed.add(model);
  globalStats.avgResponseTime =
    (globalStats.avgResponseTime * (globalStats.totalCalls - 1) + responseTime) / globalStats.totalCalls;
  globalStats.lastCallTime = Date.now();

  // Dispatch custom event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gemini-stats-update', { detail: globalStats }));
  }
}

export function getGeminiStats() {
  return globalStats;
}

export function GeminiStats({ isGenerating }: GeminiStatsProps) {
  const [stats, setStats] = useState<Stats>(globalStats);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    const handleUpdate = (e: CustomEvent<Stats>) => {
      setStats({ ...e.detail, modelsUsed: new Set(e.detail.modelsUsed) });
      setPulseIntensity(100);
    };

    window.addEventListener('gemini-stats-update', handleUpdate as EventListener);

    // Decay pulse effect
    const interval = setInterval(() => {
      setPulseIntensity(prev => Math.max(0, prev - 5));
    }, 100);

    return () => {
      window.removeEventListener('gemini-stats-update', handleUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className={`
      p-3 bg-gradient-to-br from-violet-500/5 to-indigo-500/5
      border-violet-500/20 transition-all duration-300
      ${isGenerating ? 'ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/10' : ''}
    `}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`
          p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500
          ${isGenerating ? 'animate-pulse' : ''}
        `}>
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold">Gemini API Stats</span>
        {isGenerating && (
          <Badge variant="outline" className="ml-auto text-[10px] border-violet-500/30 text-violet-500 animate-pulse">
            LIVE
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
          <div>
            <div className="text-muted-foreground text-[10px]">API Calls</div>
            <div className="font-semibold">{stats.totalCalls}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <div>
            <div className="text-muted-foreground text-[10px]">Tokens</div>
            <div className="font-semibold">{formatNumber(stats.tokensGenerated)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Clock className="h-3.5 w-3.5 text-green-500" />
          <div>
            <div className="text-muted-foreground text-[10px]">Avg Time</div>
            <div className="font-semibold">{stats.avgResponseTime.toFixed(0)}ms</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Cpu className="h-3.5 w-3.5 text-purple-500" />
          <div>
            <div className="text-muted-foreground text-[10px]">Models</div>
            <div className="font-semibold">{stats.modelsUsed.size}</div>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Generating...</span>
            <TrendingUp className="h-3 w-3" />
          </div>
          <Progress value={pulseIntensity} className="h-1" />
        </div>
      )}

      {stats.modelsUsed.size > 0 && (
        <div className="mt-3 pt-3 border-t border-violet-500/10">
          <div className="text-[10px] text-muted-foreground mb-1.5">Models Used</div>
          <div className="flex flex-wrap gap-1">
            {Array.from(stats.modelsUsed).map((model) => (
              <Badge key={model} variant="secondary" className="text-[9px] px-1.5 py-0">
                {model.replace('gemini-', '').replace('-latest', '')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
