/**
 *
 * Entry point for tesseract.js, should be the entry when bundling.
 *
 * @fileoverview entry point for tesseract.js
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */
import 'regenerator-runtime/runtime';

import createScheduler from './createScheduler';
import createWorker from './createWorker';
import Tesseract from './Tesseract';
import languages from './constants/languages';
import OEM from './constants/OEM';
import PSM from './constants/PSM';
import { setLogging } from './utils/log';
import { mouseGesture } from './mouse-gesture';

const { recognize, detect } = Tesseract;

export {
  languages,
  OEM,
  PSM,
  createScheduler,
  createWorker,
  setLogging,
  recognize,
  detect,
  mouseGesture,
};
