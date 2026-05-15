import React, { useEffect, useRef } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useOCR } from '../../hooks/useOCR';
import './CameraScanner.css';

interface CameraScannerProps {
  onCapture: (plate: string) => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error, isLoading: isCameraLoading, startCamera, stopCamera } = useCamera();
  const { isReady: isOCRReady, lastResult, isModelLoading } = useOCR(!!stream, videoRef);

  const isInitialLoading = isCameraLoading || isModelLoading || !isOCRReady;

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

  const handleManualCapture = () => {
    if (lastResult) {
      onCapture(lastResult.text);
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
          {lastResult && (
            <div className="CameraScanner-Result">
              {lastResult.text}
            </div>
          )}
        </div>
        
        <button className="CameraScanner-Close" onClick={onClose}>
          &times;
        </button>

        <div className="CameraScanner-Controls">
          <div className="CameraScanner-Status">
            {!isOCRReady ? 'Initializing AI...' : lastResult ? 'Plate Detected' : 'Scanning...'}
          </div>
          
          <button 
            className="CameraScanner-Button" 
            onClick={handleManualCapture}
            disabled={isInitialLoading || !stream}
          >
            {isInitialLoading ? 'Loading...' : 'Manual Capture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
