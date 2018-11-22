/**
 * @format
 */
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
  constructor(reader, frames, cb) {
    this._worker = new Worker(location.protocol + '//' + location.host + '/build/worker.js');
    this._reader = reader;
    this._frames = frames;
    this._width = this._reader.width;
    this._height = this._reader.height;
    this._loopCount = this._reader.loopCount();
    this._loops = 0;
    this._frameIndex = 0;
    this._isRunning = false;
    this._cb = cb;
    this._worker.onmessage = this._onMessage;

    this._worker.postMessage({
      type: 'init',
      detail: {
        frames: this._frames,
        width: this._width,
        height: this._height,
        loopCount: this._loopCount,
      },
    });
  }

  _onMessage = e => {
    if (e.data && e.data.type === 'onDrawFrame') {
      const dataURL = this._canvas.toDataURL();
      // send this data URL to any callbacks registered
      if (this._cb && typeof this._cb === 'function') {
        this._cb(dataURL);
      }
    }
  };

  setCanvasEl = (canvas, setDimensions = true) => {
    this._canvas = canvas;
    if (setDimensions) {
      this._canvas.width = this._width;
      this._canvas.height = this._height;
    }
    let offscreenCanvas = this._canvas.transferControlToOffscreen();
    this._worker.postMessage(
      {
        type: 'canvasCtx',
        detail: {
          canvas: offscreenCanvas,
        },
      },
      [offscreenCanvas],
    );
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
  animateInCanvas = () => {
    this._worker.postMessage({
      type: 'start',
      detail: {},
    });
    return this;
  };
}
