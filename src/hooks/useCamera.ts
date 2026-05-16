import { useState, useCallback, useRef } from 'react';

interface UseCameraResult {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: (videoElement: HTMLVideoElement) => string | null;
}

export const useCamera = (): UseCameraResult => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isActiveRef = useRef(false);

  const stopCamera = useCallback(() => {
    isActiveRef.current = false;
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API is not available. Please ensure you are using HTTPS and a modern browser.');
      setIsLoading(false);
      return;
    }

    // 1. Always stop previous stream if it exists
    const prevStream = streamRef.current;
    if (prevStream) {
      prevStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }

    isActiveRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 }, // 720p is optimal for mobile OCR speed/quality
          height: { ideal: 720 },
          // @ts-ignore - Some browsers support advanced constraints here
          focusMode: 'continuous',
          whiteBalanceMode: 'continuous'
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // 2. Check if we were cancelled while waiting
      if (!isActiveRef.current) {
        newStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        return;
      }

      // 3. Double check if another stream was started in the meantime
      const midStream = streamRef.current;
      if (midStream) {
        midStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      streamRef.current = newStream;
      setStream(newStream);
    } catch (err) {
      if (isActiveRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to access camera');
        console.error('Error accessing camera:', err);
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const captureFrame = useCallback((videoElement: HTMLVideoElement): string | null => {
    if (!videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    }

    return null;
  }, []);

  return {
    stream,
    error,
    isLoading,
    startCamera,
    stopCamera,
    captureFrame,
  };
};
