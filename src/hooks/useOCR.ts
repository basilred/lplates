import { useState, useEffect, useCallback, useRef } from 'react';
import { createWorker, PSM } from 'tesseract.js';
import { cvUtils } from '../utils/cvUtils';

export interface OCRResult {
  text: string;
  confidence: number;
  isStable: boolean;
  plateImage?: ImageData;
}

export const useOCR = (isActive: boolean, videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [isOCRReady, setIsOCRReady] = useState(false);
  const [lastResult, setLastResult] = useState<OCRResult | null>(null);
  const [previewResult, setPreviewResult] = useState<OCRResult | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  
  const resultsBufferRef = useRef<{text: string, conf: number}[]>([]);
  const missedFramesRef = useRef(0);
  const MAX_BUFFER_SIZE = 30; // More memory for shaky mobile cameras
  const CONSENSUS_THRESHOLD = 2;
  const MAX_MISSED_FRAMES = 15; // Be more patient on mobile
  
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const requestRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const lastProcessTimeRef = useRef<number>(0);

  const isActiveRef = useRef(isActive);
  
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // 1. Initialize Tesseract Worker
  useEffect(() => {
    const initWorker = async () => {
      if (!isActive) return;
      try {
        const worker = await createWorker('eng');
        
        // Russian plates use letters that look like Latin: A, B, E, K, M, H, O, P, C, T, X, Y
        const whitelist = '0123456789ABEKMHOPCTXYАВЕКМНОРСТХУ';
        
        await worker.setParameters({
          tessedit_char_whitelist: whitelist,
          tessedit_pageseg_mode: PSM.SINGLE_LINE,
        });
        
        if (isActiveRef.current) {
          workerRef.current = worker;
          setIsOCRReady(true);
        } else {
          await worker.terminate();
        }
      } catch (e) {
        if (isActiveRef.current) {
          const errorMsg = e instanceof Error ? e.message : 'Failed to init Tesseract';
          console.error('❌ Tesseract Init Error:', errorMsg);
          setInitError(errorMsg);
        }
      }
    };

    initWorker();

    return () => {
      if (workerRef.current) {
        const worker = workerRef.current;
        workerRef.current = null;
        // Delay termination to allow any active recognize() job to finish or abort cleanly
        // This prevents the "TypeError: Cannot read properties of null (reading 'postMessage')"
        setTimeout(() => {
          worker.terminate().catch(() => {});
        }, 100);
      }
      setIsOCRReady(false);
    };
  }, [isActive]);

  // 2. Main processing loop
  const processFrame = useCallback(async (time: number) => {
    if (!isActiveRef.current || !videoRef.current || !isOCRReady || !workerRef.current || isProcessingRef.current) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Throttle: Process more frequently for better responsiveness (every 100ms)
    if (time - lastProcessTimeRef.current < 100) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    const video = videoRef.current;
    if (video.readyState < 2) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      lastProcessTimeRef.current = time;
      const result = cvUtils.processFrame(video);
      
      if (result) {
        missedFramesRef.current = 0; // Reset missed frames
        isProcessingRef.current = true;

        try {
          const canvas = document.createElement('canvas');
          canvas.width = result.plateImage.width;
          canvas.height = result.plateImage.height;
          canvas.getContext('2d')?.putImageData(result.plateImage, 0, 0);

          // Defensive check: worker might have been terminated by useEffect cleanup
          if (!workerRef.current || !isActiveRef.current) {
            isProcessingRef.current = false;
            return;
          }

          const { data: { text, confidence } } = await workerRef.current.recognize(canvas);
          
          // Check again after await - vital for avoid crashes on unmount
          if (!workerRef.current || !isActiveRef.current) {
            isProcessingRef.current = false;
            return;
          }

          // 1. First pass: clean from anything except valid license plate chars
          const rawText = text.replace(/[^0123456789ABEKMHOPCTXYАВЕКМНОРСТХУ]/g, '').trim();

          // 2. Flexible Pattern Match: [Letter/0][3 Digits/T][2 Letters/0] + [Optional 2-3 Digits/T]
          // Making the region optional helps with stability
          const flexiblePattern = /[ABEKMHOPCTXYАВЕКМНОРСТХУ0][0-9T]{3}[ABEKMHOPCTXYАВЕКМНОРСТХУ0]{2}\s*([0-9T]{2,3})?/i;
          const match = rawText.match(flexiblePattern);
          
          let cleanText = '';
            if (match) {
              cleanText = match[0]
                .replace(/\s/g, '') // CRITICAL: Remove spaces before consensus
                .replace(/T/g, '7')
                .replace(/0/g, (_, offset) => {
                  // If we removed spaces, offset might change. Use the original string context.
                  // But here match[0] is already the substring.
                  const pos = offset;
                  if (pos === 0 || pos === 4 || pos === 5) return 'O';
                  return '0';
                });
            }

          if (cleanText) {
            missedFramesRef.current = 0; // Found something valid

            // Set preview result
            setPreviewResult({
              text: cleanText,
              confidence: confidence,
              isStable: false,
              plateImage: result.plateImage
            });

            // Add to stability buffer
            resultsBufferRef.current.push({ text: cleanText, conf: confidence });
            if (resultsBufferRef.current.length > MAX_BUFFER_SIZE) resultsBufferRef.current.shift();

            // Find consensus
            const counts: Record<string, { count: number, sumConf: number }> = {};
            resultsBufferRef.current.forEach(r => {
              if (!counts[r.text]) counts[r.text] = { count: 0, sumConf: 0 };
              counts[r.text].count++;
              counts[r.text].sumConf += r.conf;
            });

            const candidates = Object.keys(counts);
            
            // Separate full plates (>=8) and partial plates
            const fullPlates = candidates.filter(c => c.length >= 8);
            
            let bestText = '';
            let isStableMatch = false;

            // Priority 1: Best Full Plate that meets threshold AND confidence
            if (fullPlates.length > 0) {
              // Sort ONLY by count (8 and 9 chars are equal priority)
              fullPlates.sort((a, b) => counts[b].count - counts[a].count);
              
              const topFull = fullPlates[0];
              
              // Only stable if it's frequent (matched at least twice)
              // We trust consensus more than Tesseract's confidence score for long strings
              if (counts[topFull].count >= CONSENSUS_THRESHOLD) {
                bestText = topFull;
                isStableMatch = true;
              }
            }

            // Priority 2: If no stable full plate, pick any most frequent plate for preview
            if (!bestText) {
              candidates.sort((a, b) => counts[b].count - counts[a].count);
              bestText = candidates[0];
            }

            const bestInfo = counts[bestText];


            // Stable only if we found a full plate with enough matches
            if (isStableMatch) {
              setLastResult({
                text: bestText,
                confidence: bestInfo.sumConf / bestInfo.count,
                isStable: true,
                plateImage: result.plateImage
              });
            } else {
              setPreviewResult({
                text: bestText,
                confidence: bestInfo.sumConf / bestInfo.count,
                isStable: false,
                plateImage: result.plateImage
              });
              setLastResult(null);
            }
          } else {
            // No match in this frame, but keep previous preview for a few frames
            if (missedFramesRef.current > 3) {
              setPreviewResult(null);
            }
            setLastResult(null);
          }
        } catch (err) {
          // If worker was terminated or component deactivated, ignore the error
          if (workerRef.current && isActiveRef.current) {
            console.error('Tesseract recognition error:', err);
          }
        } finally {
          isProcessingRef.current = false;
        }
      } else {
        // Shaky camera support: don't clear buffer immediately
        missedFramesRef.current++;
        
        if (missedFramesRef.current >= MAX_MISSED_FRAMES) {
          if (resultsBufferRef.current.length > 0) {
            resultsBufferRef.current = [];
            setPreviewResult(null);
            setLastResult(null);
          }
        } else if (resultsBufferRef.current.length > 0 && missedFramesRef.current % 2 === 0) {
          // Slow fade out
          resultsBufferRef.current.shift();
        }
      }
    } catch (e) {
      if (isActiveRef.current) {
        console.error('OCR Process Error:', e);
      }
    }

    if (isActiveRef.current) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [isOCRReady, videoRef]);

  useEffect(() => {
    if (isActive && isOCRReady && !initError) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isOCRReady, initError, processFrame]);

  return {
    isReady: isOCRReady && !initError,
    lastResult,
    previewResult,
    isModelLoading: !isOCRReady && !initError,
    error: initError
  };
};
