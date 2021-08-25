import getEnvironment from './getEnvironment';
import resolveUrl from 'resolve-url';
const isBrowser = getEnvironment('type') === 'browser';
const resolveURL = isBrowser ? resolveUrl : s => s; // eslint-disable-line

export default (options) => {
  const opts = { ...options };
  ['corePath', 'workerPath', 'langPath'].forEach((key) => {
    if (typeof options[key] !== 'undefined') {
      opts[key] = resolveURL(opts[key]);
    }
  });
  return opts;
};
