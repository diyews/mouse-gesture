import { fork } from 'child_process';

let debugPort = 9229;

/**
 * spawnWorker
 *
 * @name spawnWorker
 * @function fork a new process in node
 * @access public
 */
export default ({ workerPath }) => {
  debugPort += 1;
  return fork(workerPath, { execArgv: [`--debug-port=${debugPort}`] });
};
