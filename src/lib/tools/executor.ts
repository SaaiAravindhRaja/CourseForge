import { v4 as uuidv4 } from 'uuid';
import {
  invokeCurriculumArchitect,
  invokeContentAlchemist,
  invokeAssessmentWizard,
  invokeEngagementEngineer,
  invokeScriptWriter,
} from '../agents/director';
import type { Course, Module, Lesson, QuizQuestion, InteractiveElement, VideoScript } from '@/types';

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  stateUpdates?: {
    course?: Partial<Course>;
    stage?: string;
    progress?: number;
  };
}

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  currentState: {
    course: Course | null;
    sourceDocument: { content: string; name: string } | null;
  }
): Promise<ToolExecutionResult> {
  try {
    switch (toolName) {
      case 'save_course_overview':
        return handleSaveCourseOverview(args, currentState.course);

      case 'generate_course_outline':
        return await handleGenerateCourseOutline(args, currentState);

      case 'edit_module':
        return handleEditModule(args, currentState.course);

      case 'add_module':
        return handleAddModule(args, currentState.course);

      case 'remove_module':
        return handleRemoveModule(args, currentState.course);

      case 'reorder_modules':
        return handleReorderModules(args, currentState.course);

      case 'generate_lesson_content':
        return await handleGenerateLessonContent(args, currentState);

      case 'edit_lesson':
        return handleEditLesson(args, currentState.course);

      case 'regenerate_lesson':
        return await handleRegenerateLesson(args, currentState);

      case 'generate_quiz':
        return await handleGenerateQuiz(args, currentState);

      case 'edit_question':
        return handleEditQuestion(args, currentState.course);

      case 'adjust_difficulty':
        return await handleAdjustDifficulty(args, currentState);

      case 'add_interactive_element':
        return await handleAddInteractiveElement(args, currentState);

      case 'generate_reflection_prompts':
        return await handleGenerateReflectionPrompts(args, currentState);

      case 'generate_video_script':
        return await handleGenerateVideoScript(args, currentState);

      case 'edit_script':
        return await handleEditScript(args, currentState);

      case 'update_progress':
        return handleUpdateProgress(args);

      case 'show_preview':
        return handleShowPreview(args, currentState.course);

      case 'request_upload':
        return handleRequestUpload(args);

      case 'export_course':
        return handleExportCourse(args, currentState.course);

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Tool Handlers

function handleSaveCourseOverview(
  args: Record<string, unknown>,
  currentCourse: Course | null
): ToolExecutionResult {
  const now = new Date().toISOString();
  const course: Course = currentCourse || {
    id: uuidv4(),
    title: '',
    description: '',
    targetAudience: '',
    courseType: 'self-paced',
    difficulty: 'beginner',
    estimatedDuration: '',
    modules: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    success: true,
    data: { message: 'Course overview saved' },
    stateUpdates: {
      course: {
        ...course,
        title: (args.title as string) || course.title,
        description: (args.description as string) || course.description,
        targetAudience: (args.targetAudience as string) || course.targetAudience,
        courseType: (args.courseType as Course['courseType']) || course.courseType,
        difficulty: (args.difficulty as Course['difficulty']) || course.difficulty,
        updatedAt: now,
      },
    },
  };
}

async function handleGenerateCourseOutline(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  if (!state.sourceDocument) {
    return { success: false, error: 'No source document available' };
  }

  const preferences = {
    focusAreas: args.focusAreas || [],
    moduleCount: args.moduleCount || 6,
    depth: args.depth || 'standard',
  };

  const outlineJson = await invokeCurriculumArchitect(
    state.sourceDocument.content,
    preferences
  );

  // Parse the JSON response
  let outline;
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = outlineJson.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, outlineJson];
    outline = JSON.parse(jsonMatch[1] || outlineJson);
  } catch {
    return { success: false, error: 'Failed to parse course outline' };
  }

  const now = new Date().toISOString();
  const modules: Module[] = (outline.modules || []).map((m: Record<string, unknown>, idx: number) => ({
    id: uuidv4(),
    title: m.title as string,
    description: m.description as string,
    objectives: ((m.objectives as Array<Record<string, string>>) || []).map((o) => ({
      id: uuidv4(),
      text: o.text,
      bloomLevel: o.bloomLevel || 'understand',
    })),
    lessons: ((m.lessons as Array<Record<string, string>>) || []).map((l, lIdx) => ({
      id: uuidv4(),
      title: l.title,
      objectives: [],
      content: '',
      keyTakeaways: [],
      interactiveElements: [],
    })),
  }));

  return {
    success: true,
    data: { outline, moduleCount: modules.length },
    stateUpdates: {
      course: {
        title: outline.title || state.course?.title || 'Untitled Course',
        description: outline.description || state.course?.description || '',
        modules,
        updatedAt: now,
      },
      stage: 'outlining',
      progress: 25,
    },
  };
}

function handleEditModule(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
  if (moduleIndex === -1) return { success: false, error: 'Module not found' };

  const currentModule = course.modules[moduleIndex];
  const updatedModule: Module = {
    ...currentModule,
    title: args.title ? (args.title as string) : currentModule.title,
    description: args.description ? (args.description as string) : currentModule.description,
    objectives: args.objectives
      ? (args.objectives as string[]).map((text) => ({
          id: uuidv4(),
          text,
          bloomLevel: 'understand' as const,
        }))
      : currentModule.objectives,
  };

  const updatedModules = [...course.modules];
  updatedModules[moduleIndex] = updatedModule;

  return {
    success: true,
    data: { message: 'Module updated' },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
    },
  };
}

