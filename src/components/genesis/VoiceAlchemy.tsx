'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAlchemyProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceAlchemy({ onTranscript, disabled = false, className = '' }: VoiceAlchemyProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(32).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start visualization
      const updateVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);

        // Update visualizer bars
        setVisualizerData(Array.from(dataArray.slice(0, 32)).map((v) => v / 255));

        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());

        // Process recording
        if (chunksRef.current.length > 0) {
          setIsProcessing(true);
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          await processAudio(blob);
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setAudioLevel(0);
    setVisualizerData(new Array(32).fill(0));
  }, []);

  const processAudio = async (blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64 }),
        });

        const data = await response.json();

        if (data.success && data.transcript) {
          onTranscript(data.transcript);
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || isProcessing}
          onClick={toggleRecording}
          className={`
            relative w-12 h-12 rounded-xl transition-all duration-300
            ${isRecording
              ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white glow-nova'
              : 'text-stardust hover:text-white hover:bg-white/10'
            }
          `}
          style={{
            boxShadow: isRecording
              ? `0 0 ${20 + audioLevel * 40}px rgba(236, 72, 153, ${0.3 + audioLevel * 0.5})`
              : undefined,
          }}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}

          {/* Pulsing ring when recording */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-pink-500"
              animate={{
                scale: [1, 1.3 + audioLevel * 0.3],
                opacity: [0.5, 0],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </Button>
      </motion.div>

      {/* Expanded Visualizer Panel */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64"
          >
            <div className="glass-strong rounded-2xl p-4">
              {/* Visualizer bars */}
              <div className="flex items-end justify-center gap-0.5 h-16 mb-3">
                {visualizerData.map((value, index) => (
                  <motion.div
                    key={index}
                    className="w-1.5 rounded-full"
                    style={{
                      backgroundColor: `rgba(236, 72, 153, ${0.5 + value * 0.5})`,
                      height: `${Math.max(4, value * 64)}px`,
                    }}
                    animate={{ height: `${Math.max(4, value * 64)}px` }}
                    transition={{ duration: 0.05 }}
                  />
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <motion.div
                  className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-white">Listening...</span>
              </div>

              {/* Instruction */}
              <p className="text-xs text-stardust text-center mt-2">
                Speak your ideas, then click to stop
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4"
          >
            <div className="glass-strong rounded-xl px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#7c3aed' }} />
              <span className="text-sm text-white">Transcribing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact inline voice button
interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscript, disabled = false }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());

          if (chunksRef.current.length > 0) {
            setIsProcessing(true);
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64 }),
              });
              const data = await response.json();
              if (data.success && data.transcript) {
                onTranscript(data.transcript);
              }
              setIsProcessing(false);
            };
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled || isProcessing}
      onClick={toggleRecording}
      className={`
        shrink-0 rounded-xl transition-all
        ${isRecording
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'text-stardust hover:text-white hover:bg-white/5'
        }
      `}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
