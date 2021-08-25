/**
 *
 * Tesseract Worker adapter for browser
 *
 * @fileoverview Tesseract Worker adapter for browser
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */
import defaultOptions from './defaultOptions';

import spawnWorker from './spawnWorker';
import terminateWorker from './terminateWorker';
import onMessage from './onMessage';
import send from './send';
import loadImage from './loadImage';

export {
  defaultOptions,
  spawnWorker,
  terminateWorker,
  onMessage,
  send,
  loadImage,
};
