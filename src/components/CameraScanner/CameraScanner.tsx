import React, { useEffect, useRef, useState, useContext } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useOCR } from '../../hooks/useOCR';
import LanguageContext from '../../contexts/LanguageContext';
import { triggerHaptic, ensureHapticContext } from '../../utils/haptic';
import './CameraScanner.css';

interface CameraScannerProps {
  onCapture: (plate: string) => void;
  onClose: () => void;
}

const DEFAULT_CONTEXT = { t: (key: string) => key };

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error: cameraError, isLoading: isCameraLoading, startCamera, stopCamera } = useCamera();
  const { isReady: isOCRReady, lastResult, previewResult, isModelLoading, error: ocrError } = useOCR(!!stream, videoRef);

  const languageContext = useContext(LanguageContext);
  const { t } = languageContext || DEFAULT_CONTEXT;

  const isInitialLoading = isCameraLoading || isModelLoading;
  const error = cameraError || ocrError;

  // Auto-capture when stable
  // Persistent stable result to avoid timer resets on mobile jitter
  const stableResultRef = useRef<{text: string, time: number} | null>(null);
  const lastVibratedTextRef = useRef<string | null>(null);
  const hapticInitedRef = useRef(false);
  const [popView, setPopView] = useState(false);

  const initHapticOnGesture = () => {
    if (!hapticInitedRef.current) {
      ensureHapticContext();
      hapticInitedRef.current = true;
    }
  };

  useEffect(() => {
    if (lastResult?.isStable) {
      const isNewResult = lastResult.text !== lastVibratedTextRef.current;
      
      stableResultRef.current = { text: lastResult.text, time: Date.now() };

      if (isNewResult) {
        triggerHaptic(200);
        setPopView(true);
        setTimeout(() => setPopView(false), 300);
        lastVibratedTextRef.current = lastResult.text;
      }
    } else if (stableResultRef.current && Date.now() - stableResultRef.current.time > 1000) {
      // Only clear after 1 second of no stable frames
      stableResultRef.current = null;
      lastVibratedTextRef.current = null;
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

    // Test hook for E2E automation
    const handleTestCapture = (e: any) => {
      if (e.detail?.plate) {
        onCapture(e.detail.plate);
      }
    };
    window.addEventListener('__test_ocr_capture__', handleTestCapture);

    return () => {
      isMounted = false;
      stopCamera();
      window.removeEventListener('__test_ocr_capture__', handleTestCapture);
    };
  }, [onCapture]); // Added onCapture to deps

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
      <div className="CameraScanner" onClick={initHapticOnGesture}>
        <div className="CameraScanner-Error">
          <div className="CameraScanner-ErrorIcon">🚫</div>
          <p>{error}</p>
          <button className="App-ActionButton" onClick={onClose}>
            {t('camera.close')}
          </button>
        </div>
      </div>
    );
  }

  const status = lastResult ? 'stable' : (previewResult ? 'detecting' : 'idle');

  const statusText = (() => {
    if (ocrError) return `${t('camera.error')}: ${ocrError.slice(0, 30)}...`;
    if (!isOCRReady) return t('camera.initializing');
    if (lastResult) return t('camera.recognized');
    if (previewResult) return t('camera.detecting');
    return t('camera.scanning');
  })();

  return (
    <div className="CameraScanner" onClick={initHapticOnGesture}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="CameraScanner-Video"
      />

      <div className="CameraScanner-Overlay">
        {isInitialLoading ? (
          <div className="CameraScanner-Skeleton" aria-label={t('camera.initializing')}>
            <div className="CameraScanner-SkeletonLine" />
            <div className="CameraScanner-SkeletonLine CameraScanner-SkeletonLine_short" />
          </div>
        ) : (
          <div className={`CameraScanner-Viewfinder CameraScanner-Viewfinder_${status}${popView ? ' CameraScanner-Viewfinder_popping' : ''}`}>
            <div className="CameraScanner-ScanLine" />
            {(lastResult || previewResult) && (
              <div className={`CameraScanner-Result CameraScanner-Result_${status}`}>
                {(lastResult || previewResult)?.text}
              </div>
            )}
          </div>
        )}
        
        <button className="CameraScanner-Close" onClick={onClose} aria-label={t('camera.close')}>
          &times;
        </button>

        <div className="CameraScanner-Controls">
          <div className={`CameraScanner-Status CameraScanner-Status_${status}`}>
            {statusText}
          </div>
          
          <button 
            className="CameraScanner-Button" 
            onClick={handleManualCapture}
            disabled={isInitialLoading || !stream}
          >
            {isInitialLoading ? t('camera.loading') : t('camera.manualCapture')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
