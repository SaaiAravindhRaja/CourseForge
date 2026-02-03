'use client';

import { useState } from 'react';
import { Play, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCourseStore } from '@/store/courseStore';
import { v4 as uuidv4 } from 'uuid';

// Sample document content for demo
const DEMO_DOCUMENT = `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### Supervised Learning
In supervised learning, the algorithm learns from labeled training data. The model makes predictions based on input-output pairs.
- Classification: Predicting categorical outcomes
- Regression: Predicting continuous values

### Unsupervised Learning
Unsupervised learning works with unlabeled data to find hidden patterns.
- Clustering: Grouping similar data points
- Dimensionality reduction: Simplifying data while retaining important features

### Reinforcement Learning
The agent learns by interacting with an environment and receiving rewards or penalties.
- Used in game playing, robotics, and autonomous systems

## Key Concepts

### Features and Labels
- Features are input variables used for prediction
- Labels are the output variables we want to predict

### Training and Testing
- Training data is used to build the model
- Testing data evaluates model performance

### Model Evaluation
- Accuracy, precision, recall, F1-score
- Cross-validation for robust evaluation

## Common Algorithms

1. Linear Regression
2. Decision Trees
3. Random Forests
4. Support Vector Machines
5. Neural Networks
6. K-Means Clustering

## Best Practices

- Start with simple models
- Feature engineering is crucial
- Avoid overfitting
- Use cross-validation
- Monitor model performance in production
`;

