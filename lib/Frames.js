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

    (0, _classCallCheck2.default)(this, FramesManager);
    (0, _defineProperty2.default)(this, "setCanvas", function (canvas) {
      _this.canvas = canvas;
      _this.ctx = _this.canvas.getContext('2d');
    });
    (0, _defineProperty2.default)(this, "createBufferCanvas", function (frame) {
      var bufferCanvas, bufferContext, imageData;
      bufferCanvas = document.createElement("canvas");
      bufferCanvas.width = _this.width;
      bufferCanvas.height = _this.height;
      bufferContext = bufferCanvas.getContext('2d');
      imageData = bufferContext.createImageData(_this.width, _this.height);
      imageData.data.set(frame.pixels);
      bufferContext.putImageData(imageData, -frame.x, -frame.y);
      return bufferCanvas;
    });
    (0, _defineProperty2.default)(this, "start", function () {
      _this.isRunning = true;
      setTimeout(_this.nextFrame, 0);
    });
    (0, _defineProperty2.default)(this, "nextFrame", function () {
      requestAnimationFrame(_this.nextFrameRender);
    });
    (0, _defineProperty2.default)(this, "nextFrameRender", function () {
      if (!_this.isRunning) {
        return;
      }

      var frame = _this.frames[_this.frameIndex];

      _this.onFrame(frame, _this.frameIndex);

      _this.enqueueNextFrame();
    });
    (0, _defineProperty2.default)(this, "onFrame", function (frame, i) {
      if (!frame.buffer) {
        frame.buffer = _this.createBufferCanvas(frame);
      }

      if (typeof _this.disposeFrame === 'function') {
        _this.disposeFrame();
      }

      _this.disposeFrame = _this.getNextDisposeFrame(frame);

      _this.onDrawFrame(frame, i);
    });
    (0, _defineProperty2.default)(this, "onDrawFrame", function (frame, i) {
      _this.ctx.drawImage(frame.buffer, frame.x, frame.y);
    });
    (0, _defineProperty2.default)(this, "enqueueNextFrame", function () {
      var actualDelay, delta, frame, frameDelay;

      _this.advanceFrame();

      while (_this.isRunning) {
        frame = _this.frames[_this.frameIndex];
        delta = new Date().valueOf() - _this.lastTime;
        _this.lastTime += delta;
        _this.delayCompensation += delta;
        frameDelay = frame.delay * 10;
        actualDelay = frameDelay - _this.delayCompensation;
        _this.delayCompensation -= frameDelay;

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
      _this.frameIndex += 1;

      if (_this.frameIndex >= _this.frames.length) {
        if (_this.loopCount !== 0 && _this.loopCount === loops) {
          stop();
        } else {
          _this.frameIndex = 0;
          _this.loops += 1;
        }
      }
    });
    (0, _defineProperty2.default)(this, "getNextDisposeFrame", function (frame) {
      switch (frame.disposal) {
        case 2:
          {
            return function () {
              this.ctx.clearRect(0, 0, this.width, this.height);
            }.bind(_this);
          }

        case 3:
          {
            var saved = _this.ctx.getImageData(0, 0, _this.width, _this.height);

            return function () {
              this.ctx.putImageData(saved, 0, 0);
            }.bind(_this);
          }
      }
    });
    (0, _defineProperty2.default)(this, "stop", function () {
      _this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "reset", function () {
      _this.frameIndex = 0;
      _this.loops = 0;
    });
    this.frames = [];
    this.frameIndex = 0;
    this.width = 0;
    this.height = 0;
    this.disposeFrame = null;
    this.canvas = null;
    this.ctx = null;
    this.loopCount = 0;
    this.loops = 0;
    this.renderWidth = 0;
    this.renderHeight = 0;
    this.isRunning = false;
    this.lastTime = new Date().valueOf();
    this.delayCompensation = 0;
  }

  (0, _createClass2.default)(FramesManager, [{
    key: "init",
    value: function init(details) {
      this.frames = details.frames;
      this.width = details.width;
      this.height = details.height;
      this.loopCount = details.loopCount;
      this.renderWidth = details.renderWidth;
      this.renderHeight = details.renderHeight;
      this.lastTime = new Date().valueOf();
    }
  }]);
  return FramesManager;
}();

exports.default = FramesManager;