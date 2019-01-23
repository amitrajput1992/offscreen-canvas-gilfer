/**
 * @format
 */
export default class FramesManager {
  _cb: Function;
  constructor(cb: Function = () => {}) {
    this._cb = cb;
    this._frames = [];
    this._frameIndex = 0;
    this._width = 0;
    this._height = 0;
    this._disposeFrame = null;
    this._canvas = null;
    this._ctx = null;
    this._loopCount = 0;
    this._loops = 0;
    this._renderWidth = 0;
    this._renderHeight = 0;
    this._isRunning = false;
    this._lastTime = new Date().valueOf();
    this._delayCompensation = 0;
  }

  init(details) {
    this._frames = details.frames;
    this._width = details.width;
    this._height = details.height;
    this._loopCount = details.loopCount;
    this._renderWidth = details.renderWidth;
    this._renderHeight = details.renderHeight;
    this._lastTime = new Date().valueOf();
  }

  setCanvas = (canvas) => {
    this._canvas = canvas;
    this._ctx = this._canvas.getContext('2d');
  };

  createBufferCanvas = (frame) => {
    let bufferCanvas, bufferContext, imageData;
    bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = this._width;
    bufferCanvas.height = this._height;
    bufferContext = bufferCanvas.getContext('2d');
    imageData = bufferContext.createImageData(this._width, this._height);
    imageData.data.set(frame.pixels);
    bufferContext.putImageData(imageData, -frame.x, -frame.y);
    return bufferCanvas;
  };

  start = () => {
    this._isRunning = true;
    setTimeout(this.nextFrame, 0);
  };

  nextFrame = () => {
    requestAnimationFrame(this.nextFrameRender);
  };

  nextFrameRender = () => {
    if (!this._isRunning) {
      return;
    }
    let frame = this._frames[this._frameIndex];
    this.onFrame(frame, this._frameIndex);
    this.enqueueNextFrame();
  };

  /**
   * Called on each frame
   * @param frame
   * @param i
   */
  onFrame = (frame, i) => {
    if (!frame.buffer) {
      frame.buffer = this.createBufferCanvas(frame);
    }
    if (typeof this._disposeFrame === 'function') {
      this._disposeFrame();
    }
    this._disposeFrame = this.getNextDisposeFrame(frame);
    this.onDrawFrame(frame, i);
  };

  /**
   * draw the frame on the canvas
   * @param frame
   * @param i: frame index
   */
  onDrawFrame = (frame, i) => {
    this._ctx.drawImage(frame.buffer, frame.x, frame.y);
    this._cb(i);
  };

  enqueueNextFrame = () => {
    let actualDelay, delta, frame, frameDelay;
    this.advanceFrame();
    while (this._isRunning) {
      frame = this._frames[this._frameIndex];
      delta = new Date().valueOf() - this._lastTime;
      this._lastTime += delta;
      this._delayCompensation += delta;
      frameDelay = frame.delay * 10;
      actualDelay = frameDelay - this._delayCompensation;
      this._delayCompensation -= frameDelay;
      if (actualDelay < 0) {
        this.advanceFrame();
        continue;
      } else {
        setTimeout(this.nextFrame, actualDelay);
        break;
      }
    }
  };

  advanceFrame = () => {
    this._frameIndex += 1;
    if (this._frameIndex >= this._frames.length) {
      if (this._loopCount !== 0 && this._loopCount === loops) {
        stop();
      } else {
        this._frameIndex = 0;
        this._loops += 1;
      }
    }
  };

  getNextDisposeFrame = (frame) => {
    switch (frame.disposal) {
      case 2: {
        return function () {
          this._ctx.clearRect(0, 0, this._width, this._height);
        }.bind(this);
      }
      case 3: {
        let saved = this._ctx.getImageData(0, 0, this._width, this._height);
        return function () {
          this._ctx.putImageData(saved, 0, 0);
        }.bind(this);
      }
    }
  };

  stop = () => {
    this._isRunning = false;
  };

  reset = () => {
    this._frameIndex = 0;
    this._loops = 0;
  }

}
