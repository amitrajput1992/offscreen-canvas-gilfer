import {type GifReader}  from 'omggif';
/*---
  head : 'animator::createBufferCanvas()'
  text :
    - >
      Creates a buffer canvas element since it is much faster
      to call <b>.putImage()</b> than <b>.putImageData()</b>.
    - >
      The omggif library decodes the pixels into the full gif
      dimensions. We only need to store the frame dimensions,
      so we offset the putImageData call.
  args :
    frame  : A frame of the GIF (from the omggif library)
    width  : width of the GIF (not the frame)
    height : height of the GIF
  return : A <canvas> element containing the frame's image.
   */
export default class Animator {
  _reader: GifReader;
  _frames: Array;
  _width: number;
  _height: number;
  _loopCount: number;
  _loops: number;
  _frameIndex: number;
  _isRunning: boolean;
  _lastTime: Date;
  _delayCompensation: number;
  _canvas: any;
  _ctx: any;

  constructor(reader: GifReader, frames: Array) {
    this._reader = reader;
    this._frames = frames;
    this._width = this._reader.width;
    this._height = this._reader.height;
    this._loopCount = this._reader.loopCount();
    this._loops = 0;
    this._frameIndex = 0;
    this._isRunning = false;
  }

  //todo set canvas and ctx correctly
  setCanvasEl = (selector) => {
    const canvas = null;
    this._canvas = canvas;
    this._ctx = this._canvas.getContext('2d');
  };

  _createBufferCanvas = (frame: any, width: number, height: number) => {
    let bufferCanvas, bufferContext, imageData;
    bufferCanvas = document.createElement('canvas');
    bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = frame.width;
    bufferCanvas.height = frame.height;
    imageData = bufferContext.createImageData(width, height);
    imageData.data.set(frame.pixels);
    bufferContext.putImageData(imageData, -frame.x, -frame.y);
    return bufferCanvas;
  };

  _start = () => {
    this._lastTime = new Date().valueOf();
    this._delayCompensation = 0;
    this._isRunning = true;
    setTimeout(this._nextFrame, 0);
    return this;
  };

  _stop = () => {
    this._isRunning = false;
    return this;
  };

  reset = () => {
    this._frameIndex = 0;
    this._loops = 0;
    return this;
  };

  running = () => {
    return this._isRunning;
  };

  _nextFrame = () => {
    requestAnimationFrame(this._nextFrameRender);
  };

  _nextFrameRender = () => {
    if (!this._isRunning) {
      return;
    }
    let frame = this._frames[this._frameIndex];
    this.onFrame(frame, this._frameIndex);
    return this._enqueueNextFrame();
  };

  _advanceFrame = () => {
    this._frameIndex += 1;
    if (this._frameIndex >= this._frames.length) {
      if (this._loopCount !== 0 && this._loopCount === this._loops) {
        this._stop();
      } else {
        this._frameIndex = 0;
        this._loops += 1;
      }
    }
  };

  _enqueueNextFrame = () => {
    let actualDelay, delta, frame, frameDelay;
    this._advanceFrame();
    while (this._isRunning) {
      frame = this._frames[this._frameIndex];
      delta = new Date().valueOf() - this._lastTime;
      this._lastTime += delta;
      this._delayCompensation += delta;
      frameDelay = frame.delay * 10;
      actualDelay = frameDelay - this._delayCompensation;
      this._delayCompensation -= frameDelay;
      if (actualDelay < 0) {
        this._advanceFrame();
        continue;
      } else {
        setTimeout(this._nextFrame, actualDelay);
        break;
      }
    }
  };

  /*---
  head : 'animator.animateInCanvas()'
  text :
    - >
      This method prepares the canvas to be drawn into and sets up
      the callbacks for each frame while the animation is running.
    - >
      To change how each frame is drawn into the canvas, override
      <b>animator.onDrawFrame()</b> before calling this method.
      If <b>animator.onDrawFrame()</b> is not set, we simply draw
      the frame directly into the canvas as is.
    - >
      You may also override <b>animator.onFrame()</b> before calling
      this method. onFrame handles the lazy construction of canvas
      buffers for each frame as well as the disposal method for each frame.
  args :
    setDimensions : 'OPTIONAL. If true, the canvas width/height will be set to match the GIF. default: true.'

    animateInCanvas -> start -> onFrame -> onDrawFrame

   */
  animateInCanvas = (setDimensions: boolean = true) => {
    if(setDimensions) {
      this._canvas.width = this._width;
      this._canvas.height = this._height;
    }
    this._start();
    return this;
  };

  /**
   * Called on each frame
   * @param frame
   * @param i
   */
  onFrame = (frame: any, i: number) => {
    if(frame.buffer === null) {
      frame.buffer = this._createBufferCanvas(frame, this._width, this._height);
    }
    if(typeof this.disposeFrame === 'function') {
      this.disposeFrame();
    }
    this.disposeFrame = this.getNextDisposeFrame(frame);
    this.onDrawFrame(frame, i);
  };

  /**
   * draw the frame on the canvas
   * @param frame
   * @param i: frame index
   */
  onDrawFrame = (frame: any, i: number) => {
    return this._ctx.drawImage(frame.buffer, frame.x, frame.y);
  };

  getNextDisposeFrame = (frame: any) => {
    switch(frame.disposal) {
      case 2: {
        return () => this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      }
      case 3: {
        let saved = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
        return () => this._ctx.putImageData(saved, 0, 0);
      }
    }
  };
}
