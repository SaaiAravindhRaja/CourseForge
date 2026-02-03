import type { FunctionDeclaration, Type } from '@google/genai';

// Director tools for orchestrating course creation
export const directorTools: FunctionDeclaration[] = [
  // Project Setup Tools
  {
    name: 'save_course_overview',
    description: 'Save the course title, description, target audience, and course type',
    parameters: {
      type: 'object' as Type,
      properties: {
        title: { type: 'string' as Type, description: 'The course title' },
        description: { type: 'string' as Type, description: 'Brief course description' },
        targetAudience: { type: 'string' as Type, description: 'Who this course is for' },
        courseType: {
          type: 'string' as Type,
          description: 'Type of course',
          enum: ['corporate', 'academic', 'self-paced', 'bootcamp'],
        },
        difficulty: {
          type: 'string' as Type,
          description: 'Difficulty level',
          enum: ['beginner', 'intermediate', 'advanced'],
        },
      },
      required: ['title', 'description', 'targetAudience', 'courseType'],
    },
  },

  // Curriculum Tools
  {
    name: 'generate_course_outline',
    description: 'Invoke the Curriculum Architect to analyze the source document and generate a course outline with modules and lessons',
    parameters: {
      type: 'object' as Type,
      properties: {
        focusAreas: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Specific topics or areas to emphasize',
        },
        moduleCount: {
          type: 'number' as Type,
          description: 'Suggested number of modules (can be adjusted)',
        },
        depth: {
          type: 'string' as Type,
          description: 'How deep to go into the content',
          enum: ['overview', 'standard', 'comprehensive'],
        },
      },
    },
  },
  {
    name: 'edit_module',
    description: 'Modify a specific module in the course',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The ID of the module to edit' },
        title: { type: 'string' as Type, description: 'New title for the module' },
        description: { type: 'string' as Type, description: 'New description' },
        objectives: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Updated learning objectives',
        },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'add_module',
    description: 'Add a new module to the course',
    parameters: {
      type: 'object' as Type,
      properties: {
        title: { type: 'string' as Type, description: 'Module title' },
        description: { type: 'string' as Type, description: 'Module description' },
        position: { type: 'number' as Type, description: 'Position in the module list (0-indexed)' },
      },
      required: ['title', 'description'],
    },
  },
  {
    name: 'remove_module',
    description: 'Remove a module from the course',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The ID of the module to remove' },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'reorder_modules',
    description: 'Change the order of modules in the course',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleIds: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Array of module IDs in the new order',
        },
      },
      required: ['moduleIds'],
    },
  },

  // Content Tools
  {
    name: 'generate_lesson_content',
    description: 'Invoke the Content Alchemist to generate detailed content for a specific lesson',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson to generate content for' },
        style: {
          type: 'string' as Type,
          description: 'Writing style preference',
          enum: ['formal', 'conversational', 'storytelling', 'technical'],
        },
        includeExamples: { type: 'boolean' as Type, description: 'Whether to include examples' },
      },
      required: ['moduleId', 'lessonId'],
    },
  },
  {
    name: 'edit_lesson',
    description: 'Modify the content of a specific lesson',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson to edit' },
        title: { type: 'string' as Type, description: 'New lesson title' },
        content: { type: 'string' as Type, description: 'New lesson content' },
        keyTakeaways: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Updated key takeaways',
        },
      },
      required: ['moduleId', 'lessonId'],
    },
  },
  {
    name: 'regenerate_lesson',
    description: 'Completely regenerate a lesson with new content',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson to regenerate' },
        feedback: { type: 'string' as Type, description: 'User feedback to incorporate' },
      },
      required: ['moduleId', 'lessonId'],
    },
  },

  // Assessment Tools
  {
    name: 'generate_quiz',
    description: 'Invoke the Assessment Wizard to create a quiz for a module',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module to create a quiz for' },
        questionCount: { type: 'number' as Type, description: 'Number of questions' },
        questionTypes: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Types of questions to include',
        },
        difficulty: {
          type: 'string' as Type,
          description: 'Quiz difficulty',
          enum: ['easy', 'medium', 'hard', 'mixed'],
        },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'edit_question',
    description: 'Modify a specific quiz question',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the quiz' },
        questionId: { type: 'string' as Type, description: 'The question to edit' },
        question: { type: 'string' as Type, description: 'Updated question text' },
        options: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Updated answer options',
        },
        correctAnswer: { type: 'string' as Type, description: 'The correct answer' },
      },
      required: ['moduleId', 'questionId'],
    },
  },
  {
    name: 'adjust_difficulty',
    description: 'Make a quiz easier or harder',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the quiz' },
        direction: {
          type: 'string' as Type,
          description: 'Make easier or harder',
          enum: ['easier', 'harder'],
        },
      },
      required: ['moduleId', 'direction'],
    },
  },

  // Engagement Tools
  {
    name: 'add_interactive_element',
    description: 'Invoke the Engagement Engineer to add an interactive element to a lesson',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson to add element to' },
        elementType: {
          type: 'string' as Type,
          description: 'Type of interactive element',
          enum: ['reflection', 'discussion', 'exercise', 'scenario', 'roleplay'],
        },
      },
      required: ['moduleId', 'lessonId', 'elementType'],
    },
  },
  {
    name: 'generate_reflection_prompts',
    description: 'Generate reflection questions for a lesson',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson to add prompts to' },
        count: { type: 'number' as Type, description: 'Number of reflection prompts' },
      },
      required: ['moduleId', 'lessonId'],
    },
  },

  // Script Tools
  {
    name: 'generate_video_script',
    description: 'Invoke the Script Writer to create a video script for a lesson',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson to create script for' },
        tone: {
          type: 'string' as Type,
          description: 'Tone of the script',
          enum: ['professional', 'friendly', 'energetic', 'calm'],
        },
        duration: {
          type: 'string' as Type,
          description: 'Target video duration',
          enum: ['short', 'medium', 'long'],
        },
      },
      required: ['moduleId', 'lessonId'],
    },
  },
  {
    name: 'edit_script',
    description: 'Modify a video script with specific feedback',
    parameters: {
      type: 'object' as Type,
      properties: {
        moduleId: { type: 'string' as Type, description: 'The module containing the lesson' },
        lessonId: { type: 'string' as Type, description: 'The lesson with the script' },
        selectedText: { type: 'string' as Type, description: 'The text user highlighted' },
        feedback: { type: 'string' as Type, description: 'User feedback on the selection' },
      },
      required: ['moduleId', 'lessonId', 'feedback'],
    },
  },

  // UI/Navigation Tools
  {
    name: 'update_progress',
    description: 'Update the progress indicator for the user',
    parameters: {
      type: 'object' as Type,
      properties: {
        stage: {
          type: 'string' as Type,
          description: 'Current stage of course creation',
          enum: [
            'analyzing',
            'outlining',
            'generating-content',
            'creating-assessments',
            'adding-engagement',
            'writing-scripts',
            'finalizing',
            'complete',
          ],
        },
        progress: { type: 'number' as Type, description: 'Progress percentage (0-100)' },
        message: { type: 'string' as Type, description: 'Status message to display' },
      },
      required: ['stage', 'progress'],
    },
  },
  {
    name: 'show_preview',
    description: 'Show a preview of a specific component',
    parameters: {
      type: 'object' as Type,
      properties: {
        component: {
          type: 'string' as Type,
          description: 'What to preview',
          enum: ['outline', 'module', 'lesson', 'quiz', 'script'],
        },
        targetId: { type: 'string' as Type, description: 'ID of the item to preview' },
      },
      required: ['component'],
    },
  },
  {
    name: 'request_upload',
    description: 'Ask the user to upload additional materials',
    parameters: {
      type: 'object' as Type,
      properties: {
        purpose: { type: 'string' as Type, description: 'What the upload is for' },
        fileTypes: {
          type: 'array' as Type,
          items: { type: 'string' as Type },
          description: 'Accepted file types',
        },
      },
      required: ['purpose'],
    },
  },

  // Export Tools
  {
    name: 'export_course',
    description: 'Export the complete course in the specified format',
    parameters: {
      type: 'object' as Type,
      properties: {
        format: {
          type: 'string' as Type,
          description: 'Export format',
          enum: ['json', 'markdown', 'scorm', 'pdf'],
        },
        includeScripts: { type: 'boolean' as Type, description: 'Include video scripts' },
        includeQuizzes: { type: 'boolean' as Type, description: 'Include assessments' },
      },
      required: ['format'],
    },
  },
];

export function getToolsForGemini() {
  return {
    functionDeclarations: directorTools,
  };
}
