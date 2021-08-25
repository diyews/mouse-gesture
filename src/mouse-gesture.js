import createWorker from './createWorker';

function noop() {}

function toBlobPromise(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });
}

function toSizePaint(size, pointArr, context) {
  const leftTop = [8888, 8888];
  const rightBottom = [0, 0];
  /* calc box size, use leftTop and rightBottom */
  pointArr.forEach((p) => {
    if (p[0] < leftTop[0]) {
      leftTop[0] = p[0];
    }
    if (p[1] < leftTop[1]) {
      leftTop[1] = p[1];
    }
    if (p[0] > rightBottom[0]) {
      rightBottom[0] = p[0];
    }
    if (p[1] > rightBottom[1]) {
      rightBottom[1] = p[1];
    }
  });
  /* calc zoom to canvas size by box size above */
  // eslint-disable-next-line no-mixed-operators
  const zoom = size * 0.8 / Math.max(rightBottom[0] - leftTop[0], rightBottom[1] - leftTop[1]);
  const center = [ Math.floor((rightBottom[0] - leftTop[0]) / 2 * zoom), Math.floor((rightBottom[1] - leftTop[1]) / 2 * zoom) ];
  const toCanvasCenterOffset = [ center[0] - size / 2, center[1] - size / 2 ];
  /* center gesture to canvas center */
  const result = pointArr.map((point) => {
    const pointArrElement = [point[0], point[1]];
    pointArrElement[0] -= leftTop[0];
    pointArrElement[1] -= leftTop[1];
    pointArrElement[0] = Math.floor(pointArrElement[0] * zoom);
    pointArrElement[1] = Math.floor(pointArrElement[1] * zoom);
    pointArrElement[0] -= toCanvasCenterOffset[0];
    pointArrElement[1] -= toCanvasCenterOffset[1];
    return pointArrElement;
  });

  /* draw */
  for (let i = 0; i < result.length; i++) {
    const pointArrElement = result[i];
    if (i === 0) {
      context.moveTo(pointArrElement[0], pointArrElement[1]);
    } else {
      context.lineTo(pointArrElement[0], pointArrElement[1]);
    }
    context.stroke();
  }
}

function checkPathDirection(startPoint, endPoint) {
  const startEndPointDistance =
    [startPoint, endPoint]
      .map((point, index, arr) => arr[0][index] - arr[1][index]);
  const max = Math.max(...startEndPointDistance.map((num) => Math.abs(num)));
  const maxOrigin = startEndPointDistance.find((num) => Math.abs(num) === max);
  return maxOrigin >= 0 ? 'reverse' : 'forward';
}

class MouseGesture extends EventTarget {
  // mouseRightDown = false;
  // shouldDisableContextMenu = false;
  // recognizing = false;
  // pointArr = [];
  //
  // textDiv;
  // worker;
  // canvas;
  // context;

  constructor(worker, canvas, textDiv) {
    super();
    this.worker = worker;
    this.canvas = canvas;
    this.textDiv = textDiv;

    /* canvas */
    const context = canvas.getContext('2d');
    context.strokeStyle = '#09c';
    context.lineWidth = 6;
    this.context = context;
    this.offscreenCanvasSize = 50;
    this.offscreenCanvas = new OffscreenCanvas(this.offscreenCanvasSize, this.offscreenCanvasSize);
    this.offscreenCanvasCtx = this.offscreenCanvas.getContext('2d');
    this.offscreenCanvasCtx.lineWidth = 1;

    /* listen and recognize */
    this.mouseRightDown = false;
    this.mouseRightDownTimestamp = NaN;
    this.shouldDisableContextMenu = false;
    this.recognizing = false;
    this.pointArr = [];
    this.removeMouseEventListener = noop;
    this.lastReconization = null;
  }

  pointArrValid() {
    return this.pointArr.length >= 12;
  }

  updateTextDiv(x, y, text) {
    const { textDiv } = this;
    if (text || (text === null && textDiv.innerText)) {
      textDiv.style.display = 'flex';
    } else {
      textDiv.style.display = 'none';
    }
    if (typeof x !== 'number') {
      textDiv.innerText = '';
      return;
    }
    textDiv.style.left = `${x}px`;
    textDiv.style.top = `${y}px`;
    if (text !== null) {
      textDiv.innerText = text || '';
    }
  }

  async recognize() {
    if (this.recognizing) { return null; }
    this.recognizing = true;
    console.time('xxx');
    this.offscreenCanvasCtx.beginPath();
    toSizePaint(this.offscreenCanvasSize, this.pointArr, this.offscreenCanvasCtx);
    console.timeEnd('xxx');
    console.time('xxx1');
    /* take about 10ms */
    const offscreenBlob = await this.offscreenCanvas.convertToBlob();
    this.offscreenCanvasCtx.clearRect(0, 0, this.offscreenCanvasSize, this.offscreenCanvasSize);
    this.offscreenCanvasCtx.closePath();
    /*(() => {
      const reader = new FileReader();
      reader.readAsDataURL(offscreenBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        console.log(base64data);
        console.log('%c ', `font-size:250px;line-height: 1;background:url(${base64data}) no-repeat;background-size: contain;`);
        // const a = document.createElement('a'); // Create <a>
        // a.href = base64data as string; // Image Base64 Goes here
        // a.download = 'Image' + Date.now() + '.png'; // File name Here
        // a.click(); // Downloaded file
      };
    })();*/
    console.timeEnd('xxx1');
    console.time('reco');
    /* take about 20ms */
    return this.worker.recognize(offscreenBlob)
      .finally(() => {
        this.recognizing = false;
      })
      .then(({ data }) => {
        console.timeEnd('reco');
        console.log(data, data.confidence);
        if (data.confidence < 50 || !data.text) {
          return { char: '' };
        }
        if (data.symbols.length > 1) {
          return { char: '' };
        }
        const char = data.symbols[0].text;
        switch (char) {
          case '/':
            break;
          case '\\':
            break;
          case '^':
            break;
          case 'O':
            break;
          case 'N':
            break;
          default:
        }
        return Object.assign(data, { char });
      });
  }

