// Crops an image to a centered square and resizes it in the browser before upload,
// so the API never receives a phone camera's 8 MB photo for a 300px logo.
export const resizeImageToSquare = (file: File, size = 320): Promise<Blob> =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      reject(new Error("Use a PNG, JPG or WebP image."));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("That image is larger than 10 MB. Choose a smaller one."));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be opened as an image."));
    };
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      canvas
        .getContext("2d")!
        .drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      // PNG keeps transparent logo backgrounds.
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The image could not be resized."))), "image/png");
    };
    image.src = url;
  });
