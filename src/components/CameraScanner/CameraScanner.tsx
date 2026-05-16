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
  const { stream, error: cameraError, isLoading: isCameraLoading, startCamera, stopCamera } = useCamera();
  const { isReady: isOCRReady, lastResult, previewResult, isModelLoading, error: ocrError } = useOCR(!!stream, videoRef);

  const isInitialLoading = isCameraLoading || isModelLoading;
  const error = cameraError || ocrError;

  // Auto-capture when stable
  // Persistent stable result to avoid timer resets on mobile jitter
  const stableResultRef = useRef<{text: string, time: number} | null>(null);

  useEffect(() => {
    if (lastResult?.isStable) {
      stableResultRef.current = { text: lastResult.text, time: Date.now() };
    } else if (stableResultRef.current && Date.now() - stableResultRef.current.time > 1000) {
      // Only clear after 1 second of no stable frames
      stableResultRef.current = null;
    }

    if (stableResultRef.current) {
      const timer = setTimeout(() => {
        if (stableResultRef.current) {
          onCapture(stableResultRef.current.text);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [lastResult, onCapture]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      startCamera();
    }
    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []); // Run only once on mount

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleManualCapture = () => {
    const result = lastResult || previewResult;
    if (result) {
      onCapture(result.text);
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

  const status = lastResult ? 'stable' : (previewResult ? 'detecting' : 'idle');

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
        <div className={`CameraScanner-Viewfinder CameraScanner-Viewfinder_${status}`}>
          <div className="CameraScanner-ScanLine" />
          {(lastResult || previewResult) && (
            <div className={`CameraScanner-Result CameraScanner-Result_${status}`}>
              {(lastResult || previewResult)?.text}
            </div>
          )}
        </div>
        
        <button className="CameraScanner-Close" onClick={onClose}>
          &times;
        </button>

        <div className="CameraScanner-Controls">
          <div className="CameraScanner-Status">
            {ocrError ? `AI Error: ${ocrError.slice(0, 30)}...` : 
             !isOCRReady ? 'Initializing AI...' : 
             lastResult ? 'Plate Recognized' : 
             previewResult ? 'Detecting...' : 'Scanning...'}
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
