import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const videoRef = useRef(null);
  const [asciiArt, setAsciiArt] = useState('');

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    startWebcam();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const asciiChars = '@%#*+=-:. '; // Dark to light characters

    const draw = () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth / 8;
        canvas.height = video.videoHeight / 8;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let ascii = '';
        for (let y = 0; y < frame.height; y++) {
          for (let x = 0; x < frame.width; x++) {
            const offset = (y * frame.width + x) * 4;
            const r = frame.data[offset];
            const g = frame.data[offset + 1];
            const b = frame.data[offset + 2];
            const brightness = (r + g + b) / 3;
            const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
            ascii += asciiChars[charIndex];
          }
          ascii += '\n';
        }
        setAsciiArt(ascii);
      }
      requestAnimationFrame(draw);
    };

    if (video) {
      video.addEventListener('canplay', draw);
    }

    return () => {
      if (video) {
        video.removeEventListener('canplay', draw);
      }
    };
  }, []);

  return (
    <div style={{ backgroundColor: 'black', color: 'white', fontFamily: 'monospace', whiteSpace: 'pre' }}>
      {/* Temporarily display the video to check if it's working */}
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '200px' }} />
      <pre>{asciiArt}</pre>
    </div>
  );
};

export default App;
