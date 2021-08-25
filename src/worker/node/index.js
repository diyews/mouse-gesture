/**
 *
 * Tesseract Worker impl. for node (using child_process)
 *
 * @fileoverview Tesseract Worker impl. for node
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