function handleAddModule(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const newModule: Module = {
    id: uuidv4(),
    title: args.title as string,
    description: args.description as string,
    objectives: [],
    lessons: [],
  };

  const position = args.position as number | undefined;
  const updatedModules = [...course.modules];

  if (position !== undefined && position >= 0 && position <= updatedModules.length) {
    updatedModules.splice(position, 0, newModule);
  } else {
    updatedModules.push(newModule);
  }

  return {
    success: true,
    data: { message: 'Module added', moduleId: newModule.id },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
    },
  };
}

function handleRemoveModule(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const updatedModules = course.modules.filter((m) => m.id !== moduleId);

  if (updatedModules.length === course.modules.length) {
    return { success: false, error: 'Module not found' };
  }

  return {
    success: true,
    data: { message: 'Module removed' },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
    },
  };
}

function handleReorderModules(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const moduleIds = args.moduleIds as string[];
  const moduleMap = new Map(course.modules.map((m) => [m.id, m]));
  const reorderedModules = moduleIds
    .map((id) => moduleMap.get(id))
    .filter((m): m is Module => m !== undefined);

  return {
    success: true,
    data: { message: 'Modules reordered' },
    stateUpdates: {
      course: { modules: reorderedModules, updatedAt: new Date().toISOString() },
    },
  };
}

async function handleGenerateLessonContent(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  if (!state.course) return { success: false, error: 'No course exists' };
  if (!state.sourceDocument) return { success: false, error: 'No source document' };

  const moduleId = args.moduleId as string;
  const lessonId = args.lessonId as string;
  const style = (args.style as string) || 'conversational';

  const module = state.course.modules.find((m) => m.id === moduleId);
  if (!module) return { success: false, error: 'Module not found' };

  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return { success: false, error: 'Lesson not found' };

  const content = await invokeContentAlchemist(
    {
      title: lesson.title,
      moduleTitle: module.title,
      objectives: module.objectives.map((o) => o.text),
      sourceContent: state.sourceDocument.content.slice(0, 10000),
    },
    style
  );

  // Extract key takeaways from content
  const takeawayMatch = content.match(/key takeaways?:?\s*([\s\S]*?)(?:\n\n|$)/i);
  const keyTakeaways = takeawayMatch
    ? takeawayMatch[1]
        .split('\n')
        .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
    : [];

  const updatedModules = state.course.modules.map((m) =>
    m.id === moduleId
      ? {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId
              ? { ...l, content, keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : l.keyTakeaways }
              : l
          ),
        }
      : m
  );

  return {
    success: true,
    data: { message: 'Lesson content generated', lessonId },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
      stage: 'generating-content',
    },
  };
}

