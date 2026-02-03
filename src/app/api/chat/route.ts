import { NextRequest, NextResponse } from 'next/server';
import { invokeDirector } from '@/lib/agents/director';
import { executeToolCall } from '@/lib/tools/executor';
import type { AgentMessage, AgentContext, Course } from '@/types';

export const maxDuration = 60;

interface ChatRequest {
  messages: AgentMessage[];
  context: AgentContext;
  currentState: {
    course: Course | null;
    sourceDocument: { content: string; name: string; type: string } | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, context, currentState } = body;

    // API stats tracking
    const startTime = Date.now();
    let totalApiCalls = 0;
    let totalTokens = 0;
    const modelsUsed: Set<string> = new Set();

    // Agentic loop - up to 10 iterations for tool calls
    let iteration = 0;
    const maxIterations = 10;
    let accumulatedText = '';
    const toolResults: Array<{ name: string; result: unknown }> = [];
    let stateUpdates: Record<string, unknown> = {};

    // Create a mutable copy of the state for tool execution
    let workingState = { ...currentState };

    while (iteration < maxIterations) {
      iteration++;

      // Build messages including any tool results from previous iterations
      const currentMessages = [
        ...messages,
        ...(accumulatedText
          ? [
              {
                id: `assistant_${iteration}`,
                role: 'assistant' as const,
                content: accumulatedText,
                timestamp: new Date().toISOString(),
              },
            ]
          : []),
        ...(toolResults.length > 0
          ? [
              {
                id: `tool_results_${iteration}`,
                role: 'tool' as const,
                content: JSON.stringify(toolResults),
                timestamp: new Date().toISOString(),
              },
            ]
          : []),
      ];

      const response = await invokeDirector(currentMessages, context);

      // Track API usage
      totalApiCalls++;
      modelsUsed.add('gemini-2.5-pro');
      // Estimate tokens (rough approximation)
      totalTokens += (response.text?.length || 0) / 4;

      // Accumulate text response
      if (response.text) {
        accumulatedText += (accumulatedText ? '\n\n' : '') + response.text;
      }

      // If no tool calls, we're done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        break;
      }

      // Execute tool calls
      toolResults.length = 0; // Clear previous results

      for (const toolCall of response.toolCalls) {
        const result = await executeToolCall(
          toolCall.name,
          toolCall.args,
          {
            course: workingState.course,
            sourceDocument: workingState.sourceDocument,
          }
        );

        toolResults.push({
          name: toolCall.name,
          result: result.data,
        });

        // Apply state updates
        if (result.stateUpdates) {
          if (result.stateUpdates.course) {
            workingState.course = {
              ...(workingState.course || {
                id: '',
                title: '',
                description: '',
                targetAudience: '',
                courseType: 'self-paced',
                difficulty: 'beginner',
                estimatedDuration: '',
                modules: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
              ...result.stateUpdates.course,
            } as Course;
          }
          stateUpdates = { ...stateUpdates, ...result.stateUpdates };
        }
      }

      // Check if we should continue (only if there are more tool calls to handle)
      if (response.finishReason === 'stop') {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      response: accumulatedText,
      stateUpdates,
      iterations: iteration,
      stats: {
        apiCalls: totalApiCalls,
        tokensGenerated: Math.round(totalTokens),
        modelsUsed: Array.from(modelsUsed),
        responseTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
