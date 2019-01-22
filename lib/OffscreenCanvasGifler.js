"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("@babel/polyfill");

var _omggif = require("omggif");

var _Decoder = _interopRequireDefault(require("./Decoder"));

var _Animator = _interopRequireDefault(require("./Animator"));

/**
 * 
 * @format
 * Entry point for the API
 */

/**
 * Usage:
 * let gifler = new OffscreenCanvasGifler();
 * gifler.setCanvasEl('selector');
 * gifler.animate();
 */
var OffscreenCanvasGifler =
/*#__PURE__*/
function () {
  function OffscreenCanvasGifler(renderToOffscreen, cb) {
    var _this = this;

    (0, _classCallCheck2.default)(this, OffscreenCanvasGifler);
    (0, _defineProperty2.default)(this, "_cb", void 0);
    (0, _defineProperty2.default)(this, "_decoder", void 0);
    (0, _defineProperty2.default)(this, "_animator", void 0);
    (0, _defineProperty2.default)(this, "_renderToOffscreen", void 0);
    (0, _defineProperty2.default)(this, "init", function (url) {
      return _this._getGif(url);
    });
    (0, _defineProperty2.default)(this, "_getGif",
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(url) {
        var xhr, dataPromise, dataBuffer;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';
                dataPromise = new Promise(function (resolve) {
                  return xhr.onload = function (e) {
                    return resolve(this.response);
                  };
                });
                xhr.send();
                _context.next = 7;
                return dataPromise;

              case 7:
                dataBuffer = _context.sent;
                _context.next = 10;
                return _this._init(dataBuffer);

              case 10:
                return _context.abrupt("return", _context.sent);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    (0, _defineProperty2.default)(this, "_init",
    /*#__PURE__*/
    function () {
      var _ref2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(data) {
        var reader, frames;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                reader = new _omggif.GifReader(new Uint8Array(data));
                _context2.next = 3;
                return _this._decoder.decodeFramesAsync(reader);

              case 3:
                frames = _context2.sent;
                _this._animator = new _Animator.default(reader, frames, _this._renderToOffscreen);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
    (0, _defineProperty2.default)(this, "setCanvasEl", function (selector, setDimensions) {
      var canvas = _this._getCanvasElement(selector); // $FlowFixMe


      _this._animator.setCanvasEl(canvas, setDimensions);
    });
    (0, _defineProperty2.default)(this, "animate", function () {
      _this._animator.animateInCanvas();
    });
    (0, _defineProperty2.default)(this, "getFrameDataURL", function () {
      return _this._animator.getFrameDataURL();
    });
    this._decoder = new _Decoder.default();
    this._cb = cb;
    this._renderToOffscreen = renderToOffscreen;
  }

  (0, _createClass2.default)(OffscreenCanvasGifler, [{
    key: "_getCanvasElement",
    value: function _getCanvasElement(selector) {
      if (typeof selector === 'string') {
        // $FlowFixMe
        var el = document.querySelector(selector);
        return el;
      } else if (selector.tagName === 'CANVAS') {
        return selector;
      } else {
        throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
      }
    }
  }]);
  return OffscreenCanvasGifler;
}();

var _default = OffscreenCanvasGifler;
exports.default = _default;