// Pre-generated demo course for instant display
const DEMO_COURSE = {
  id: 'demo-course',
  title: 'Introduction to Machine Learning',
  description:
    'A comprehensive beginner-friendly course covering the fundamentals of machine learning, from basic concepts to practical applications.',
  targetAudience: 'Aspiring data scientists and developers new to ML',
  courseType: 'self-paced' as const,
  difficulty: 'beginner' as const,
  estimatedDuration: '4-6 hours',
  modules: [
    {
      id: uuidv4(),
      title: 'Foundations of Machine Learning',
      description: 'Understanding what ML is and why it matters',
      objectives: [
        { id: uuidv4(), text: 'Define machine learning and its relationship to AI', bloomLevel: 'understand' as const },
        { id: uuidv4(), text: 'Identify real-world applications of ML', bloomLevel: 'apply' as const },
      ],
      lessons: [
        {
          id: uuidv4(),
          title: 'What is Machine Learning?',
          objectives: [],
          content: `Machine learning is transforming how we solve problems. Instead of writing explicit rules, we let computers learn patterns from data.

**Why ML Matters:**
- Automates decision-making at scale
- Discovers insights humans might miss
- Improves over time with more data

Think of ML like teaching a child: instead of explaining every rule, you show examples until they understand the pattern.`,
          keyTakeaways: [
            'ML enables computers to learn from data',
            'It\'s different from traditional programming',
            'Applications range from recommendation systems to medical diagnosis',
          ],
          interactiveElements: [
            {
              id: uuidv4(),
              type: 'reflection' as const,
              title: 'Real-World ML',
              content: 'Think of 3 products you use daily that likely use machine learning.',
              instructions: 'Consider recommendation systems, search, voice assistants, etc.',
            },
          ],
        },
        {
          id: uuidv4(),
          title: 'Types of Machine Learning',
          objectives: [],
          content: `There are three main paradigms in machine learning, each suited for different problems.

**Supervised Learning** - Learning from labeled examples
- Classification: Is this email spam or not?
- Regression: What will the house price be?

**Unsupervised Learning** - Finding patterns in unlabeled data
- Clustering: Group similar customers together
- Anomaly detection: Find unusual transactions

**Reinforcement Learning** - Learning through trial and error
- Game playing (AlphaGo)
- Robotics control`,
          keyTakeaways: [
            'Supervised learning needs labeled data',
            'Unsupervised learning finds hidden patterns',
            'Reinforcement learning learns from rewards',
          ],
          interactiveElements: [],
        },
      ],
      quiz: {
        id: uuidv4(),
        title: 'Module 1 Quiz',
        questions: [
          {
            id: uuidv4(),
            type: 'mcq' as const,
            question: 'Which type of ML would you use to predict house prices?',
            options: ['Supervised (Regression)', 'Supervised (Classification)', 'Unsupervised', 'Reinforcement'],
            correctAnswer: 0,
            explanation: 'Predicting a continuous value like price is a regression problem under supervised learning.',
            bloomLevel: 'apply' as const,
            points: 10,
          },
          {
            id: uuidv4(),
            type: 'mcq' as const,
            question: 'What makes unsupervised learning different from supervised learning?',
            options: [
              'It works without labeled data',
              'It requires more computing power',
              'It can only do classification',
              'It needs human supervision',
            ],
            correctAnswer: 0,
            explanation: 'Unsupervised learning works with unlabeled data to find patterns.',
            bloomLevel: 'understand' as const,
            points: 10,
          },
        ],
        passingScore: 70,
      },
    },
    {
      id: uuidv4(),
      title: 'Supervised Learning Deep Dive',
      description: 'Master the most common ML paradigm',
      objectives: [
        { id: uuidv4(), text: 'Distinguish between classification and regression', bloomLevel: 'analyze' as const },
        { id: uuidv4(), text: 'Apply appropriate algorithms to problems', bloomLevel: 'apply' as const },
      ],
      lessons: [
        {
          id: uuidv4(),
          title: 'Classification Algorithms',
          objectives: [],
          content: `Classification predicts which category a data point belongs to.

**Common Algorithms:**
1. **Logistic Regression** - Despite the name, it\'s for classification
2. **Decision Trees** - Easy to interpret, handles non-linear data
3. **Random Forests** - Multiple trees for better accuracy
4. **Support Vector Machines** - Great for high-dimensional data

**Choosing the Right Algorithm:**
- Start simple (logistic regression)
- If that doesn\'t work, try tree-based methods
- Consider interpretability requirements`,
          keyTakeaways: [
            'Classification predicts categories',
            'Different algorithms suit different problems',
            'Start simple, then increase complexity',
          ],
          interactiveElements: [],
          videoScript: {
            id: uuidv4(),
            title: 'Classification Explained',
            duration: '5-7 min',
            script: `[VISUAL: Slide showing "Classification" with icons]

[PRESENTER]: "Welcome back! Today we're diving into classification - one of the most practical skills in machine learning."

[B-ROLL: Examples of classification - spam filter, image recognition]

[PRESENTER]: "Classification is about putting things into categories. Spam or not spam? Dog or cat? Fraudulent transaction or legitimate?"

[VISUAL: Simple diagram of decision boundary]

[PRESENTER]: "Let me show you how a classifier actually works..."`,
            visualNotes: ['Show decision boundary animation', 'Include real-world examples'],
            bRollSuggestions: ['Email inbox with spam', 'Photo sorting app', 'Bank fraud alert'],
          },
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Model Evaluation & Best Practices',
      description: 'Learn to measure and improve model performance',
      objectives: [
        { id: uuidv4(), text: 'Calculate and interpret evaluation metrics', bloomLevel: 'apply' as const },
        { id: uuidv4(), text: 'Identify and prevent overfitting', bloomLevel: 'evaluate' as const },
      ],
      lessons: [
        {
          id: uuidv4(),
          title: 'Evaluation Metrics',
          objectives: [],
          content: `How do you know if your model is good? Metrics tell the story.

**Key Metrics:**
- **Accuracy** - What % of predictions are correct?
- **Precision** - Of positive predictions, how many are right?
- **Recall** - Of actual positives, how many did we find?
- **F1 Score** - Harmonic mean of precision and recall

**When to Use What:**
- Balanced data? Accuracy works fine
- Imbalanced data? Focus on precision/recall
- Both matter? Use F1 score`,
          keyTakeaways: [
            'Accuracy isn\'t always the best metric',
            'Precision vs Recall is a trade-off',
            'Choose metrics based on business impact',
          ],
          interactiveElements: [
            {
              id: uuidv4(),
              type: 'exercise' as const,
              title: 'Metric Selection Challenge',
              content: 'For a cancer detection model, would you optimize for precision or recall?',
              instructions: 'Consider: What\'s worse - missing a cancer case or a false alarm?',
            },
          ],
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface QuickDemoProps {
  onStartDemo?: () => void;
}

export function QuickDemo({ onStartDemo }: QuickDemoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { setSourceDocument, setCourse, setStage, setProgress, addMessage } = useCourseStore();

  const startDemo = async () => {
    setIsLoading(true);
    setOpen(false);

    // Set demo document
    setSourceDocument({
      id: 'demo-doc',
      name: 'ml-fundamentals.md',
      type: 'text',
      content: DEMO_DOCUMENT,
      uploadedAt: new Date().toISOString(),
    });

    // Simulate loading stages with visual feedback
    setStage('analyzing');
    setProgress(10);
    await delay(500);

    setStage('outlining');
    setProgress(30);
    await delay(500);

    // Set the pre-generated course
    setCourse(DEMO_COURSE);
    setProgress(50);
    await delay(300);

    setStage('generating-content');
    setProgress(70);
    await delay(400);

    setStage('creating-assessments');
    setProgress(85);
    await delay(300);

    setStage('complete');
    setProgress(100);

    // Add welcome message
    addMessage({
      role: 'assistant',
      content: `Welcome to CourseForge! I've analyzed your document on Machine Learning and created a complete course outline.

**Your Course: Introduction to Machine Learning**
- 3 modules with 4 lessons
- 2 quizzes with 4 questions total
- Interactive exercises and reflection prompts
- Video script ready for the first lesson

You can now:
1. **Explore the outline** on the right panel
2. **Refine any module** - just tell me what to change
3. **Generate more content** - ask for more lessons or quizzes
4. **Export your course** - JSON or Markdown format

What would you like to adjust or explore first?`,
      agentRole: 'director',
    });

    setIsLoading(false);
    onStartDemo?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-demo-trigger
          className="gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20"
        >
          <Play className="h-4 w-4 text-amber-600" />
          <span className="hidden sm:inline">Quick Demo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Demo Mode
          </DialogTitle>
          <DialogDescription>
            See CourseForge in action with a pre-loaded Machine Learning document
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-amber-500" />
              What you'll see:
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                AI agents analyzing a document in real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Complete course outline with 3 modules
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Quizzes, exercises, and video scripts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Export-ready course in seconds
              </li>
            </ul>
          </div>
          <Button
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
            onClick={startDemo}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Demo...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Demo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
