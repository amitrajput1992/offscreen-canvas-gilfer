"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _worker = require("./worker");

var _FramesManager = _interopRequireDefault(require("./FramesManager"));

var _omggif = require("omggif");

/**
 * 
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
function nearestPow2(aSize) {
  return Math.pow(2, Math.round(Math.log(aSize) / Math.log(2)));
}

var Animator = function Animator(reader, frames, renderToOffscreen, cb) {
  var _this = this;

  (0, _classCallCheck2.default)(this, Animator);
  (0, _defineProperty2.default)(this, "_reader", void 0);
  (0, _defineProperty2.default)(this, "_frames", void 0);
  (0, _defineProperty2.default)(this, "_width", void 0);
  (0, _defineProperty2.default)(this, "_height", void 0);
  (0, _defineProperty2.default)(this, "_loopCount", void 0);
  (0, _defineProperty2.default)(this, "_loops", void 0);
  (0, _defineProperty2.default)(this, "_frameIndex", void 0);
  (0, _defineProperty2.default)(this, "_isRunning", void 0);
  (0, _defineProperty2.default)(this, "_renderWidth", void 0);
  (0, _defineProperty2.default)(this, "_renderHeight", void 0);
  (0, _defineProperty2.default)(this, "_renderToOffscreen", void 0);
  (0, _defineProperty2.default)(this, "_worker", void 0);
  (0, _defineProperty2.default)(this, "_manager", void 0);
  (0, _defineProperty2.default)(this, "_canvas", void 0);
  (0, _defineProperty2.default)(this, "_cb", void 0);
  (0, _defineProperty2.default)(this, "_messageFromWorker", function (e) {
    switch (e.data.type) {
      case 'onDrawFrame':
        {
          _this._cb(e.data.frameIndex);

          break;
        }
    }
  });
  (0, _defineProperty2.default)(this, "getFrameDataURL", function () {
    return _this._canvas.toDataURL();
  });
  (0, _defineProperty2.default)(this, "setCanvasEl", function (canvas) {
    var setDimensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    _this._canvas = canvas;

    if (setDimensions) {
      _this._canvas.width = _this._width; //this._renderWidth;

      _this._canvas.height = _this._height; //this._renderHeight;
    }

    if (_this._renderToOffscreen) {
      // $FlowFixMe
      var offscreenCanvas = _this._canvas.transferControlToOffscreen();

      _this._worker.postMessage({
        type: 'canvasCtx',
        detail: {
          canvas: offscreenCanvas
        }
      }, [offscreenCanvas]);
    } else {
      _this._manager.setCanvas(_this._canvas);
    }
  });
  (0, _defineProperty2.default)(this, "stop", function () {
    _this._isRunning = false;
  });
  (0, _defineProperty2.default)(this, "reset", function () {
    _this._frameIndex = 0;
    _this._loops = 0;
  });
  (0, _defineProperty2.default)(this, "running", function () {
    return _this._isRunning;
  });
  (0, _defineProperty2.default)(this, "animateInCanvas", function () {
    if (_this._renderToOffscreen) {
      _this._worker.postMessage({
        type: 'start',
        detail: {}
      });
    } else {
      _this._manager.start();
    }
  });
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
  var details = {
    frames: this._frames,
    width: this._width,
    height: this._height,
    loopCount: this._loopCount,
    renderWidth: this._renderWidth,
    renderHeight: this._renderHeight
  };

  if (renderToOffscreen) {
    // use a worker based loop
    var bridge = new Blob([_worker.bridgeCode]);
    var bridgeCodeURL = URL.createObjectURL(bridge);
    this._worker = new Worker(bridgeCodeURL);

    this._worker.postMessage({
      type: 'init',
      detail: details
    });

    this._worker.onmessage = this._messageFromWorker;
  } else {
    this._manager = new _FramesManager.default(this._cb);

    this._manager.init(details);
  }
};

exports.default = Animator;