function handleEditLesson(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const lessonId = args.lessonId as string;

  const updatedModules = course.modules.map((m) => {
    if (m.id !== moduleId) return m;
    return {
      ...m,
      lessons: m.lessons.map((l) => {
        if (l.id !== lessonId) return l;
        return {
          ...l,
          title: args.title ? (args.title as string) : l.title,
          content: args.content ? (args.content as string) : l.content,
          keyTakeaways: args.keyTakeaways ? (args.keyTakeaways as string[]) : l.keyTakeaways,
        };
      }),
    };
  });

  return {
    success: true,
    data: { message: 'Lesson updated' },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
    },
  };
}

async function handleRegenerateLesson(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  // Same as generateLessonContent but with feedback consideration
  return handleGenerateLessonContent(args, state);
}

async function handleGenerateQuiz(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  if (!state.course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const module = state.course.modules.find((m) => m.id === moduleId);
  if (!module) return { success: false, error: 'Module not found' };

  const moduleContent = module.lessons.map((l) => l.content).join('\n\n');

  const quizJson = await invokeAssessmentWizard(moduleContent || module.description, {
    questionCount: (args.questionCount as number) || 5,
    types: (args.questionTypes as string[]) || ['mcq', 'true-false'],
    difficulty: (args.difficulty as string) || 'medium',
  });

  let quiz;
  try {
    const jsonMatch = quizJson.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, quizJson];
    quiz = JSON.parse(jsonMatch[1] || quizJson);
  } catch {
    return { success: false, error: 'Failed to parse quiz' };
  }

  const questions: QuizQuestion[] = (quiz.questions || []).map((q: Record<string, unknown>) => ({
    id: uuidv4(),
    type: q.type as QuizQuestion['type'],
    question: q.question as string,
    options: q.options as string[],
    correctAnswer: q.correctAnswer as string | number,
    explanation: q.explanation as string,
    bloomLevel: (q.bloomLevel as QuizQuestion['bloomLevel']) || 'understand',
    points: (q.points as number) || 10,
  }));

  const updatedModules = state.course.modules.map((m) =>
    m.id === moduleId
      ? {
          ...m,
          quiz: {
            id: uuidv4(),
            title: `${module.title} Quiz`,
            questions,
            passingScore: 70,
          },
        }
      : m
  );

  return {
    success: true,
    data: { message: 'Quiz generated', questionCount: questions.length },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
      stage: 'creating-assessments',
    },
  };
}

function handleEditQuestion(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const questionId = args.questionId as string;

  const updatedModules = course.modules.map((m) => {
    if (m.id !== moduleId || !m.quiz) return m;
    return {
      ...m,
      quiz: {
        ...m.quiz,
        questions: m.quiz.questions.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            question: args.question ? (args.question as string) : q.question,
            options: args.options ? (args.options as string[]) : q.options,
            correctAnswer: args.correctAnswer ? (args.correctAnswer as string) : q.correctAnswer,
          };
        }),
      },
    };
  });

  return {
    success: true,
    data: { message: 'Question updated' },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
    },
  };
}

async function handleAdjustDifficulty(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  // Re-generate quiz with adjusted difficulty
  const direction = args.direction as string;
  const newDifficulty = direction === 'easier' ? 'easy' : 'hard';

  return handleGenerateQuiz(
    { ...args, difficulty: newDifficulty },
    state
  );
}

async function handleAddInteractiveElement(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  if (!state.course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const lessonId = args.lessonId as string;
  const elementType = args.elementType as string;

  const module = state.course.modules.find((m) => m.id === moduleId);
  if (!module) return { success: false, error: 'Module not found' };

  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return { success: false, error: 'Lesson not found' };

  const elementJson = await invokeEngagementEngineer(
    lesson.content || lesson.title,
    elementType
  );

  let element;
  try {
    const jsonMatch = elementJson.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, elementJson];
    element = JSON.parse(jsonMatch[1] || elementJson);
  } catch {
    return { success: false, error: 'Failed to parse interactive element' };
  }

  const newElement: InteractiveElement = {
    id: uuidv4(),
    type: element.type as InteractiveElement['type'],
    title: element.title,
    content: element.content,
    instructions: element.instructions,
  };

  const updatedModules = state.course.modules.map((m) =>
    m.id === moduleId
      ? {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId
              ? { ...l, interactiveElements: [...l.interactiveElements, newElement] }
              : l
          ),
        }
      : m
  );

  return {
    success: true,
    data: { message: 'Interactive element added', elementId: newElement.id },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
      stage: 'adding-engagement',
    },
  };
}

