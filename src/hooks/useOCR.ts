import { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { cvUtils } from '../utils/cvUtils';

export interface OCRResult {
  text: string;
  confidence: number;
  isStable: boolean;
}

export const useOCR = (isActive: boolean, videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCVReady, setIsCVReady] = useState(false);
  const [lastResult, setLastResult] = useState<OCRResult | null>(null);
  
  const modelRef = useRef<tf.LayersModel | null>(null);
  const requestRef = useRef<number | null>(null);

  // Character map for the model (0-9, A-Z)
  const CHAR_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // 1. Initialize TF.js and load model
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Initializing OCR...');
        await tf.ready();
        
        const modelUrl = `${import.meta.env.BASE_URL}models/char_classifier/model.json`.replace('//', '/');
        console.log('Loading model from:', modelUrl);
        modelRef.current = await tf.loadLayersModel(modelUrl);
        
        console.log('✅ OCR Model loaded successfully');
        setIsModelLoading(false);
      } catch (e) {
        console.error('❌ Failed to load OCR model', e);
      }
    };
    loadModel();
  }, []);

  // 2. Wait for OpenCV
  useEffect(() => {
    console.log('Starting OpenCV check...');
    const checkCV = setInterval(() => {
      if (typeof cv !== 'undefined') {
        if (cv.Mat !== undefined) {
          console.log('✅ OpenCV.js is fully ready');
          setIsCVReady(true);
          clearInterval(checkCV);
        } else {
          console.log('⏳ OpenCV is defined, but Mat is not yet available (initializing...)');
        }
      }
    }, 1000);
    return () => clearInterval(checkCV);
  }, []);

  // 3. Main processing loop
  const processFrame = useCallback(async () => {
    if (!isActive || !videoRef.current || !isCVReady || isModelLoading || !modelRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const result = cvUtils.processFrame(video);
      
      if (result && result.charImages.length > 0) {
        try {
          // Process each character through the model
          const predictions = await Promise.all(result.charImages.map(async (imageData) => {
            return tf.tidy(() => {
              // Convert ImageData to tensor, normalize to grayscale [0, 1]
              // The model expects 28x28 grayscale
              const tensor = tf.browser.fromPixels(imageData, 1)
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims(0);
              
              const prediction = modelRef.current!.predict(tensor) as tf.Tensor;
              const charIndex = prediction.argMax(1).dataSync()[0];
              const confidence = prediction.max().dataSync()[0];
              
              return { char: CHAR_MAP[charIndex], confidence };
            });
          }));

          const text = predictions.map(p => p.char).join('');
          const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

          if (text.length >= 3) {
            setLastResult({
              text,
              confidence: avgConfidence,
              isStable: true
            });
          }
        } catch (err) {
          console.error('Inference error:', err);
        }
      } else {
        setLastResult(null);
      }
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [isActive, isCVReady, isModelLoading, videoRef]);

  useEffect(() => {
    if (isActive && isCVReady && !isModelLoading) {
      requestRef.current = requestAnimationFrame(processFrame);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isCVReady, isModelLoading, processFrame]);

  return {
    isReady: isCVReady && !isModelLoading,
    lastResult,
    isModelLoading
  };
};
