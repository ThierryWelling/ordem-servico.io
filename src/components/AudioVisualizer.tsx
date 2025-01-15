import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  onVisualizerReady: (startFn: () => Promise<MediaStream>, stopFn: () => void) => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onVisualizerReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      visualize();
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };

  const stopAudioCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
  };

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const analyser = analyserRef.current;
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        canvasCtx.fillStyle = `rgb(50, 50, ${barHeight + 100})`;
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    onVisualizerReady(startAudioCapture, stopAudioCapture);

    return () => {
      stopAudioCapture();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={50}
      style={{ width: '100%', height: '50px' }}
    />
  );
};

export default AudioVisualizer; 