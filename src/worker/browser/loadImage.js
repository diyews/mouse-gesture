import resolveURL from 'resolve-url';
import blueimpLoadImage from 'blueimp-load-image';

/**
 * readFromBlobOrFile
 *
 * @name readFromBlobOrFile
 * @function
 * @access private
 */
const readFromBlobOrFile = (blob) => (
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = ({ target: { error: { code } } }) => {
      reject(Error(`File could not be read! Code=${code}`));
    };
    fileReader.readAsArrayBuffer(blob);
  })
);

const fixOrientationFromUrlOrBlobOrFile = (blob) => (
  new Promise((resolve) => {
    blueimpLoadImage(
      blob,
      (img) => img.toBlob(resolve),
      {
        orientation: true,
        canvas: true,
      },
    );
  })
);

/**
 * loadImage
 *
 * @name loadImage
 * @function load image from different source
 * @access private
 */
const loadImage = async (image) => {
  let data = image;
  if (typeof image === 'undefined') {
    return 'undefined';
  }

  if (typeof image === 'string') {
    if (image.endsWith('.pbm')) {
      const resp = await fetch(resolveURL(image));
      data = await resp.arrayBuffer();
    } else {
      let img = image;
      // If not Base64 Image
      if (!/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(image)) {
        img = resolveURL(image);
      }
      data = await readFromBlobOrFile(
        await fixOrientationFromUrlOrBlobOrFile(img),
      );
    }
  } else if (image instanceof HTMLElement) {
    if (image.tagName === 'IMG') {
      data = await loadImage(image.src);
    }
    if (image.tagName === 'VIDEO') {
      data = await loadImage(image.poster);
    }
    if (image.tagName === 'CANVAS') {
      await new Promise((resolve) => {
        image.toBlob(async (blob) => {
          data = await readFromBlobOrFile(blob);
          resolve();
        });
      });
    }
  } else if (image instanceof File || image instanceof Blob) {
    let img = image;
    let shouldFixOrientation;
    if (image.name) {
      // If name exist, check file extension isn't .pbm
      shouldFixOrientation = !image.name.endsWith('.pbm');
    } else if (image.type) {
      // If empty name but type exist, check type isn't pbm
      shouldFixOrientation = image.type !== 'image/x-portable-bitmap';
    } else {
      // Empty name and type
      shouldFixOrientation = true;
    }
    if (shouldFixOrientation) {
      img = await fixOrientationFromUrlOrBlobOrFile(img);
    }
    data = await readFromBlobOrFile(img);
  }

  return new Uint8Array(data);
};

export default loadImage;
