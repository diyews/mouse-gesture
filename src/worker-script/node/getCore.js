import libTesseractCore from 'tesseract.js-core';

let TesseractCore = null;

/*
 * getCore is a sync function to load and return
 * TesseractCore.
 */
export default (_, res) => {
  if (TesseractCore === null) {
    res.progress({ status: 'loading tesseract core', progress: 0 });
    TesseractCore = libTesseractCore;
    res.progress({ status: 'loaded tesseract core', progress: 1 });
  }
  return TesseractCore;
};
