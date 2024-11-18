import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const App = () => {
  const videoRef = useRef(null);
  const grayscaleCanvasRef = useRef(null);
  const invertedCanvasRef = useRef(null);
  const sepiaCanvasRef = useRef(null);
  const blurCanvasRef = useRef(null);
  const edgeCanvasRef = useRef(null);
  const brightnessCanvasRef = useRef(null);
  const pixelationCanvasRef = useRef(null);
  const saturationCanvasRef = useRef(null);
  const mirrorCanvasRef = useRef(null);

  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            setVideoDimensions({
              width: video.videoWidth,
              height: video.videoHeight,
            });
            video.play();
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    startWebcam();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const grayscaleCanvas = grayscaleCanvasRef.current;
    const invertedCanvas = invertedCanvasRef.current;
    const sepiaCanvas = sepiaCanvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    const edgeCanvas = edgeCanvasRef.current;
    const brightnessCanvas = brightnessCanvasRef.current;
    const pixelationCanvas = pixelationCanvasRef.current;
    const saturationCanvas = saturationCanvasRef.current;
    const mirrorCanvas = mirrorCanvasRef.current;

    const applyEffects = () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const width = videoDimensions.width;
        const height = videoDimensions.height;

        const processEffect = (canvas, effectFn, flipHorizontally = false) => {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;

          // 좌우 반전이 필요한 경우
          if (flipHorizontally) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -width, 0, width, height);
            ctx.restore();
          } else {
            ctx.drawImage(video, 0, 0, width, height);
          }

          if (effectFn) {
            const frame = ctx.getImageData(0, 0, width, height);
            effectFn(frame.data);
            ctx.putImageData(frame, 0, 0);
          }
        };

        // Grayscale Effect
        processEffect(grayscaleCanvas, (data) => {
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
          }
        });

        // Inverted Effect
        processEffect(invertedCanvas, (data) => {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        });

        // Sepia Effect
        processEffect(sepiaCanvas, (data) => {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = 0.393 * r + 0.769 * g + 0.189 * b;
            data[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
            data[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
          }
        });

        // Blur Effect
        processEffect(blurCanvas, (data) => {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = (data[i] + data[i + 4] + data[i - 4]) / 3 || data[i];
            data[i + 1] = (data[i + 1] + data[i + 5] + data[i - 3]) / 3 || data[i + 1];
            data[i + 2] = (data[i + 2] + data[i + 6] + data[i - 2]) / 3 || data[i + 2];
          }
        });

        // Edge Detection Effect
        processEffect(edgeCanvas, (data) => {
          for (let i = 0; i < data.length; i += 4) {
            const diff = Math.abs(data[i] - data[i + 4]) + Math.abs(data[i] - data[i - 4]);
            data[i] = data[i + 1] = data[i + 2] = diff > 50 ? 255 : 0;
          }
        });

        // Brightness Adjustment
        processEffect(brightnessCanvas, (data) => {
          const brightness = 20;
          for (let i = 0; i < data.length; i += 4) {
            data[i] += brightness;
            data[i + 1] += brightness;
            data[i + 2] += brightness;
          }
        });

        // Pixelation Effect
        processEffect(pixelationCanvas, (data) => {
          const pixelSize = 10;
          for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
              const offset = (y * width + x) * 4;
              const r = data[offset];
              const g = data[offset + 1];
              const b = data[offset + 2];
              for (let dy = 0; dy < pixelSize; dy++) {
                for (let dx = 0; dx < pixelSize; dx++) {
                  const pos = ((y + dy) * width + (x + dx)) * 4;
                  if (pos < data.length) {
                    data[pos] = r;
                    data[pos + 1] = g;
                    data[pos + 2] = b;
                  }
                }
              }
            }
          }
        });

        // Saturation Adjustment
        processEffect(saturationCanvas, (data) => {
          const saturationFactor = 1.5;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.3 * r + 0.59 * g + 0.11 * b;
            data[i] = -gray * saturationFactor + data[i] * (1 + saturationFactor);
            data[i + 1] = -gray * saturationFactor + data[i + 1] * (1 + saturationFactor);
            data[i + 2] = -gray * saturationFactor + data[i + 2] * (1 + saturationFactor);
          }
        });

        // Mirror Effect (좌우 반전 전용)
        processEffect(mirrorCanvas, null, true);
      }
    };

    const interval = setInterval(applyEffects, 100);
    return () => clearInterval(interval);
  }, [videoDimensions]);

  const canvasStyle = {
    width: '300px',
    height: `${(300 * videoDimensions.height) / videoDimensions.width}px`,
    backgroundColor: 'gray',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: 'black', padding: '10px' }}>
      <div style={{ margin: '10px' }}>
        <h3 style={{ color: 'white', textAlign: 'center' }}>Original</h3>
        <video ref={videoRef} autoPlay playsInline muted style={canvasStyle} />
      </div>
      <div style={{ margin: '10px' }}>
        <h3 style={{ color: 'white', textAlign: 'center' }}>Face Detection</h3>
        <img
          src="http://localhost:5000/video_feed"
          alt="Face Detection Stream"
          style={canvasStyle}
        />
      </div>
      <div style={{ margin: '10px' }}>
        <h3 style={{ color: 'white', textAlign: 'center' }}>Grayscale</h3>
        <canvas ref={grayscaleCanvasRef} style={canvasStyle} />
      </div>
      <div style={{ margin: '10px' }}>
        <h3 style={{ color: 'white', textAlign: 'center' }}>Inverted</h3>
        <canvas ref={invertedCanvasRef} style={canvasStyle} />
      </div>
      <div style={{ margin: '10px'
      }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Sepia</h3>
      <canvas ref={sepiaCanvasRef} style={canvasStyle} />
    </div>
    <div style={{ margin: '10px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Blur</h3>
      <canvas ref={blurCanvasRef} style={canvasStyle} />
    </div>
    <div style={{ margin: '10px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Edge Detection</h3>
      <canvas ref={edgeCanvasRef} style={canvasStyle} />
    </div>
    <div style={{ margin: '10px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Brightness</h3>
      <canvas ref={brightnessCanvasRef} style={canvasStyle} />
    </div>
    <div style={{ margin: '10px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Pixelation</h3>
      <canvas ref={pixelationCanvasRef} style={canvasStyle} />
    </div>
    <div style={{ margin: '10px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Saturation</h3>
      <canvas ref={saturationCanvasRef} style={canvasStyle} />
    </div>
    <div style={{ margin: '10px' }}>
      <h3 style={{ color: 'white', textAlign: 'center' }}>Mirror</h3>
      <canvas ref={mirrorCanvasRef} style={canvasStyle} />
    </div>
  </div>
);
};

export default App;