  mousemove(e) {
    if (!this.mouseRightDown) {
      return;
    }
    const lastPoint = [e.x, e.y];
    this.pointArr.push(lastPoint);
    this.context.lineTo(...lastPoint);
    this.context.stroke();
    if (this.pointArrValid()) {
      const pathDirection = checkPathDirection(
        this.pointArr[0], this.pointArr[this.pointArr.length - 1],
      );
      /* closure to store mouse down timestamp */
      ((ts) => {
        this.recognize()
          .then((data) => {
            /* last recognition result, ignore */
            if (!(this.mouseRightDown && this.mouseRightDownTimestamp === ts)) {
              return;
            }
            this.lastReconization = data;
            return data;
          })
          .then((data) => {
            if (!data) {
              throw new ErrorEvent('null means recognizing preview gesture');
            }
            return data;
          })
          .then((data) => {
            Object.assign(data, { direction: pathDirection });
            switch (data.char) {
              case '-':
                Object.assign(data, {
                  char: data.direction === 'forward' ? '→' : '←',
                });
                break;
              case '|':
                Object.assign(data, {
                  char: data.direction === 'forward' ? '↓' : '↑',
                });
                break;
              default:
            }
            return data;
          })
          .then((data) => {
            this.updateTextDiv(
              this.pointArr[this.pointArr.length - 1][0],
              this.pointArr[this.pointArr.length - 1][1] + 20,
              data.char,
            );
            if (data.char === '') {
              throw new ErrorEvent('Empty recognition result');
            }
            return data;
          })
          .then((data) => {
            console.log(data);
            return data;
          })
          .catch(() => {
          });
      })(this.mouseRightDownTimestamp);
    }
  }

  mousedown(e) {
    if (e.button === 2) {
      this.mouseRightDown = true;
      this.mouseRightDownTimestamp = e.timestamp;
      this.context.beginPath();
      this.context.moveTo(e.x, e.y);
    }
  }

  mouseup(e) {
    if (!this.mouseRightDown) { return; }

    const { lastReconization } = this;

    this.updateTextDiv();
    this.mouseRightDown = false;
    this.mouseRightDownTimestamp = NaN;
    this.context.closePath();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.shouldDisableContextMenu = this.pointArrValid();
    this.pointArr = [];
    this.lastReconization = null;

    if (e.button === 2) {
      /* if shouldDisableContextMenu, should emit reco event */
      if (this.shouldDisableContextMenu && lastReconization && lastReconization.char) {
        console.log(lastReconization);
      }
    }
  }

  contextmenu(e) {
    if (this.shouldDisableContextMenu) {
      e.preventDefault();
    }
    this.shouldDisableContextMenu = false;
  }

  terminate() {
    this.removeMouseEventListener();
    this.worker.terminate();
  }
}

function setupMouseGesture(element, worker) {
  const cover = document.createElement('div');
  const textDiv = document.createElement('div');
  textDiv.style.cssText = 'position: fixed;width: 20px;height: 20px;border-radius: 8px;border: 2px solid #afe2f3;color: #09c;align-items: center;justify-content: center;display: none;';
  // textDiv.innerText = '^';
  cover.appendChild(textDiv);
  const canvas = document.createElement('canvas');
  cover.appendChild(canvas);
  cover.style.cssText = 'position: fixed;top: 0;left: 0;width: 100%;height: 100%;pointer-events: none;';
  document.body.appendChild(cover);
  canvas.width = cover.clientWidth;
  canvas.height = cover.clientHeight;

  const mouseGesture = new MouseGesture(worker, canvas, textDiv);

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }
  // const checkAndEmitDebounced = debounce(checkAndEmit, 1e2);

  const handler = {
    mousemove: (e) => mouseGesture.mousemove(e),
    mousedown: (e) => mouseGesture.mousedown(e),
    mouseup: (e) => mouseGesture.mouseup(e),
    contextmenu: (e) => mouseGesture.contextmenu(e),
  };

  Object.keys(handler)
    .forEach((eventType) => {
      element.addEventListener(eventType, handler[eventType]);
    });

  const removeListener = () => {
    Object.keys(handler)
      .forEach((eventType) => {
        element.removeEventListener(eventType, handler[eventType]);
      });
  };

  mouseGesture.removeMouseEventListener = removeListener;

  return mouseGesture;
}

export const mouseGesture = async (_options = {}) => {
  const { element } = _options;
  // eslint-disable-next-line no-param-reassign
  delete _options.element;
  const worker = createWorker(_options);

  await (async () => {
    await worker.load();
    await worker.loadLanguage('gesture');
    await worker.initialize('gesture');
    await worker.setParameters({
      tessedit_pageseg_mode: '10', // PSM.SINGLE_CHAR
      tessedit_char_whitelist: 'JLNOPRVZ<>^-|/\\369',
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
    });
  })();

  const mouseGestureInstance = setupMouseGesture(element, worker);

  return mouseGestureInstance;
};
