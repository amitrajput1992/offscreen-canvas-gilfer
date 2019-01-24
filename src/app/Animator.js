/**
 * @flow
 * @format
 */
import {bridgeCode} from './worker';
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

import FramesManager from './FramesManager';
import {GifReader} from "omggif";

function nearestPow2( aSize ){
  return  Math.pow( 2, Math.round( Math.log( aSize ) / Math.log( 2 ) ) );
}


export default class Animator {
  _reader: GifReader;
  _frames: any;
  _width: number;
  _height: number;
  _loopCount: number;
  _loops: number;
  _frameIndex: number;
  _isRunning: boolean;
  _renderWidth: number;
  _renderHeight: number;
  _renderToOffscreen: boolean;
  _worker: Worker;
  _manager: FramesManager;
  _canvas: HTMLCanvasElement;
  _cb: Function;

  constructor(reader: GifReader, frames: any, renderToOffscreen: boolean, cb: Function) {
    this._cb = cb;
    this._reader = reader;
    this._frames = frames;
    this._width = this._reader.width;
    this._height = this._reader.height;
    this._loopCount = this._reader.loopCount();
    this._loops = 0;
    this._frameIndex = 0;
    this._isRunning = false;
    this._renderWidth = nearestPow2(this._reader.width);
    this._renderHeight = nearestPow2(this._reader.height);
    this._renderToOffscreen = renderToOffscreen;

    let details = {
      frames: this._frames,
      width: this._width,
      height: this._height,
      loopCount: this._loopCount,
      renderWidth: this._renderWidth,
      renderHeight: this._renderHeight,
    };

    if(renderToOffscreen) {
      // use a worker based loop
      const bridge = new Blob([bridgeCode]);
      const bridgeCodeURL = URL.createObjectURL(bridge);
      this._worker = new Worker(bridgeCodeURL);
      this._worker.postMessage({
        type: 'init',
        detail: details
      });
      this._worker.onmessage = this._messageFromWorker;
    } else {
      this._manager = new FramesManager(this._cb);
      this._manager.init(details);
    }
  }

  _messageFromWorker = (e: mixed) => {
    // $FlowFixMe
    switch (e.data.type) {
      case 'onDrawFrame': {
        // $FlowFixMe
        this._cb(e.data.frameIndex);
        break;
      }
    }
  };

  getFrameDataURL = (): any => {
    return this._canvas.toDataURL();
  };

  setCanvasEl = (canvas: HTMLCanvasElement, setDimensions: boolean = true): void => {
    this._canvas = canvas;
    if (setDimensions) {
      this._canvas.width = this._width;//this._renderWidth;
      this._canvas.height = this._height;//this._renderHeight;
    }

    if(this._renderToOffscreen) {
      // $FlowFixMe
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
    } else {
      this._manager.setCanvas(this._canvas);
    }
  };

  stop = (): void => {
    this._isRunning = false;
  };

  reset = (): void => {
    this._frameIndex = 0;
    this._loops = 0;
  };

  running = (): boolean => {
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
    if(this._renderToOffscreen) {
      this._worker.postMessage({
        type: 'start',
        detail: {},
      });
    } else {
      this._manager.start();
    }
  };
}
