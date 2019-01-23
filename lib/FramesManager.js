"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/**
 * @format
 */
var FramesManager =
/*#__PURE__*/
function () {
  function FramesManager() {
    var _this = this;

    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    (0, _classCallCheck2.default)(this, FramesManager);
    (0, _defineProperty2.default)(this, "_cb", void 0);
    (0, _defineProperty2.default)(this, "setCanvas", function (canvas) {
      _this._canvas = canvas;
      _this._ctx = _this._canvas.getContext('2d');
    });
    (0, _defineProperty2.default)(this, "createBufferCanvas", function (frame) {
      var bufferCanvas, bufferContext, imageData;
      bufferCanvas = document.createElement("canvas");
      bufferCanvas.width = _this._width;
      bufferCanvas.height = _this._height;
      bufferContext = bufferCanvas.getContext('2d');
      imageData = bufferContext.createImageData(_this._width, _this._height);
      imageData.data.set(frame.pixels);
      bufferContext.putImageData(imageData, -frame.x, -frame.y);
      return bufferCanvas;
    });
    (0, _defineProperty2.default)(this, "start", function () {
      _this._isRunning = true;
      setTimeout(_this.nextFrame, 0);
    });
    (0, _defineProperty2.default)(this, "nextFrame", function () {
      requestAnimationFrame(_this.nextFrameRender);
    });
    (0, _defineProperty2.default)(this, "nextFrameRender", function () {
      if (!_this._isRunning) {
        return;
      }

      var frame = _this._frames[_this._frameIndex];

      _this.onFrame(frame, _this._frameIndex);

      _this.enqueueNextFrame();
    });
    (0, _defineProperty2.default)(this, "onFrame", function (frame, i) {
      if (!frame.buffer) {
        frame.buffer = _this.createBufferCanvas(frame);
      }

      if (typeof _this._disposeFrame === 'function') {
        _this._disposeFrame();
      }

      _this._disposeFrame = _this.getNextDisposeFrame(frame);

      _this.onDrawFrame(frame, i);
    });
    (0, _defineProperty2.default)(this, "onDrawFrame", function (frame, i) {
      _this._ctx.drawImage(frame.buffer, frame.x, frame.y);

      _this._cb(i);
    });
    (0, _defineProperty2.default)(this, "enqueueNextFrame", function () {
      var actualDelay, delta, frame, frameDelay;

      _this.advanceFrame();

      while (_this._isRunning) {
        frame = _this._frames[_this._frameIndex];
        delta = new Date().valueOf() - _this._lastTime;
        _this._lastTime += delta;
        _this._delayCompensation += delta;
        frameDelay = frame.delay * 10;
        actualDelay = frameDelay - _this._delayCompensation;
        _this._delayCompensation -= frameDelay;

        if (actualDelay < 0) {
          _this.advanceFrame();

          continue;
        } else {
          setTimeout(_this.nextFrame, actualDelay);
          break;
        }
      }
    });
    (0, _defineProperty2.default)(this, "advanceFrame", function () {
      _this._frameIndex += 1;

      if (_this._frameIndex >= _this._frames.length) {
        if (_this._loopCount !== 0 && _this._loopCount === loops) {
          stop();
        } else {
          _this._frameIndex = 0;
          _this._loops += 1;
        }
      }
    });
    (0, _defineProperty2.default)(this, "getNextDisposeFrame", function (frame) {
      switch (frame.disposal) {
        case 2:
          {
            return function () {
              this._ctx.clearRect(0, 0, this._width, this._height);
            }.bind(_this);
          }

        case 3:
          {
            var saved = _this._ctx.getImageData(0, 0, _this._width, _this._height);

            return function () {
              this._ctx.putImageData(saved, 0, 0);
            }.bind(_this);
          }
      }
    });
    (0, _defineProperty2.default)(this, "stop", function () {
      _this._isRunning = false;
    });
    (0, _defineProperty2.default)(this, "reset", function () {
      _this._frameIndex = 0;
      _this._loops = 0;
    });
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

  (0, _createClass2.default)(FramesManager, [{
    key: "init",
    value: function init(details) {
      this._frames = details.frames;
      this._width = details.width;
      this._height = details.height;
      this._loopCount = details.loopCount;
      this._renderWidth = details.renderWidth;
      this._renderHeight = details.renderHeight;
      this._lastTime = new Date().valueOf();
    }
  }]);
  return FramesManager;
}();

exports.default = FramesManager;