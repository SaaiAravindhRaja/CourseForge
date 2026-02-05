'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  BookOpen,
  Target,
  Brain,
  Link2,
  Sparkles,
} from 'lucide-react';
import type { Course, Module } from '@/types';

interface Node {
  id: string;
  label: string;
  type: 'course' | 'module' | 'lesson' | 'concept';
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  connections: string[];
}

interface KnowledgeGraphProps {
  course: Course | null;
}

const COLORS = {
  course: '#E24A12',
  module: '#0066FF',
  lesson: '#00A67E',
  concept: '#8B5CF6',
};

function extractConcepts(text: string): string[] {
  // Simple concept extraction - in production, use NLP
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 5)
    .slice(0, 5);
  return [...new Set(keywords)];
}

function buildGraph(course: Course): Node[] {
  const nodes: Node[] = [];
  const centerX = 400;
  const centerY = 300;

  // Course node at center
  nodes.push({
    id: course.id,
    label: course.title,
    type: 'course',
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    color: COLORS.course,
    size: 50,
    connections: course.modules.map((m) => m.id),
  });

  // Module nodes in a circle around course
  const moduleRadius = 180;
  course.modules.forEach((module, i) => {
    const angle = (2 * Math.PI * i) / course.modules.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * moduleRadius;
    const y = centerY + Math.sin(angle) * moduleRadius;

    nodes.push({
      id: module.id,
      label: module.title,
      type: 'module',
      x,
      y,
      vx: 0,
      vy: 0,
      color: COLORS.module,
      size: 35,
      connections: [course.id, ...module.lessons.map((l) => l.id)],
    });

    // Lesson nodes around each module
    const lessonRadius = 80;
    module.lessons.forEach((lesson, j) => {
      const lessonAngle = angle + ((j - (module.lessons.length - 1) / 2) * 0.5);
      const lx = x + Math.cos(lessonAngle) * lessonRadius;
      const ly = y + Math.sin(lessonAngle) * lessonRadius;

      nodes.push({
        id: lesson.id,
        label: lesson.title,
        type: 'lesson',
        x: lx,
        y: ly,
        vx: 0,
        vy: 0,
        color: COLORS.lesson,
        size: 25,
        connections: [module.id],
      });
    });
  });

  return nodes;
}

function GraphNode({
  node,
  isSelected,
  onSelect,
}: {
  node: Node;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      style={{ cursor: 'pointer' }}
      onClick={onSelect}
    >
      {/* Glow effect for selected node */}
      {isSelected && (
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={node.size + 10}
          fill={node.color}
          opacity={0.2}
          animate={{ r: [node.size + 10, node.size + 15, node.size + 10] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Main node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.size}
        fill={node.color}
        opacity={isSelected ? 1 : 0.85}
        stroke={isSelected ? '#fff' : 'transparent'}
        strokeWidth={isSelected ? 3 : 0}
        style={{
          filter: isSelected ? `drop-shadow(0 4px 12px ${node.color}50)` : undefined,
        }}
      />

      {/* Inner highlight */}
      <circle
        cx={node.x - node.size * 0.2}
        cy={node.y - node.size * 0.2}
        r={node.size * 0.3}
        fill="white"
        opacity={0.3}
      />

      {/* Label */}
      <text
        x={node.x}
        y={node.y + node.size + 18}
        textAnchor="middle"
        fill="#4A453E"
        fontSize={node.type === 'course' ? 14 : node.type === 'module' ? 12 : 10}
        fontWeight={node.type === 'course' ? 600 : 500}
        className="font-sans"
        style={{ pointerEvents: 'none' }}
      >
        {node.label.length > 20 ? node.label.slice(0, 20) + '...' : node.label}
      </text>

      {/* Type icon */}
      <g transform={`translate(${node.x - 8}, ${node.y - 8})`}>
        {node.type === 'course' && (
          <path
            d="M8 2L2 8L8 14L14 8L8 2Z"
            fill="white"
            opacity={0.9}
          />
        )}
        {node.type === 'module' && (
          <rect x="3" y="3" width="10" height="10" rx="2" fill="white" opacity={0.9} />
        )}
        {node.type === 'lesson' && (
          <circle cx="8" cy="8" r="5" fill="white" opacity={0.9} />
        )}
      </g>
    </motion.g>
  );
}

function GraphEdge({
  from,
  to,
  isHighlighted,
}: {
  from: Node;
  to: Node;
  isHighlighted: boolean;
}) {
  // Calculate control point for curved edge
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const offset = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.1, 30);
  const cpX = midX - dy * 0.1;
  const cpY = midY + dx * 0.1;

  return (
    <motion.path
      d={`M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`}
      stroke={isHighlighted ? from.color : '#D4CEC6'}
      strokeWidth={isHighlighted ? 3 : 1.5}
      fill="none"
      opacity={isHighlighted ? 0.8 : 0.4}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8 }}
    />
  );
}

