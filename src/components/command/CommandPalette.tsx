'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  FileText,
  Download,
  BookOpen,
  Brain,
  Sparkles,
  Settings,
  HelpCircle,
  RotateCcw,
  Keyboard,
  Zap,
  Layout,
  BarChart3,
  Trophy,
  Network,
  Video,
  ClipboardCheck,
  ChevronRight,
  Clock,
  Star,
} from 'lucide-react';
import { KEYBOARD_SHORTCUTS, formatShortcut, groupShortcutsByCategory } from '@/hooks/useKeyboardShortcuts';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: typeof Search;
  shortcut?: string;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

// Command categories with icons
const CATEGORIES = {
  actions: { label: 'Actions', icon: Zap },
  navigation: { label: 'Navigation', icon: Layout },
  generation: { label: 'Generate', icon: Sparkles },
  export: { label: 'Export', icon: Download },
  help: { label: 'Help', icon: HelpCircle },
};

export function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Define all commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Actions
      {
        id: 'new-course',
        title: 'New Course',
        description: 'Start creating a new course from scratch',
        icon: FileText,
        shortcut: 'Ctrl+N',
        action: () => onCommand('new-course'),
        category: 'actions',
        keywords: ['create', 'start', 'fresh'],
      },
      {
        id: 'upload-document',
        title: 'Upload Document',
        description: 'Upload a document to generate a course',
        icon: FileText,
        action: () => onCommand('upload'),
        category: 'actions',
        keywords: ['file', 'pdf', 'import'],
      },
      {
        id: 'save-course',
        title: 'Save Course',
        description: 'Save current course to local storage',
        icon: Download,
        shortcut: 'Ctrl+S',
        action: () => onCommand('save'),
        category: 'actions',
        keywords: ['store', 'persist'],
      },
      {
        id: 'reset',
        title: 'Reset Session',
        description: 'Clear all data and start fresh',
        icon: RotateCcw,
        action: () => onCommand('reset'),
        category: 'actions',
        keywords: ['clear', 'new'],
      },

      // Navigation
      {
        id: 'go-chat',
        title: 'Focus Chat',
        description: 'Jump to the chat input',
        icon: Command,
        shortcut: 'Ctrl+1',
        action: () => onCommand('focus-chat'),
        category: 'navigation',
        keywords: ['message', 'input'],
      },
      {
        id: 'go-outline',
        title: 'Focus Outline',
        description: 'Jump to the course outline',
        icon: BookOpen,
        shortcut: 'Ctrl+2',
        action: () => onCommand('focus-outline'),
        category: 'navigation',
        keywords: ['modules', 'structure'],
      },
      {
        id: 'go-analytics',
        title: 'Open Analytics',
        description: 'View course quality analytics',
        icon: BarChart3,
        shortcut: 'Ctrl+3',
        action: () => onCommand('open-analytics'),
        category: 'navigation',
        keywords: ['metrics', 'quality', 'score'],
      },
      {
        id: 'go-gamification',
        title: 'View Achievements',
        description: 'Check your XP and achievements',
        icon: Trophy,
        action: () => onCommand('open-gamification'),
        category: 'navigation',
        keywords: ['xp', 'badges', 'progress'],
      },
      {
        id: 'go-graph',
        title: 'Knowledge Graph',
        description: 'Visualize course connections',
        icon: Network,
        action: () => onCommand('open-graph'),
        category: 'navigation',
        keywords: ['visualization', 'map', 'connections'],
      },

      // Generation
      {
        id: 'generate-outline',
        title: 'Generate Course Outline',
        description: 'AI generates complete course structure',
        icon: Brain,
        shortcut: 'Ctrl+G',
        action: () => onCommand('generate-outline'),
        category: 'generation',
        keywords: ['create', 'structure', 'modules'],
      },
      {
        id: 'generate-content',
        title: 'Generate Lesson Content',
        description: 'AI writes detailed lesson content',
        icon: Sparkles,
        shortcut: 'Ctrl+L',
        action: () => onCommand('generate-content'),
        category: 'generation',
        keywords: ['write', 'create', 'lessons'],
      },
      {
        id: 'generate-quiz',
        title: 'Generate Quiz',
        description: 'AI creates assessment questions',
        icon: ClipboardCheck,
        shortcut: 'Ctrl+Q',
        action: () => onCommand('generate-quiz'),
        category: 'generation',
        keywords: ['test', 'questions', 'assessment'],
      },
      {
        id: 'generate-script',
        title: 'Generate Video Script',
        description: 'AI writes production-ready video script',
        icon: Video,
        action: () => onCommand('generate-script'),
        category: 'generation',
        keywords: ['video', 'recording', 'script'],
      },

      // Export
      {
        id: 'export-json',
        title: 'Export as JSON',
        description: 'Download course data as JSON file',
        icon: Download,
        shortcut: 'Ctrl+Shift+J',
        action: () => onCommand('export-json'),
        category: 'export',
        keywords: ['download', 'data'],
      },
      {
        id: 'export-markdown',
        title: 'Export as Markdown',
        description: 'Download course as Markdown document',
        icon: Download,
        shortcut: 'Ctrl+Shift+M',
        action: () => onCommand('export-markdown'),
        category: 'export',
        keywords: ['download', 'md'],
      },
      {
        id: 'export-scorm',
        title: 'Export as SCORM',
        description: 'Download LMS-compatible SCORM package',
        icon: Download,
        action: () => onCommand('export-scorm'),
        category: 'export',
        keywords: ['lms', 'package', 'learning'],
      },

      // Help
      {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'View all available shortcuts',
        icon: Keyboard,
        shortcut: 'Ctrl+/',
        action: () => onCommand('show-shortcuts'),
        category: 'help',
        keywords: ['keys', 'commands'],
      },
      {
        id: 'help',
        title: 'Help & Documentation',
        description: 'Learn how to use CourseForge',
        icon: HelpCircle,
        action: () => onCommand('show-help'),
        category: 'help',
        keywords: ['docs', 'guide', 'tutorial'],
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Configure CourseForge preferences',
        icon: Settings,
        action: () => onCommand('open-settings'),
        category: 'help',
        keywords: ['preferences', 'config'],
      },
    ],
    [onCommand]
  );

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery)) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedItem = list.querySelector(`[data-index="${selectedIndex}"]`);
    selectedItem?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[--paper-900]/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[--paper-200] overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[--paper-200]">
              <Search className="w-5 h-5 text-[--paper-400]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-[--paper-900] placeholder-[--paper-400] outline-none text-base"
              />
              <kbd className="px-2 py-1 text-xs text-[--paper-500] bg-[--paper-100] rounded border border-[--paper-200]">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
              {Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-2 text-xs font-medium text-[--paper-500] uppercase tracking-wide">
                    {CATEGORIES[category as keyof typeof CATEGORIES]?.label || category}
                  </div>
                  {items.map((cmd) => {
                    flatIndex++;
                    const isSelected = flatIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        data-index={flatIndex}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-[--ember-50] text-[--ember-700]'
                            : 'text-[--paper-700] hover:bg-[--paper-50]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-[--ember-100]' : 'bg-[--paper-100]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[--ember-600]' : 'text-[--paper-500]'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{cmd.title}</p>
                          {cmd.description && (
                            <p className={`text-xs truncate ${isSelected ? 'text-[--ember-600]/70' : 'text-[--paper-500]'}`}>
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd
                            className={`px-2 py-0.5 text-xs rounded border ${
                              isSelected
                                ? 'bg-[--ember-100] border-[--ember-200] text-[--ember-700]'
                                : 'bg-[--paper-100] border-[--paper-200] text-[--paper-500]'
                            }`}
                          >
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="w-12 h-12 text-[--paper-300] mx-auto mb-3" />
                  <p className="text-[--paper-500]">No commands found</p>
                  <p className="text-sm text-[--paper-400] mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[--paper-100] bg-[--paper-50] flex items-center justify-between text-xs text-[--paper-500]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-[--paper-200]">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-[--paper-200]">↵</kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {filteredCommands.length} commands
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
