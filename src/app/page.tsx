'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landing } from '@/components/landing/Landing';
import { Workspace } from '@/components/workspace/Workspace';
import { useCourseStore } from '@/store/courseStore';
import { Upload, FileText, X, Loader2, Play, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Demo document content
const DEMO_DOCUMENT = `# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### Supervised Learning
In supervised learning, the algorithm learns from labeled training data.
- Classification: Predicting categorical outcomes
- Regression: Predicting continuous values

### Unsupervised Learning
Unsupervised learning works with unlabeled data to find hidden patterns.
- Clustering: Grouping similar data points
- Dimensionality reduction: Simplifying data

### Reinforcement Learning
The agent learns by interacting with an environment and receiving rewards.

## Key Concepts

### Features and Labels
- Features are input variables used for prediction
- Labels are the output variables we want to predict

### Model Evaluation
- Accuracy, precision, recall, F1-score
- Cross-validation for robust evaluation

## Common Algorithms

1. Linear Regression
2. Decision Trees
3. Random Forests
4. Neural Networks
5. K-Means Clustering`;

// Pre-generated demo course
const DEMO_COURSE = {
  id: 'demo-course',
  title: 'Introduction to Machine Learning',
  description: 'A comprehensive beginner-friendly course covering the fundamentals of machine learning.',
  targetAudience: 'Aspiring data scientists and developers',
  courseType: 'self-paced' as const,
  difficulty: 'beginner' as const,
  estimatedDuration: '4-6 hours',
  modules: [
    {
      id: 'mod-1',
      title: 'Foundations of Machine Learning',
      description: 'Understanding what ML is and why it matters',
      objectives: [
        { id: 'obj-1', text: 'Define machine learning and its relationship to AI', bloomLevel: 'understand' as const },
        { id: 'obj-2', text: 'Identify real-world applications of ML', bloomLevel: 'apply' as const },
      ],
      lessons: [
        {
          id: 'les-1',
          title: 'What is Machine Learning?',
          objectives: [],
          content: `Machine learning is transforming how we solve problems. Instead of writing explicit rules, we let computers learn patterns from data.

**Why ML Matters:**
- Automates decision-making at scale
- Discovers insights humans might miss
- Improves over time with more data`,
          keyTakeaways: ['ML enables computers to learn from data', 'It differs from traditional programming'],
          interactiveElements: [
            {
              id: 'int-1',
              type: 'reflection' as const,
              title: 'Real-World ML',
              content: 'Think of 3 products you use daily that likely use machine learning.',
              instructions: 'Consider recommendation systems, search, voice assistants',
            },
          ],
        },
        {
          id: 'les-2',
          title: 'Types of Machine Learning',
          objectives: [],
          content: `There are three main paradigms in machine learning.

**Supervised Learning** - Learning from labeled examples
**Unsupervised Learning** - Finding patterns in unlabeled data
**Reinforcement Learning** - Learning through trial and error`,
          keyTakeaways: ['Supervised learning needs labeled data', 'Unsupervised learning finds hidden patterns'],
          interactiveElements: [],
        },
      ],
      quiz: {
        id: 'quiz-1',
        title: 'Module 1 Quiz',
        questions: [
          {
            id: 'q-1',
            type: 'mcq' as const,
            question: 'Which type of ML would you use to predict house prices?',
            options: ['Supervised (Regression)', 'Supervised (Classification)', 'Unsupervised', 'Reinforcement'],
            correctAnswer: 0,
            explanation: 'Predicting a continuous value like price is a regression problem.',
            bloomLevel: 'apply' as const,
            points: 10,
          },
        ],
        passingScore: 70,
      },
    },
    {
      id: 'mod-2',
      title: 'Supervised Learning Deep Dive',
      description: 'Master the most common ML paradigm',
      objectives: [
        { id: 'obj-3', text: 'Distinguish between classification and regression', bloomLevel: 'analyze' as const },
      ],
      lessons: [
        {
          id: 'les-3',
          title: 'Classification Algorithms',
          objectives: [],
          content: `Classification predicts which category a data point belongs to.

**Common Algorithms:**
1. Logistic Regression
2. Decision Trees
3. Random Forests
4. Support Vector Machines`,
          keyTakeaways: ['Classification predicts categories', 'Start simple, then increase complexity'],
          interactiveElements: [],
          videoScript: {
            id: 'vs-1',
            title: 'Classification Explained',
            duration: '5-7 min',
            script: `[VISUAL: Slide showing "Classification"]
[PRESENTER]: "Welcome back! Today we're diving into classification..."`,
            visualNotes: ['Show decision boundary animation'],
            bRollSuggestions: ['Email inbox with spam filter'],
          },
        },
      ],
    },
    {
      id: 'mod-3',
      title: 'Model Evaluation',
      description: 'Learn to measure model performance',
      objectives: [
        { id: 'obj-4', text: 'Calculate evaluation metrics', bloomLevel: 'apply' as const },
      ],
      lessons: [
        {
          id: 'les-4',
          title: 'Evaluation Metrics',
          objectives: [],
          content: `**Key Metrics:**
- Accuracy - What % of predictions are correct?
- Precision - Of positive predictions, how many are right?
- Recall - Of actual positives, how many did we find?
- F1 Score - Harmonic mean of precision and recall`,
          keyTakeaways: ['Accuracy is not always the best metric', 'Choose metrics based on business impact'],
          interactiveElements: [],
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sourceDocument, setSourceDocument, setCourse, setStage, setProgress, addMessage, resetSession } =
    useCourseStore();

  const handleReset = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 85));
      }, 150);

      // Upload file to API for processing
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 200));

      setSourceDocument({
        id: crypto.randomUUID(),
        name: data.document.name,
        type: data.document.type,
        content: data.document.content,
        uploadedAt: new Date().toISOString(),
      });

      setShowUploadModal(false);
      setStage('analyzing');
      setProgress(10);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try a different file or use the demo.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [setSourceDocument, setStage, setProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDemoClick = useCallback(async () => {
    setIsProcessing(true);
    setShowUploadModal(false);

    // Simulate loading with smooth progress
    setStage('analyzing');
    setProgress(10);
    await new Promise((r) => setTimeout(r, 400));

    setSourceDocument({
      id: 'demo-doc',
      name: 'ml-fundamentals.md',
      type: 'text',
      content: DEMO_DOCUMENT,
      uploadedAt: new Date().toISOString(),
    });

    setProgress(30);
    await new Promise((r) => setTimeout(r, 300));

    setStage('outlining');
    setProgress(50);
    await new Promise((r) => setTimeout(r, 300));

    setCourse(DEMO_COURSE);
    setProgress(70);
    await new Promise((r) => setTimeout(r, 200));

    setStage('generating-content');
    setProgress(85);
    await new Promise((r) => setTimeout(r, 200));

    setStage('complete');
    setProgress(100);

    addMessage({
      role: 'assistant',
      content: `Welcome! I've analyzed your document on Machine Learning and created a complete course structure.

**Your Course: Introduction to Machine Learning**
- 3 modules with 4 lessons
- Interactive exercises and quizzes
- Video script ready for production

You can now:
1. **Explore** the outline on the right
2. **Refine** any module - just tell me what to change
3. **Generate** more content - ask for more lessons or quizzes
4. **Export** your course when ready

What would you like to do first?`,
      agentRole: 'director',
    });

    setIsProcessing(false);
  }, [setSourceDocument, setCourse, setStage, setProgress, addMessage]);

  // Show landing page if no document
  if (!sourceDocument) {
    return (
      <>
        <Landing
          onUploadClick={() => setShowUploadModal(true)}
          onDemoClick={handleDemoClick}
        />

        {/* Premium Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => !isProcessing && setShowUploadModal(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[--paper-900]/70 backdrop-blur-sm"
              />

              {/* Modal */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                transition={{ type: 'spring', duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg"
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-[--paper-200] overflow-hidden">
                  {/* Header */}
                  <div className="relative px-8 pt-8 pb-6 text-center">
                    {/* Close button */}
                    {!isProcessing && (
                      <button
                        onClick={() => setShowUploadModal(false)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[--paper-400] hover:text-[--paper-600] hover:bg-[--paper-100] transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}

                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--ember-100] to-[--ember-200] mx-auto mb-5 flex items-center justify-center"
                    >
                      <Upload className="h-8 w-8 text-[--ember-600]" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="font-serif text-2xl font-semibold text-[--paper-900] mb-2"
                    >
                      Upload Document
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-[--paper-500]"
                    >
                      Transform your content into a structured course
                    </motion.p>
                  </div>

                  {/* Drop Zone */}
                  <div className="px-8 pb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-300
                        ${isDragging
                          ? 'border-[--ember-400] bg-[--ember-50] scale-[1.02]'
                          : 'border-[--paper-300] hover:border-[--ember-300] hover:bg-[--paper-50]'
                        }
                        ${isProcessing ? 'pointer-events-none' : ''}
                      `}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />

                      {isProcessing ? (
                        <div className="py-4">
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <svg className="w-16 h-16 progress-ring" viewBox="0 0 64 64">
                              <circle
                                className="text-[--paper-200]"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="transparent"
                                r="28"
                                cx="32"
                                cy="32"
                              />
                              <circle
                                className="text-[--ember-500]"
                                strokeWidth="4"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="28"
                                cx="32"
                                cy="32"
                                style={{
                                  strokeDasharray: 175.93,
                                  strokeDashoffset: 175.93 - (uploadProgress / 100) * 175.93,
                                  transition: 'stroke-dashoffset 0.3s ease',
                                }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-[--ember-500] animate-pulse" />
                            </div>
                          </div>
                          <p className="text-[--paper-900] font-medium mb-1">Processing document...</p>
                          <p className="text-sm text-[--paper-500]">{uploadProgress}% complete</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-xl bg-[--paper-100] mx-auto mb-4 flex items-center justify-center">
                            <FileText className="h-7 w-7 text-[--paper-400]" />
                          </div>
                          <p className="text-[--paper-900] font-medium mb-1">
                            Drop your document here
                          </p>
                          <p className="text-sm text-[--paper-500] mb-4">
                            or click to browse files
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {['PDF', 'TXT', 'MD', 'DOC'].map((format) => (
                              <span
                                key={format}
                                className="badge-forge badge-forge-neutral text-xs"
                              >
                                {format}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Footer with Demo option */}
                  {!isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="px-8 pb-8"
                    >
                      <div className="divider-label mb-6">or try a demo</div>
                      <Button
                        onClick={handleDemoClick}
                        disabled={isProcessing}
                        className="w-full btn-forge btn-forge-secondary h-12 text-base"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Quick Demo with Sample Document
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Show workspace when document is loaded
  return <Workspace onReset={handleReset} />;
}
