import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIBS_DIR = path.join(__dirname, '../public/libs');
const OPENCV_URL = 'https://docs.opencv.org/4.10.0/opencv.js';
const MODEL_BASE_URL = 'https://raw.githubusercontent.com/longas/Letter-Recognition/master/web/model/';
const ASSETS = [
  { url: OPENCV_URL, dest: 'libs/opencv.js' },
  { url: MODEL_BASE_URL + 'model.json', dest: 'models/char_classifier/model.json' },
  { url: MODEL_BASE_URL + 'group1-shard1of1', dest: 'models/char_classifier/group1-shard1of1' },
  { url: MODEL_BASE_URL + 'group2-shard1of1', dest: 'models/char_classifier/group2-shard1of1' },
  { url: MODEL_BASE_URL + 'group3-shard1of2', dest: 'models/char_classifier/group3-shard1of2' },
  { url: MODEL_BASE_URL + 'group3-shard2of2', dest: 'models/char_classifier/group3-shard2of2' },
  { url: MODEL_BASE_URL + 'group4-shard1of1', dest: 'models/char_classifier/group4-shard1of1' }
];

async function downloadFile(url, dest) {
  const destPath = path.join(__dirname, '../public', dest);
  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(destPath)) {
    console.log(`✅ ${dest} already exists, skipping.`);
    return;
  }

  console.log(`⏳ Downloading ${dest}...`);
  
  return new Promise((resolve, reject) => {
    const download = (downloadUrl) => {
      https.get(downloadUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          download(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${downloadUrl}: ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ ${dest} downloaded!`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    download(url);
  });
}

async function downloadAll() {
  try {
    for (const asset of ASSETS) {
      await downloadFile(asset.url, asset.dest);
    }
  } catch (err) {
    console.error(`❌ Error downloading assets: ${err.message}`);
  }
}

downloadAll();
