interface CVMat {
  rows: number;
  cols: number;
  type: () => number;
  data32S: Int32Array;
  data8S: Int8Array;
  delete: () => void;
  roi: (rect: CVRect) => CVMat;
  copyTo: (dst: CVMat) => void;
}

type CVConstructor<T> = new (...args: unknown[]) => T;

interface CVSize {
  width: number;
  height: number;
}

interface CVScalarInstance {}

interface CVRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CLAHEInstance {
  apply: (src: CVMat, dst: CVMat) => void;
  delete: () => void;
}

interface CVMatVector {
  size: () => number;
  get: (i: number) => CVMat;
  delete: () => void;
}

interface OpenCV {
  Mat: CVConstructor<CVMat>;
  Size: CVConstructor<CVSize>;
  Scalar: CVConstructor<CVScalarInstance>;
  MatVector: CVConstructor<CVMatVector>;
  Rect: CVConstructor<CVRect>;
  imread: (src: HTMLCanvasElement) => CVMat;
  imshow: (canvas: HTMLCanvasElement, mat: CVMat) => void;
  cvtColor: (src: CVMat, dst: CVMat, code: number) => void;
  GaussianBlur: (src: CVMat, dst: CVMat, ksize: CVSize, sigmaX: number, sigmaY?: number, borderType?: number) => void;
  Canny: (src: CVMat, dst: CVMat, threshold1: number, threshold2: number) => void;
  morphologyEx: (src: CVMat, dst: CVMat, op: number, kernel: CVMat) => void;
  getStructuringElement: (shape: number, ksize: CVSize) => CVMat;
  findContours: (image: CVMat, contours: CVMatVector, hierarchy: CVMat, mode: number, method: number) => void;
  arcLength: (curve: CVMat, closed: boolean) => number;
  approxPolyDP: (curve: CVMat, approxCurve: CVMat, epsilon: number, closed: boolean) => void;
  boundingRect: (points: CVMat) => CVRect;
  matFromArray: (rows: number, cols: number, type: number, data: number[]) => CVMat;
  getPerspectiveTransform: (src: CVMat, dst: CVMat) => CVMat;
  warpPerspective: (src: CVMat, dst: CVMat, M: CVMat, dsize: CVSize) => void;
  adaptiveThreshold: (src: CVMat, dst: CVMat, maxValue: number, adaptiveMethod: number, thresholdType: number, blockSize: number, C: number) => void;
  resize: (src: CVMat, dst: CVMat, dsize: CVSize, fx: number, fy: number, interpolation: number) => void;
  threshold: (src: CVMat, dst: CVMat, thresh: number, maxval: number, type: number) => void;
  countNonZero: (src: CVMat) => number;
  bitwise_not: (src: CVMat, dst: CVMat) => void;
  CLAHE: CVConstructor<CLAHEInstance>;
  COLOR_RGBA2GRAY: number;
  MORPH_RECT: number;
  MORPH_CLOSE: number;
  RETR_TREE: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
  CV_32FC2: number;
  CV_8UC1: number;
  ADAPTIVE_THRESH_GAUSSIAN_C: number;
  THRESH_BINARY: number;
  THRESH_BINARY_INV: number;
  INTER_LINEAR: number;
  BORDER_DEFAULT: number;
}

declare const cv: OpenCV;
