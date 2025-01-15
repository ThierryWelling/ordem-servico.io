import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  onVisualizerReady?: () => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onVisualizerReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!ctx) return;
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simulação simples de visualização
      const bars = 20;
      const barWidth = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height;
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth - 2,
          height
        );
      }
      
      requestAnimationFrame(draw);
    };

    draw();
    onVisualizerReady?.();

    return () => {
      // Cleanup
    };
  }, [onVisualizerReady]);

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