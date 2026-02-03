// Course structure types

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export interface LearningObjective {
  id: string;
  text: string;
  bloomLevel: BloomLevel;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  bloomLevel: BloomLevel;
  points: number;
}

export interface InteractiveElement {
  id: string;
  type: 'reflection' | 'discussion' | 'exercise' | 'scenario' | 'roleplay';
  title: string;
  content: string;
  instructions?: string;
}

export interface VideoScript {
  id: string;
  title: string;
  duration: string;
  script: string;
  visualNotes?: string[];
  bRollSuggestions?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  objectives: LearningObjective[];
  content: string;
  keyTakeaways: string[];
  interactiveElements: InteractiveElement[];
  videoScript?: VideoScript;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  objectives: LearningObjective[];
  lessons: Lesson[];
  quiz?: {
    id: string;
    title: string;
    questions: QuizQuestion[];
    passingScore: number;
  };
}

export interface BrandIdentity {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  tone?: 'formal' | 'conversational' | 'friendly' | 'academic';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  courseType: 'corporate' | 'academic' | 'self-paced' | 'bootcamp';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  modules: Module[];
  brandIdentity?: BrandIdentity;
  createdAt: string;
  updatedAt: string;
}

export interface SourceDocument {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'video-transcript' | 'article';
  content: string;
  uploadedAt: string;
}

export type CourseGenerationStage =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'outlining'
  | 'generating-content'
  | 'creating-assessments'
  | 'adding-engagement'
  | 'writing-scripts'
  | 'finalizing'
  | 'complete';
