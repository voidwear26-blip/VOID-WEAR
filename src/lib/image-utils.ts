'use client';

/**
 * VOID WEAR // NEURAL ASSET COMPRESSION
 * Optimizes local visual assets to prevent system crashes and Firestore overflows.
 * Targets a balanced resolution (max 1000px) and quality (0.6) for cinematic performance.
 */
export async function compressImage(file: File, maxWidth = 1000, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Initialize Neural Buffer
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    img.onload = () => {
      // 2. Calibrate Dimensions
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // 3. Render Optimized Matrix
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('CANVAS_CONTEXT_FAILURE'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // 4. Extract Compressed Packet
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // 5. Purge Buffer
      URL.revokeObjectURL(url);
      resolve(compressedBase64);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
}
