'use client';

import { useEffect, useCallback, useState } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'editing' | 'generation' | 'export' | 'general';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onShortcutTriggered?: (shortcut: Shortcut) => void;
}

export const KEYBOARD_SHORTCUTS: Omit<Shortcut, 'action'>[] = [
  // Navigation
  { key: '1', ctrl: true, description: 'Focus chat input', category: 'navigation' },
  { key: '2', ctrl: true, description: 'Focus course outline', category: 'navigation' },
  { key: '3', ctrl: true, description: 'Open analytics panel', category: 'navigation' },
  { key: 'k', ctrl: true, description: 'Open command palette', category: 'navigation' },
  { key: 'Escape', description: 'Close modal / Cancel', category: 'navigation' },

  // Editing
  { key: 'z', ctrl: true, description: 'Undo last change', category: 'editing' },
  { key: 'z', ctrl: true, shift: true, description: 'Redo last change', category: 'editing' },
  { key: 's', ctrl: true, description: 'Save course', category: 'editing' },

  // Generation
  { key: 'g', ctrl: true, description: 'Generate course outline', category: 'generation' },
  { key: 'l', ctrl: true, description: 'Generate lesson content', category: 'generation' },
  { key: 'q', ctrl: true, description: 'Generate quiz', category: 'generation' },
  { key: 'Enter', ctrl: true, description: 'Send message', category: 'generation' },

  // Export
  { key: 'e', ctrl: true, description: 'Export course', category: 'export' },
  { key: 'j', ctrl: true, shift: true, description: 'Export as JSON', category: 'export' },
  { key: 'm', ctrl: true, shift: true, description: 'Export as Markdown', category: 'export' },

  // General
  { key: '/', ctrl: true, description: 'Show keyboard shortcuts', category: 'general' },
  { key: 'n', ctrl: true, description: 'New course', category: 'general' },
  { key: 'h', ctrl: true, description: 'Toggle help', category: 'general' },
];

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, onShortcutTriggered } = options;
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Allow some shortcuts even in inputs
      const allowInInput = event.ctrlKey || event.metaKey;

      if (isInput && !allowInInput) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          setLastTriggered(shortcut.key);
          onShortcutTriggered?.(shortcut);

          // Reset after brief delay
          setTimeout(() => setLastTriggered(null), 200);
          return;
        }
      }
    },
    [enabled, shortcuts, onShortcutTriggered]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { lastTriggered };
}

// Command Palette Component
export function formatShortcut(shortcut: Omit<Shortcut, 'action'>): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}

// Group shortcuts by category
export function groupShortcutsByCategory(shortcuts: Omit<Shortcut, 'action'>[]) {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);
}
