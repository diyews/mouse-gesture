import path from 'path';
import defaultOptions from '../../constants/defaultOptions';

/*
 * Default options for node worker
 */
export default {
  ...defaultOptions,
  workerPath: path.join(__dirname, '..', '..', 'worker-script', 'node', 'index.js'),
};
