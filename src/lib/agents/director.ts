import { gemini, MODELS } from '../gemini/client';
import { directorTools } from '../gemini/tools';
import { DIRECTOR_PROMPT } from './prompts';
import type { AgentMessage, AgentContext } from '@/types';

interface DirectorResponse {
  text: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
  }>;
  finishReason?: string;
}

export async function invokeDirector(
  messages: AgentMessage[],
  context: AgentContext
): Promise<DirectorResponse> {
  // Build context-aware system prompt
  let systemPrompt = DIRECTOR_PROMPT;

  if (context.sourceDocument) {
    systemPrompt += `\n\n## Current Document\nThe user has uploaded: "${context.sourceDocument.name}" (${context.sourceDocument.type})\n\nDocument content:\n${context.sourceDocument.content.slice(0, 30000)}`;
  }

  if (context.currentCourse) {
    systemPrompt += `\n\n## Current Course State\nTitle: ${context.currentCourse.title}\nModules: ${context.currentCourse.modules.length}\n`;
    context.currentCourse.modules.forEach((m, i) => {
      systemPrompt += `- Module ${i + 1}: ${m.title} (${m.lessonCount} lessons)\n`;
    });
  }

  if (context.userPreferences) {
    systemPrompt += `\n\n## User Preferences\n`;
    if (context.userPreferences.courseType) {
      systemPrompt += `- Course Type: ${context.userPreferences.courseType}\n`;
    }
    if (context.userPreferences.targetAudience) {
      systemPrompt += `- Target Audience: ${context.userPreferences.targetAudience}\n`;
    }
    if (context.userPreferences.difficulty) {
      systemPrompt += `- Difficulty: ${context.userPreferences.difficulty}\n`;
    }
  }

  systemPrompt += `\n\n## Current Stage: ${context.stage}`;

  // Convert messages to Gemini format - prepend system prompt to first user message
  const geminiMessages = messages.map((msg, idx) => ({
    role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: idx === 0 && msg.role === 'user' ? `${systemPrompt}\n\n---\n\nUser: ${msg.content}` : msg.content }],
  }));

  // If no user messages, create one with the system prompt
  if (geminiMessages.length === 0 || geminiMessages[0].role !== 'user') {
    geminiMessages.unshift({
      role: 'user' as const,
      parts: [{ text: systemPrompt }],
    });
  }

  try {
    const response = await gemini.models.generateContent({
      model: MODELS.DIRECTOR,
      contents: geminiMessages,
      config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        tools: [{ functionDeclarations: directorTools }],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error('No response from Gemini');
    }

    const textParts: string[] = [];
    const toolCalls: DirectorResponse['toolCalls'] = [];

    for (const part of candidate.content?.parts || []) {
      if ('text' in part && part.text) {
        textParts.push(part.text);
      }
      if ('functionCall' in part && part.functionCall) {
        toolCalls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: part.functionCall.name || '',
          args: (part.functionCall.args as Record<string, unknown>) || {},
        });
      }
    }

    return {
      text: textParts.join('\n'),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: candidate.finishReason,
    };
  } catch (error) {
    console.error('Director error:', error);
    throw error;
  }
}

// Sub-agent invocation helpers
export async function invokeCurriculumArchitect(
  documentContent: string,
  preferences: Record<string, unknown>
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: MODELS.CURRICULUM_ARCHITECT,
    contents: [
      {
        role: 'user' as const,
        parts: [
          {
            text: `Analyze this document and create a detailed course outline.

Document Content:
${documentContent}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Create a JSON response with this structure:
{
  "title": "Course Title",
  "description": "Course description",
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "objectives": [
        {"text": "Objective text", "bloomLevel": "understand"}
      ],
      "lessons": [
        {"title": "Lesson Title", "description": "Brief description"}
      ]
    }
  ]
}`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.5,
      maxOutputTokens: 8192,
    },
  });

  return response.text || '';
}

export async function invokeContentAlchemist(
  lessonContext: {
    title: string;
    moduleTitle: string;
    objectives: string[];
    sourceContent: string;
  },
  style: string
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: MODELS.CONTENT_ALCHEMIST,
    contents: [
      {
        role: 'user' as const,
        parts: [
          {
            text: `Create engaging lesson content.

Module: ${lessonContext.moduleTitle}
Lesson: ${lessonContext.title}
Objectives: ${lessonContext.objectives.join(', ')}
Style: ${style}

Source Material:
${lessonContext.sourceContent}

Generate comprehensive lesson content with:
1. Engaging introduction
2. Main content with examples and analogies
3. Key takeaways
4. Transition to next topic

Format as markdown.`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  return response.text || '';
}

export async function invokeAssessmentWizard(
  moduleContent: string,
  config: { questionCount: number; types: string[]; difficulty: string }
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: MODELS.ASSESSMENT_WIZARD,
    contents: [
      {
        role: 'user' as const,
        parts: [
          {
            text: `Create a quiz for this module content.

Module Content:
${moduleContent}

Requirements:
- Number of questions: ${config.questionCount}
- Question types: ${config.types.join(', ')}
- Difficulty: ${config.difficulty}

Generate a JSON response:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "bloomLevel": "understand",
      "points": 10
    }
  ]
}`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.5,
      maxOutputTokens: 4096,
    },
  });

  return response.text || '';
}

export async function invokeEngagementEngineer(
  lessonContent: string,
  elementType: string
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: MODELS.ENGAGEMENT_ENGINEER,
    contents: [
      {
        role: 'user' as const,
        parts: [
          {
            text: `Create an interactive ${elementType} element for this lesson.

Lesson Content:
${lessonContent}

Generate a JSON response:
{
  "type": "${elementType}",
  "title": "Activity Title",
  "content": "Main content or prompt",
  "instructions": "How to complete this activity"
}`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  return response.text || '';
}

export async function invokeScriptWriter(
  lessonContent: string,
  config: { tone: string; duration: string }
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: MODELS.SCRIPT_WRITER,
    contents: [
      {
        role: 'user' as const,
        parts: [
          {
            text: `Create a video script for this lesson.

Lesson Content:
${lessonContent}

Requirements:
- Tone: ${config.tone}
- Duration: ${config.duration}

Format the script with:
[VISUAL: description]
[PRESENTER]: "dialogue"
[B-ROLL: suggestion]

Also include:
- Estimated duration
- Visual notes
- B-roll suggestions`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  return response.text || '';
}
