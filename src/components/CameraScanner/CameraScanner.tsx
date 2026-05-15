import React, { useEffect, useRef } from 'react';
import { useCamera } from '../../hooks/useCamera';
import './CameraScanner.css';

interface CameraScannerProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error, isLoading, startCamera, stopCamera, captureFrame } = useCamera();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current) {
      const imageData = captureFrame(videoRef.current);
      if (imageData) {
        onCapture(imageData);
      }
    }
  };

  if (error) {
    return (
      <div className="CameraScanner">
        <div className="CameraScanner-Error">
          <div className="CameraScanner-ErrorIcon">🚫</div>
          <p>{error}</p>
          <button className="App-ActionButton" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="CameraScanner">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="CameraScanner-Video"
      />
      
      <div className="CameraScanner-Overlay">
        <div className="CameraScanner-Viewfinder">
          <div className="CameraScanner-ScanLine" />
        </div>
        
        <button className="CameraScanner-Close" onClick={onClose}>
          &times;
        </button>

        <div className="CameraScanner-Controls">
          <button 
            className="CameraScanner-Button" 
            onClick={handleCapture}
            disabled={isLoading || !stream}
          >
            {isLoading ? 'Loading...' : 'Capture Plate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
