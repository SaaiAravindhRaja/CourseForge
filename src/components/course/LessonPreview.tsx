'use client';

import { useState } from 'react';
import {
  BookOpen,
  Video,
  ClipboardCheck,
  Lightbulb,
  ChevronLeft,
  X,
  Check,
  Play,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { Lesson, Module, QuizQuestion } from '@/types';

interface LessonPreviewProps {
  lesson: Lesson;
  module: Module;
  open: boolean;
  onClose: () => void;
}

export function LessonPreview({ lesson, module, open, onClose }: LessonPreviewProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const checkQuizAnswers = () => {
    setShowQuizResults(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{module.title}</p>
              <DialogTitle className="text-lg">{lesson.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-6">
            <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-4">
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Lesson
              </TabsTrigger>
              {lesson.videoScript && (
                <TabsTrigger
                  value="video"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video Script
                </TabsTrigger>
              )}
              {lesson.interactiveElements.length > 0 && (
                <TabsTrigger
                  value="activities"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Activities
                </TabsTrigger>
              )}
              {module.quiz && (
                <TabsTrigger
                  value="quiz"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Quiz
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 h-[calc(90vh-140px)]">
            <TabsContent value="content" className="m-0 p-6">
              {/* Learning Objectives */}
              {lesson.objectives.length > 0 && (
                <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold text-sm mb-2">Learning Objectives</h3>
                  <ul className="space-y-1">
                    {lesson.objectives.map((obj) => (
                      <li key={obj.id} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {obj.text}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Main Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {lesson.content ? (
                  <div className="whitespace-pre-wrap">{lesson.content}</div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Content not yet generated. Ask the Director to generate content for this lesson.
                  </p>
                )}
              </div>

              {/* Key Takeaways */}
              {lesson.keyTakeaways.length > 0 && (
                <Card className="p-4 mt-6 bg-amber-500/5 border-amber-500/20">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Key Takeaways
                  </h3>
                  <ul className="space-y-1">
                    {lesson.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="video" className="m-0 p-6">
              {lesson.videoScript && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{lesson.videoScript.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Duration: {lesson.videoScript.duration}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Play className="h-4 w-4" />
                      Preview (Coming Soon)
                    </Button>
                  </div>

                  <Card className="p-4 bg-muted/30">
                    <h4 className="font-medium text-sm mb-3">Script</h4>
                    <pre className="text-sm whitespace-pre-wrap font-mono bg-background p-4 rounded-lg">
                      {lesson.videoScript.script}
                    </pre>
                  </Card>

                  {lesson.videoScript.bRollSuggestions && lesson.videoScript.bRollSuggestions.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium text-sm mb-2">B-Roll Suggestions</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {lesson.videoScript.bRollSuggestions.map((suggestion, i) => (
                          <li key={i}>• {suggestion}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activities" className="m-0 p-6">
              <div className="space-y-4">
                {lesson.interactiveElements.map((element) => (
                  <Card key={element.id} className="p-4">
                    <Badge variant="secondary" className="mb-2 capitalize">
                      {element.type}
                    </Badge>
                    <h4 className="font-medium mb-2">{element.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{element.content}</p>
                    {element.instructions && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        <strong>Instructions:</strong> {element.instructions}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="m-0 p-6">
              {module.quiz && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{module.quiz.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.quiz.questions.length} questions • Pass: {module.quiz.passingScore}%
                      </p>
                    </div>
                    {showQuizResults && (
                      <Button variant="outline" size="sm" onClick={resetQuiz}>
                        Retry Quiz
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {module.quiz.questions.map((question, qIndex) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={qIndex}
                        selectedAnswer={quizAnswers[question.id]}
                        onAnswer={(answer) => handleQuizAnswer(question.id, answer)}
                        showResult={showQuizResults}
                      />
                    ))}
                  </div>

                  {!showQuizResults && Object.keys(quizAnswers).length === module.quiz.questions.length && (
                    <Button className="w-full" onClick={checkQuizAnswers}>
                      Check Answers
                    </Button>
                  )}

                  {showQuizResults && (
                    <Card className="p-4 bg-primary/5">
                      <div className="text-center">
                        <p className="text-2xl font-bold mb-1">
                          {calculateScore(module.quiz.questions, quizAnswers)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {calculateScore(module.quiz.questions, quizAnswers) >= module.quiz.passingScore
                            ? 'Congratulations! You passed!'
                            : 'Keep practicing!'}
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  selectedAnswer?: number;
  onAnswer: (answer: number) => void;
  showResult: boolean;
}

function QuestionCard({ question, index, selectedAnswer, onAnswer, showResult }: QuestionCardProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className={`p-4 ${showResult ? (isCorrect ? 'border-green-500/50' : 'border-red-500/50') : ''}`}>
      <p className="font-medium mb-3">
        {index + 1}. {question.question}
      </p>
      <div className="space-y-2">
        {question.options?.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrectAnswer = i === question.correctAnswer;

          return (
            <button
              key={i}
              onClick={() => !showResult && onAnswer(i)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                showResult
                  ? isCorrectAnswer
                    ? 'bg-green-500/10 border-green-500/50'
                    : isSelected
                    ? 'bg-red-500/10 border-red-500/50'
                    : ''
                  : isSelected
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          );
        })}
      </div>
      {showResult && question.explanation && (
        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Explanation:</strong> {question.explanation}
        </p>
      )}
    </Card>
  );
}

function calculateScore(questions: QuizQuestion[], answers: Record<string, number>): number {
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  return Math.round((correct / questions.length) * 100);
}
