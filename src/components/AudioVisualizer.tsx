import React, { useRef, useState, useEffect } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
  onVisualizerReady?: (startFn: () => Promise<MediaStream>, stopFn: () => void) => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, onVisualizerReady }) => {
  const visualizerRef = useRef<HTMLDivElement>(null);
  const bars = useRef<HTMLDivElement[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const startAudioCapture = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      visualize();
      return stream;
    } catch (error) {
      console.error("Erro ao acessar o microfone:", error);
      throw error;
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!analyser) return;
      
      analyser.getByteFrequencyData(dataArray);

      bars.current.forEach((bar, index) => {
        if (!bar) return;
        const value = dataArray[index] || 0;
        bar.style.height = `${(value / 255) * 100}%`;
        bar.style.backgroundColor = `rgb(${value}, 50, 50)`;
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopAudioCapture = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    if (onVisualizerReady) {
      onVisualizerReady(startAudioCapture, stopAudioCapture);
    }
    return () => {
      stopAudioCapture();
    };
  }, [onVisualizerReady]);

  return (
    <div
      ref={visualizerRef}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        height: "40px",
        width: "200px",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "0 10px",
      }}
    >
      {Array.from({ length: 32 }).map((_, index) => (
        <div
          key={index}
          ref={(el) => el && (bars.current[index] = el)}
          style={{
            width: "3px",
            margin: "0 1px",
            backgroundColor: "#fff",
            height: "10%",
            transition: "height 0.1s",
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer; 