'use client';

import { Progress } from '@/components/ui/progress';
import { useCourseStore } from '@/store/courseStore';
import {
  Upload,
  Search,
  FileText,
  PenTool,
  ClipboardCheck,
  Lightbulb,
  Video,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const STAGES = [
  { key: 'idle', label: 'Ready', icon: Upload },
  { key: 'uploading', label: 'Uploading', icon: Upload },
  { key: 'analyzing', label: 'Analyzing', icon: Search },
  { key: 'outlining', label: 'Creating Outline', icon: FileText },
  { key: 'generating-content', label: 'Writing Content', icon: PenTool },
  { key: 'creating-assessments', label: 'Creating Quizzes', icon: ClipboardCheck },
  { key: 'adding-engagement', label: 'Adding Activities', icon: Lightbulb },
  { key: 'writing-scripts', label: 'Writing Scripts', icon: Video },
  { key: 'finalizing', label: 'Finalizing', icon: CheckCircle },
  { key: 'complete', label: 'Complete', icon: CheckCircle },
] as const;

export function ProgressIndicator() {
  const { stage, progress } = useCourseStore();

  const currentStageIndex = STAGES.findIndex((s) => s.key === stage);
  const stageProgress = Math.max(
    ((currentStageIndex + 1) / STAGES.length) * 100,
    progress
  );

  const currentStage = STAGES.find((s) => s.key === stage) || STAGES[0];
  const StageIcon = currentStage.icon;

  if (stage === 'idle') {
    return null;
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          {stage === 'complete' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <StageIcon className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{currentStage.label}</p>
          <p className="text-xs text-muted-foreground">
            {stage === 'complete'
              ? 'Your course is ready!'
              : 'AI agents are working on your course...'}
          </p>
        </div>
        {stage !== 'complete' && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <Progress value={stageProgress} className="h-2" />
      <div className="flex justify-between mt-2">
        {STAGES.filter((s) => !['idle', 'uploading'].includes(s.key)).map((s, i) => {
          const Icon = s.icon;
          const isActive = s.key === stage;
          const isComplete =
            STAGES.findIndex((st) => st.key === s.key) < currentStageIndex ||
            stage === 'complete';

          return (
            <div
              key={s.key}
              className={`flex flex-col items-center gap-1 ${
                isActive
                  ? 'text-primary'
                  : isComplete
                  ? 'text-green-500'
                  : 'text-muted-foreground/50'
              }`}
              title={s.label}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
