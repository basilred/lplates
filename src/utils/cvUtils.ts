/**
 * OpenCV Utilities for License Plate Recognition
 */

// We assume cv is available globally (loaded via script tag)
declare const cv: any;

export interface PlateDetectionResult {
  plateImage: ImageData;
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

    let src = cv.imread(video);
    let gray = new cv.Mat();
    let blurred = new cv.Mat();
    let edged = new cv.Mat();
    
    // 1. Preprocessing
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.bilateralFilter(gray, blurred, 11, 17, 17); // Preserve edges, remove noise
    cv.Canny(blurred, edged, 30, 200); // Detect edges

    // 2. Find contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    let plateResult: PlateDetectionResult | null = null;

    // 3. Filter contours and extract plate
    for (let i = 0; i < contours.size(); ++i) {
      let cnt = contours.get(i);
      let peri = cv.arcLength(cnt, true);
      let approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

      if (approx.rows === 4) {
        let rect = cv.boundingRect(cnt);
        let aspectRatio = rect.width / rect.height;

        if (aspectRatio > 2.2 && aspectRatio < 5.5 && rect.width > width * 0.2) {
          // Found a potential plate! Extract and warp it.
          plateResult = cvUtils.extractPlate(src, approx, rect);
          approx.delete();
          break;
        }
      }
      approx.delete();
    }

    // Cleanup
    src.delete(); gray.delete(); blurred.delete(); edged.delete();
    contours.delete(); hierarchy.delete();

    return plateResult;
  },

  /**
   * Warps the plate perspective and segments into characters
   */
  extractPlate: (src: any, approx: any, rect: any): PlateDetectionResult | null => {
    // 1. Perspective Warp to get a flat plate
    let plateWidth = 240;
    let plateHeight = 60;
    
    // Sort points: top-left, top-right, bottom-right, bottom-left
    let points = [];
    for (let i = 0; i < 4; i++) {
      points.push({ x: approx.data32S[i * 2], y: approx.data32S[i * 2 + 1] });
    }
    
    points.sort((a, b) => a.y - b.y);
    let top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    let bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    
    let srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      top[0].x, top[0].y,
      top[1].x, top[1].y,
      bottom[1].x, bottom[1].y,
      bottom[0].x, bottom[0].y
    ]);
    
    let dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      plateWidth, 0,
      plateWidth, plateHeight,
      0, plateHeight
    ]);

    let M = cv.getPerspectiveTransform(srcPts, dstPts);
    let dst = new cv.Mat();
    cv.warpPerspective(src, dst, M, new cv.Size(plateWidth, plateHeight));
    
    // 2. Preprocess plate for character segmentation
    let plateGray = new cv.Mat();
    cv.cvtColor(dst, plateGray, cv.COLOR_RGBA2GRAY);
    cv.threshold(plateGray, plateGray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

    // 3. Find character contours
    let charContours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(plateGray, charContours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let charImages: ImageData[] = [];
    let rects: any[] = [];

    for (let i = 0; i < charContours.size(); ++i) {
      let cnt = charContours.get(i);
      let r = cv.boundingRect(cnt);
      
      // Filter by size (characters should be a certain height relative to the plate)
      if (r.height > plateHeight * 0.5 && r.width < plateWidth * 0.2) {
        rects.push(r);
      }
    }

    // Sort characters from left to right
    rects.sort((a, b) => a.x - b.x);

    // Extract each character and resize to 28x28 (standard for most CNNs)
    rects.forEach(r => {
      let charRoi = plateGray.roi(r);
      let resizedChar = new cv.Mat();
      cv.resize(charRoi, resizedChar, new cv.Size(28, 28));
      
      // Convert to ImageData for TF.js
      let canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      cv.imshow(canvas, resizedChar);
      charImages.push(canvas.getContext('2d')!.getImageData(0, 0, 28, 28));
      
      charRoi.delete();
      resizedChar.delete();
    });

    // Final result
    let plateImageData = new ImageData(plateWidth, plateHeight); // Simplified
    
    // Cleanup
    dst.delete(); plateGray.delete(); 
    charContours.delete(); hierarchy.delete();
    M.delete(); srcPts.delete(); dstPts.delete();

    return {
      plateImage: plateImageData,
      charImages
    };
  }
};
