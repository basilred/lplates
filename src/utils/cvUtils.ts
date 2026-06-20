/**
 * OpenCV Utilities for License Plate Recognition
 */

export interface PlateDetectionResult {
  plateImage: ImageData;
  mainImage?: ImageData;
  regionImage?: ImageData;
  charImages: ImageData[];
}

/**
 * Main OCR pipeline utility
 */
export const cvUtils = {
  /**
   * Checks if OpenCV is fully loaded and initialized
   */
  isReady: (): boolean => {
    try {
      return typeof cv !== 'undefined' && cv.Mat !== undefined;
    } catch (e) {
      return false;
    }
  },

  /**
   * Process a frame from the video feed
   * Returns character images if a plate is found
   */
  processFrame: (video: HTMLVideoElement): PlateDetectionResult | null => {
    if (!cvUtils.isReady()) return null;

    const width = video.videoWidth || video.width;
    const height = video.videoHeight || video.height;
    if (width === 0 || height === 0) return null;

    // 1. Prepare canvases: Small for detection (performance), Full for extraction (OCR quality)
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = width;
    fullCanvas.height = height;
    const fullCtx = fullCanvas.getContext('2d');
    if (!fullCtx) return null;
    fullCtx.drawImage(video, 0, 0, width, height);

    // Optimal width for contour detection (prevents CPU choking on mobile)
    const TARGET_DETECTION_WIDTH = 800;
    const scale = Math.min(1.0, TARGET_DETECTION_WIDTH / width);
    const sw = Math.floor(width * scale);
    const sh = Math.floor(height * scale);

    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = sw;
    smallCanvas.height = sh;
    const smallCtx = smallCanvas.getContext('2d');
    if (!smallCtx) return null;
    smallCtx.drawImage(fullCanvas, 0, 0, sw, sh);

    let srcFull = cv.imread(fullCanvas);
    let srcSmall = cv.imread(smallCanvas);
    let gray = new cv.Mat();
    let blurred = new cv.Mat();
    let edged = new cv.Mat();
    
    // 1. Preprocessing (on downscaled image)
    cv.cvtColor(srcSmall, gray, cv.COLOR_RGBA2GRAY);
    // Faster GaussianBlur instead of BilateralFilter for mobile performance
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edged, 30, 200);

    // 1.5 Morphological Closing: Bridge the gap between main part and region code
    // Use a horizontal kernel to connect parts of the plate separated by vertical lines
    let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(20, 3));
    cv.morphologyEx(edged, edged, cv.MORPH_CLOSE, kernel);
    kernel.delete();

    // 2. Find contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    let plateResult: PlateDetectionResult | null = null;
    let maxPlateWidth = 0;

    // 3. Filter contours and pick the BEST (widest) candidate
    for (let i = 0; i < contours.size(); ++i) {
      let cnt = contours.get(i);
      let peri = cv.arcLength(cnt, true);
      let approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

      if (approx.rows === 4) {
        let rect = cv.boundingRect(cnt);
        let aspectRatio = rect.width / rect.height;

        const isCorrectShape = aspectRatio > 2.0 && aspectRatio < 6.5;
        const isCorrectSize = rect.width > sw * 0.08;

        if (isCorrectShape && isCorrectSize && rect.width > maxPlateWidth) {
          // Found a potential full plate!
          maxPlateWidth = rect.width;
          
          // SCALE COORDINATES BACK to full resolution
          let scaledApprox = new cv.Mat(approx.rows, approx.cols, approx.type());
          for (let j = 0; j < 4; j++) {
            scaledApprox.data32S[j * 2] = Math.floor(approx.data32S[j * 2]! / scale);
            scaledApprox.data32S[j * 2 + 1] = Math.floor(approx.data32S[j * 2 + 1]! / scale);
          }
          
          // Temporary extract to check if it works
          const currentResult = cvUtils.extractPlate(srcFull, scaledApprox);
          if (currentResult) {
            plateResult = currentResult;
          }
          scaledApprox.delete();
        }
      }
      approx.delete();
    }

    // Cleanup
    srcFull.delete(); srcSmall.delete(); gray.delete(); blurred.delete(); edged.delete();
    contours.delete(); hierarchy.delete();

    return plateResult;
  },

  /**
   * Warps the plate perspective and segments into characters
   */
  extractPlate: (src: CVMat, approx: CVMat): PlateDetectionResult | null => {
    // 1. Perspective Warp with Padding
    const plateWidth = 640; // Slightly wider for padding
    const plateHeight = 160;
    
    let points = [];
    for (let i = 0; i < 4; i++) {
      points.push({ x: approx.data32S[i * 2]!, y: approx.data32S[i * 2 + 1]! });
    }
    
    // Calculate center to expand points outwards (Padding for distortion)
    let cx = points.reduce((s, p) => s + p.x, 0) / 4;
    let cy = points.reduce((s, p) => s + p.y, 0) / 4;
    const imgW = src.cols;
    const imgH = src.rows;
    points = points.map(p => ({
      x: Math.max(0, Math.min(imgW - 1, p.x + (p.x - cx) * 0.08)), // More aggressive 8% expansion, clamped
      y: Math.max(0, Math.min(imgH - 1, p.y + (p.y - cy) * 0.08))
    }));

    points.sort((a, b) => a.y - b.y);
    let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    let bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    
    let srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [top[0]!.x, top[0]!.y, top[1]!.x, top[1]!.y, bottom[1]!.x, bottom[1]!.y, bottom[0]!.x, bottom[0]!.y]);
    let dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, plateWidth, 0, plateWidth, plateHeight, 0, plateHeight]);
    let M = cv.getPerspectiveTransform(srcPts, dstPts);
    let dst = new cv.Mat();
    cv.warpPerspective(src, dst, M, new cv.Size(plateWidth, plateHeight));
    
    // 2. Preprocess for segmentation
    let gray = new cv.Mat();
    cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);
    let binary = new cv.Mat();
    cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 21, 10);

    // 3. Find Character Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
    // 3. Filter and Sort Character Boxes
    const plateH = plateHeight;
    let charBoxes = [];
    for (let i = 0; i < contours.size(); ++i) {
      let rect = cv.boundingRect(contours.get(i));
      let aspectRatio = rect.width / rect.height;
      
      // Much more relaxed for region digits and potentially merged characters
      if (aspectRatio > 0.1 && aspectRatio < 4.5 && 
          rect.height > plateH * 0.2 && rect.height < plateH * 0.95) {
        charBoxes.push(rect);
      }
    }

    // Sort left-to-right
    charBoxes.sort((a, b) => a.x - b.x);

    // Merge Close Fragments (Characters that are very close horizontally)
    let mergedBoxes = [];
    if (charBoxes.length > 0) {
      let current = charBoxes[0]!;
      for (let i = 1; i < charBoxes.length; i++) {
        let next = charBoxes[i]!;
        let gap = next.x - (current.x + current.width);
        // If gap is small, they are parts of one char
        if (gap < 4) { // Very conservative merging
          let newX = Math.min(current.x, next.x);
          let newY = Math.min(current.y, next.y);
          let newW = Math.max(current.x + current.width, next.x + next.width) - newX;
          let newH = Math.max(current.y + current.height, next.y + next.height) - newY;
          current = { x: newX, y: newY, width: newW, height: newH };
        } else {
          mergedBoxes.push(current);
          current = next;
        }
      }
      mergedBoxes.push(current);
    }
    charBoxes = mergedBoxes;

    // Final Filter: Only basic margins and width
    const plateW = dst.cols;
    charBoxes = charBoxes.filter(box => {
      return box.x > 2 && (box.x + box.width) < (plateW - 2) && box.width > 5;
    });

    if (charBoxes.length < 4) {
      dst.delete(); gray.delete(); binary.delete(); contours.delete(); hierarchy.delete();
      return null;
    }

    // 4. Create Purified Strip
    const charH = 80; 
    const padding = 12; // Much tighter for Tesseract flow
    
    let totalW = padding;
    charBoxes.forEach(box => {
      let scale = charH / box.height;
      totalW += Math.floor(box.width * scale) + padding;
    });
    
    let strip = new cv.Mat(charH + 20, totalW, cv.CV_8UC1, new cv.Scalar(255));
    
    let currentX = padding;
    charBoxes.forEach((box) => {
      let charROI = gray.roi(box);
      let charBinary = new cv.Mat();
      
      // 1. CLAHE: Normalizing contrast
      let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
      let contrastRes = new cv.Mat();
      clahe.apply(charROI, contrastRes);
      clahe.delete();

      // 2. Gaussian Blur: Smoothing edges before threshold
      let blurred = new cv.Mat();
      cv.GaussianBlur(contrastRes, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
      contrastRes.delete();

      // 3. Fixed threshold (130) on smoothed image
      cv.threshold(blurred, charBinary, 130, 255, cv.THRESH_BINARY);
      blurred.delete();
      
      // 2. Auto-Inversion: Character MUST be black on white
      let nonZero = cv.countNonZero(charBinary);
      let total = charBinary.cols * charBinary.rows;
      if (nonZero < total * 0.4) { // More aggressive inversion check
        cv.bitwise_not(charBinary, charBinary);
      }
      
      // 3. Resize keeping original aspect ratio
      let scale = charH / box.height;
      let targetW = Math.floor(box.width * scale);
      let resizedChar = new cv.Mat();
      cv.resize(charBinary, resizedChar, new cv.Size(targetW, charH), 0, 0, cv.INTER_LINEAR);
      
      let destRect = new cv.Rect(currentX, 10, targetW, charH);
      resizedChar.copyTo(strip.roi(destRect));
      
      currentX += targetW + padding;
      charROI.delete(); charBinary.delete(); resizedChar.delete();
    });

    let plateCanvas = document.createElement('canvas');
    plateCanvas.width = strip.cols;
    plateCanvas.height = strip.rows;
    cv.imshow(plateCanvas, strip); 
    let plateImageData = plateCanvas.getContext('2d')!.getImageData(0, 0, plateCanvas.width, plateCanvas.height);
    
    dst.delete(); gray.delete(); binary.delete(); contours.delete(); hierarchy.delete(); strip.delete();
    M.delete(); srcPts.delete(); dstPts.delete();

    return {
      plateImage: plateImageData,
      charImages: []
    };
  }
};