async function handleGenerateReflectionPrompts(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  return handleAddInteractiveElement(
    { ...args, elementType: 'reflection' },
    state
  );
}

async function handleGenerateVideoScript(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  if (!state.course) return { success: false, error: 'No course exists' };

  const moduleId = args.moduleId as string;
  const lessonId = args.lessonId as string;
  const tone = (args.tone as string) || 'friendly';
  const duration = (args.duration as string) || 'medium';

  const module = state.course.modules.find((m) => m.id === moduleId);
  if (!module) return { success: false, error: 'Module not found' };

  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return { success: false, error: 'Lesson not found' };

  const scriptContent = await invokeScriptWriter(
    lesson.content || lesson.title,
    { tone, duration }
  );

  const script: VideoScript = {
    id: uuidv4(),
    title: `Video: ${lesson.title}`,
    duration: duration === 'short' ? '3-5 min' : duration === 'medium' ? '5-10 min' : '10-15 min',
    script: scriptContent,
    visualNotes: [],
    bRollSuggestions: [],
  };

  const updatedModules = state.course.modules.map((m) =>
    m.id === moduleId
      ? {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, videoScript: script } : l
          ),
        }
      : m
  );

  return {
    success: true,
    data: { message: 'Video script generated', scriptId: script.id },
    stateUpdates: {
      course: { modules: updatedModules, updatedAt: new Date().toISOString() },
      stage: 'writing-scripts',
    },
  };
}

async function handleEditScript(
  args: Record<string, unknown>,
  state: { course: Course | null; sourceDocument: { content: string; name: string } | null }
): Promise<ToolExecutionResult> {
  // For now, regenerate the script with feedback
  return handleGenerateVideoScript(args, state);
}

function handleUpdateProgress(args: Record<string, unknown>): ToolExecutionResult {
  return {
    success: true,
    data: { message: args.message || 'Progress updated' },
    stateUpdates: {
      stage: args.stage as string,
      progress: args.progress as number,
    },
  };
}

function handleShowPreview(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const component = args.component as string;
  const targetId = args.targetId as string;

  let previewData;
  switch (component) {
    case 'outline':
      previewData = {
        title: course.title,
        modules: course.modules.map((m) => ({
          title: m.title,
          lessonCount: m.lessons.length,
        })),
      };
      break;
    case 'module':
      previewData = course.modules.find((m) => m.id === targetId);
      break;
    case 'lesson':
      for (const m of course.modules) {
        const lesson = m.lessons.find((l) => l.id === targetId);
        if (lesson) {
          previewData = lesson;
          break;
        }
      }
      break;
    default:
      previewData = course;
  }

  return {
    success: true,
    data: { component, preview: previewData },
  };
}

function handleRequestUpload(args: Record<string, unknown>): ToolExecutionResult {
  return {
    success: true,
    data: {
      requestUpload: true,
      purpose: args.purpose,
      fileTypes: args.fileTypes || ['pdf', 'txt', 'docx'],
    },
  };
}

function handleExportCourse(
  args: Record<string, unknown>,
  course: Course | null
): ToolExecutionResult {
  if (!course) return { success: false, error: 'No course exists' };

  const format = args.format as string;
  const includeScripts = args.includeScripts !== false;
  const includeQuizzes = args.includeQuizzes !== false;

  // Prepare export data
  const exportData = {
    ...course,
    modules: course.modules.map((m) => ({
      ...m,
      quiz: includeQuizzes ? m.quiz : undefined,
      lessons: m.lessons.map((l) => ({
        ...l,
        videoScript: includeScripts ? l.videoScript : undefined,
      })),
    })),
  };

  return {
    success: true,
    data: {
      format,
      course: exportData,
      exportReady: true,
    },
    stateUpdates: {
      stage: 'complete',
      progress: 100,
    },
  };
}
