/**
 * Converts an image element to a base64 data URL using canvas with CORS support
 * Memory optimized for better performance when scrolling
 */
export const imageToDataURL = (imgElement: HTMLImageElement): Promise<string> => {
  // Skip processing for already converted images or if the src is empty
  if (imgElement.src.startsWith('data:') || !imgElement.src) {
    return Promise.resolve(imgElement.src);
  }

  return new Promise((resolve, reject) => {
    // Create a canvas element - minimize memory usage
    const canvas = document.createElement('canvas');

    // Create a new image with crossOrigin set
    const corsImage = new Image();
    corsImage.crossOrigin = 'anonymous';
    corsImage.src = imgElement.src;

    // Function to handle drawing and conversion
    const processImage = () => {
      try {
        // Set canvas dimensions to match the image
        canvas.width = corsImage.naturalWidth || imgElement.width;
        canvas.height = corsImage.naturalHeight || imgElement.height;

        // Ensure we have valid dimensions
        if (canvas.width === 0 || canvas.height === 0) {
          console.warn('Invalid image dimensions, using original src');
          resolve(imgElement.src);
          return;
        }

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(corsImage, 0, 0, canvas.width, canvas.height);

        // Convert to data URL (using JPEG for better compression)
        const dataURL = canvas.toDataURL('image/jpeg', 0.6); // Use higher compression

        // Memory cleanup
        canvas.width = 0;
        canvas.height = 0;

        resolve(dataURL);
      } catch (err) {
        console.warn('Canvas operation failed, using original src', err);
        resolve(imgElement.src);
      } finally {
        // Clean up references to help with garbage collection
        corsImage.onload = null;
        corsImage.onerror = null;
      }
    };

    // For the CORS image, we need to set up handlers
    corsImage.onload = processImage;

    corsImage.onerror = () => {
      console.warn('Failed to load image with CORS, using original src');
      resolve(imgElement.src);
      // Clean up
      corsImage.onload = null;
      corsImage.onerror = null;
    };

    // Timeout after 2 seconds if image doesn't load
    setTimeout(() => {
      if (!corsImage.complete) {
        console.warn('Image load timeout, using original src');
        resolve(imgElement.src);
        // Clean up
        corsImage.onload = null;
        corsImage.onerror = null;
      }
    }, 2000);
  });
};
