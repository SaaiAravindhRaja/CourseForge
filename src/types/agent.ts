// Agent system types

export type AgentRole =
  | 'director'
  | 'curriculum-architect'
  | 'content-alchemist'
  | 'assessment-wizard'
  | 'engagement-engineer'
  | 'script-writer'
  | 'visual-stylist';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  agentRole?: AgentRole;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
  success: boolean;
  error?: string;
}

export interface AgentContext {
  sourceDocument?: {
    name: string;
    content: string;
    type: string;
  };
  currentCourse?: {
    id: string;
    title: string;
    modules: Array<{
      id: string;
      title: string;
      lessonCount: number;
    }>;
  };
  userPreferences?: {
    courseType?: string;
    targetAudience?: string;
    difficulty?: string;
  };
  stage: string;
}

export interface DirectorTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
}

export interface AgentConfig {
  role: AgentRole;
  model: string;
  systemPrompt: string;
  tools?: DirectorTool[];
  temperature?: number;
}
