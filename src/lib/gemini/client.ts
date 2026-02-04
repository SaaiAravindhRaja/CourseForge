import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client - lazy initialization to avoid build errors
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

let geminiInstance: GoogleGenAI | null = null;

export const gemini = {
  get models() {
    if (!geminiInstance) {
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found. Please set it in your environment variables.');
      }
      geminiInstance = new GoogleGenAI({ apiKey });
    }
    return geminiInstance.models;
  },
};

// Model configurations - using stable model names
export const MODELS = {
  // Director - orchestration and complex reasoning
  DIRECTOR: 'gemini-2.0-flash',

  // Content Alchemist - complex content transformation
  CONTENT_ALCHEMIST: 'gemini-2.0-flash',

  // Visual Stylist - multimodal brand analysis
  VISUAL_STYLIST: 'gemini-2.0-flash',

  // Fast sub-agents
  CURRICULUM_ARCHITECT: 'gemini-2.0-flash',
  ASSESSMENT_WIZARD: 'gemini-2.0-flash',
  ENGAGEMENT_ENGINEER: 'gemini-2.0-flash',
  SCRIPT_WRITER: 'gemini-2.0-flash',

  // Real-time voice input
  VOICE_INPUT: 'gemini-2.0-flash',
} as const;

// Helper to get model instance
export function getModel(modelName: keyof typeof MODELS) {
  return MODELS[modelName];
}
