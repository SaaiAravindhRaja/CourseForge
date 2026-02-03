'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, FileText, Brain, PenTool, ClipboardCheck, Lightbulb, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface LandingProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

const AGENTS = [
  { name: 'Director', role: 'Orchestrates the workflow', color: '#EA580C' },
  { name: 'Architect', role: 'Designs course structure', color: '#2563EB' },
  { name: 'Writer', role: 'Creates lesson content', color: '#16A34A' },
  { name: 'Assessor', role: 'Builds quizzes', color: '#CA8A04' },
  { name: 'Engager', role: 'Adds interactivity', color: '#9333EA' },
  { name: 'Producer', role: 'Writes video scripts', color: '#DC2626' },
];

export function Landing({ onUploadClick, onDemoClick }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CourseForge"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDemoClick}
            className="text-stone-600 hover:text-stone-900"
          >
            <Play className="h-4 w-4 mr-2" />
            Try Demo
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Powered by Google Gemini
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-serif text-5xl md:text-6xl font-semibold text-stone-900 leading-[1.1] mb-6"
          >
            Transform documents into{' '}
            <span className="text-orange-600">structured courses</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xl text-stone-600 leading-relaxed mb-10 max-w-2xl"
          >
            Upload any document—PDF, markdown, or text—and watch six specialized AI agents
            collaborate to create complete courses with lessons, quizzes, and video scripts.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={onUploadClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 h-12 text-base"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Document
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onDemoClick}
              className="border-stone-300 text-stone-700 hover:bg-stone-50 px-6 h-12 text-base"
            >
              <Play className="h-5 w-5 mr-2" />
              Quick Demo
            </Button>
          </motion.div>

          {/* Supported formats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-3 text-sm text-stone-500"
          >
            <FileText className="h-4 w-4" />
            <span>Supports PDF, Markdown, TXT, DOC files</span>
          </motion.div>
        </div>

        {/* Agent Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-24"
        >
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-6">
            Six Specialized Agents
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {AGENTS.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                className="p-4 bg-white border border-stone-200 rounded-lg hover:border-stone-300 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full mb-3"
                  style={{ backgroundColor: agent.color }}
                />
                <p className="font-medium text-stone-900 text-sm mb-1">{agent.name}</p>
                <p className="text-xs text-stone-500">{agent.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-24 pt-16 border-t border-stone-200"
        >
          <h2 className="font-serif text-2xl font-medium text-stone-900 mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload your content',
                description: 'Drop any document containing the knowledge you want to transform into a course.',
              },
              {
                step: '02',
                title: 'AI analyzes & structures',
                description: 'Our agents identify key concepts, create modules, and design learning objectives.',
              },
              {
                step: '03',
                title: 'Refine & export',
                description: 'Review the outline, request changes, and export your complete course.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 + index * 0.05 }}
              >
                <span className="text-4xl font-serif text-stone-300">{item.step}</span>
                <h3 className="font-medium text-stone-900 mt-4 mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-stone-500">
          <span>Built for the Gemini API Hackathon 2025</span>
          <span>Powered by Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
