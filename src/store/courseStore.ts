import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Course,
  Module,
  Lesson,
  SourceDocument,
  CourseGenerationStage,
  AgentMessage,
  BrandIdentity,
} from '@/types';

interface CourseState {
  // Source document
  sourceDocument: SourceDocument | null;
  setSourceDocument: (doc: SourceDocument | null) => void;

  // Course data
  course: Course | null;
  setCourse: (course: Course | null) => void;
  updateCourse: (updates: Partial<Course>) => void;

  // Module operations
  addModule: (module: Module) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  removeModule: (moduleId: string) => void;
  reorderModules: (moduleIds: string[]) => void;

  // Lesson operations
  addLesson: (moduleId: string, lesson: Lesson) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  removeLesson: (moduleId: string, lessonId: string) => void;

  // Generation state
  stage: CourseGenerationStage;
  setStage: (stage: CourseGenerationStage) => void;
  progress: number;
  setProgress: (progress: number) => void;

  // Chat/Agent messages
  messages: AgentMessage[];
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Tool call visualization
  activeToolCalls: Array<{ id: string; name: string; status: 'running' | 'complete' }>;
  addToolCall: (id: string, name: string) => void;
  completeToolCall: (id: string) => void;
  clearToolCalls: () => void;

  // Brand identity
  brandIdentity: BrandIdentity | null;
  setBrandIdentity: (brand: BrandIdentity | null) => void;

  // Session management
  sessionId: string;
  resetSession: () => void;
}

const initialState = {
  sourceDocument: null,
  course: null,
  stage: 'idle' as CourseGenerationStage,
  progress: 0,
  messages: [],
  activeToolCalls: [],
  brandIdentity: null,
  sessionId: uuidv4(),
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSourceDocument: (doc) => set({ sourceDocument: doc }),

      setCourse: (course) => set({ course }),

      updateCourse: (updates) =>
        set((state) => ({
          course: state.course
            ? { ...state.course, ...updates, updatedAt: new Date().toISOString() }
            : null,
        })),

      addModule: (module) =>
        set((state) => ({
          course: state.course
            ? {
                ...state.course,
                modules: [...state.course.modules, module],
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      updateModule: (moduleId, updates) =>
        set((state) => ({
          course: state.course
            ? {
                ...state.course,
                modules: state.course.modules.map((m) =>
                  m.id === moduleId ? { ...m, ...updates } : m
                ),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      removeModule: (moduleId) =>
        set((state) => ({
          course: state.course
            ? {
                ...state.course,
                modules: state.course.modules.filter((m) => m.id !== moduleId),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      reorderModules: (moduleIds) =>
        set((state) => {
          if (!state.course) return state;
          const moduleMap = new Map(state.course.modules.map((m) => [m.id, m]));
          const reorderedModules = moduleIds
            .map((id) => moduleMap.get(id))
            .filter((m): m is Module => m !== undefined);
          return {
            course: {
              ...state.course,
              modules: reorderedModules,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addLesson: (moduleId, lesson) =>
        set((state) => ({
          course: state.course
            ? {
                ...state.course,
                modules: state.course.modules.map((m) =>
                  m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
                ),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      updateLesson: (moduleId, lessonId, updates) =>
        set((state) => ({
          course: state.course
            ? {
                ...state.course,
                modules: state.course.modules.map((m) =>
                  m.id === moduleId
                    ? {
                        ...m,
                        lessons: m.lessons.map((l) =>
                          l.id === lessonId ? { ...l, ...updates } : l
                        ),
                      }
                    : m
                ),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      removeLesson: (moduleId, lessonId) =>
        set((state) => ({
          course: state.course
            ? {
                ...state.course,
                modules: state.course.modules.map((m) =>
                  m.id === moduleId
                    ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
                    : m
                ),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      setStage: (stage) => set({ stage }),
      setProgress: (progress) => set({ progress }),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: uuidv4(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      clearMessages: () => set({ messages: [] }),

      addToolCall: (id, name) =>
        set((state) => ({
          activeToolCalls: [...state.activeToolCalls, { id, name, status: 'running' }],
        })),

      completeToolCall: (id) =>
        set((state) => ({
          activeToolCalls: state.activeToolCalls.map((tc) =>
            tc.id === id ? { ...tc, status: 'complete' as const } : tc
          ),
        })),

      clearToolCalls: () => set({ activeToolCalls: [] }),

      setBrandIdentity: (brand) => set({ brandIdentity: brand }),

      resetSession: () =>
        set({
          ...initialState,
          sessionId: uuidv4(),
        }),
    }),
    {
      name: 'courseforge-storage',
      partialize: (state) => ({
        sourceDocument: state.sourceDocument,
        course: state.course,
        messages: state.messages,
        brandIdentity: state.brandIdentity,
        sessionId: state.sessionId,
        stage: state.stage,
      }),
    }
  )
);
