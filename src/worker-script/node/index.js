/**
 *
 * Tesseract Worker Script for Node
 *
 * @fileoverview Node worker implementation
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */

import fetch from 'node-fetch';

import * as worker from '..';
import getCore from './getCore';
import gunzip from './gunzip';
import cache from './cache';

/*
 * register message handler
 */
process.on('message', (packet) => {
  worker.dispatchHandlers(packet, (obj) => process.send(obj));
});

worker.setAdapter({
  getCore,
  gunzip,
  fetch,
  ...cache,
});
