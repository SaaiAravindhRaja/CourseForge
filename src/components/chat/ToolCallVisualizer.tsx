'use client';

import { useEffect, useState } from 'react';
import { Wrench, Check, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'complete' | 'error';
  args?: Record<string, unknown>;
  result?: unknown;
  duration?: number;
}

interface ToolCallVisualizerProps {
  toolCalls: ToolCall[];
}

const TOOL_DESCRIPTIONS: Record<string, string> = {
  save_course_overview: 'Saving course details',
  generate_course_outline: 'Creating course structure',
  edit_module: 'Updating module',
  add_module: 'Adding new module',
  remove_module: 'Removing module',
  reorder_modules: 'Reordering modules',
  generate_lesson_content: 'Writing lesson content',
  edit_lesson: 'Updating lesson',
  regenerate_lesson: 'Rewriting lesson',
  generate_quiz: 'Creating assessment',
  edit_question: 'Updating question',
  adjust_difficulty: 'Adjusting quiz difficulty',
  add_interactive_element: 'Adding activity',
  generate_reflection_prompts: 'Creating reflection questions',
  generate_video_script: 'Writing video script',
  edit_script: 'Updating script',
  update_progress: 'Updating progress',
  show_preview: 'Generating preview',
  request_upload: 'Requesting document',
  export_course: 'Exporting course',
};

export function ToolCallVisualizer({ toolCalls }: ToolCallVisualizerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (toolCalls.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2 my-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Wrench className="h-3 w-3" />
        <span>Tool Calls</span>
        <Badge variant="outline" className="text-[10px] h-4">
          {toolCalls.filter((t) => t.status === 'running').length} active
        </Badge>
      </div>

      <div className="space-y-1">
        {toolCalls.map((tool) => {
          const isExpanded = expanded.has(tool.id);
          const description = TOOL_DESCRIPTIONS[tool.name] || tool.name;

          return (
            <Collapsible
              key={tool.id}
              open={isExpanded}
              onOpenChange={() => toggleExpand(tool.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                    transition-all duration-200
                    ${tool.status === 'running' ? 'bg-primary/10 border border-primary/20' : ''}
                    ${tool.status === 'complete' ? 'bg-green-500/10 border border-green-500/20' : ''}
                    ${tool.status === 'error' ? 'bg-red-500/10 border border-red-500/20' : ''}
                  `}
                >
                  {tool.status === 'running' ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : tool.status === 'complete' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <span className="h-3 w-3 text-red-500">!</span>
                  )}

                  <span className="flex-1 text-left font-medium">{description}</span>

                  {tool.duration && (
                    <span className="text-muted-foreground">{tool.duration}ms</span>
                  )}

                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-1 ml-5 p-2 rounded bg-muted/50 text-[10px] font-mono">
                  <div className="text-muted-foreground mb-1">
                    {tool.name}({JSON.stringify(tool.args, null, 2).slice(0, 200)}...)
                  </div>
                  {tool.result !== undefined && tool.result !== null && (
                    <div className="text-green-600 dark:text-green-400">
                      → {String(JSON.stringify(tool.result)).slice(0, 100)}...
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