export function KnowledgeGraph({ course }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const nodes = useMemo(() => (course ? buildGraph(course) : []), [course]);

  const edges = useMemo(() => {
    const edgeList: Array<{ from: Node; to: Node }> = [];
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const target = nodes.find((n) => n.id === targetId);
        if (target && node.id < targetId) {
          edgeList.push({ from: node, to: target });
        }
      });
    });
    return edgeList;
  }, [nodes]);

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!course || course.modules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[--paper-50] rounded-xl border border-[--paper-200]">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-[--paper-100] mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-[--paper-400]" />
          </div>
          <h3 className="font-medium text-[--paper-900] mb-1">Knowledge Graph</h3>
          <p className="text-sm text-[--paper-500]">
            Create a course to visualize connections
          </p>
        </div>
      </div>
    );
  }

  const selectedNodeData = selectedNode ? nodes.find((n) => n.id === selectedNode) : null;

  return (
    <div className="relative h-full bg-gradient-to-br from-[--paper-50] to-white rounded-xl border border-[--paper-200] overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-lg bg-white border border-[--paper-200] shadow-sm flex items-center justify-center text-[--paper-600] hover:text-[--paper-900] hover:bg-[--paper-50] transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-lg bg-white border border-[--paper-200] shadow-sm flex items-center justify-center text-[--paper-600] hover:text-[--paper-900] hover:bg-[--paper-50] transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-lg bg-white border border-[--paper-200] shadow-sm flex items-center justify-center text-[--paper-600] hover:text-[--paper-900] hover:bg-[--paper-50] transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg border border-[--paper-200] p-3 shadow-sm">
        <p className="text-xs font-medium text-[--paper-500] uppercase tracking-wide mb-2">Legend</p>
        <div className="space-y-1.5">
          {[
            { type: 'course', label: 'Course', color: COLORS.course },
            { type: 'module', label: 'Module', color: COLORS.module },
            { type: 'lesson', label: 'Lesson', color: COLORS.lesson },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[--paper-600]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Info */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-xl border border-[--paper-200] p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedNodeData.color}15` }}
              >
                {selectedNodeData.type === 'course' && (
                  <Target className="w-5 h-5" style={{ color: selectedNodeData.color }} />
                )}
                {selectedNodeData.type === 'module' && (
                  <Brain className="w-5 h-5" style={{ color: selectedNodeData.color }} />
                )}
                {selectedNodeData.type === 'lesson' && (
                  <BookOpen className="w-5 h-5" style={{ color: selectedNodeData.color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: selectedNodeData.color }}
                >
                  {selectedNodeData.type}
                </span>
                <h4 className="font-medium text-[--paper-900] text-sm mt-0.5">
                  {selectedNodeData.label}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-[--paper-500]">
                  <Link2 className="w-3 h-3" />
                  <span>{selectedNodeData.connections.length} connections</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[--paper-400] hover:text-[--paper-600]"
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graph Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 800 600"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDFCFB" />
            <stop offset="100%" stopColor="#F5F2EE" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#bgGradient)" />

        {/* Grid pattern */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8E4DF" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge, i) => (
            <GraphEdge
              key={`${edge.from.id}-${edge.to.id}`}
              from={edge.from}
              to={edge.to}
              isHighlighted={
                selectedNode === edge.from.id || selectedNode === edge.to.id
              }
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onSelect={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            />
          ))}
        </g>
      </svg>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs text-[--paper-500]">
        <span>{nodes.length} nodes</span>
        <span>{edges.length} connections</span>
      </div>
    </div>
  );
}
