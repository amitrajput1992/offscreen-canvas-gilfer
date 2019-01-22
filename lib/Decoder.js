"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _omggif = require("omggif");

/**
 * 
 * @format
 */
var Decoder = function Decoder() {
  var _this = this;

  (0, _classCallCheck2.default)(this, Decoder);
  (0, _defineProperty2.default)(this, "decodeFramesSync", function (reader) {
    return Array.from({
      length: reader.numFrames()
    }, function (v, k) {
      return k;
    }).map(function (fr) {
      return _this._decodeFrame(reader, fr);
    });
  });
  (0, _defineProperty2.default)(this, "decodeFramesAsync", function (reader) {
    var pArray = [];

    var _loop = function _loop(fr) {
      pArray.push(new Promise(function (resolve) {
        resolve(_this._decodeFrame(reader, fr));
      }));
    };

    for (var fr = 0; fr < reader.numFrames(); fr++) {
      _loop(fr);
    }

    return Promise.all(pArray);
  });
  (0, _defineProperty2.default)(this, "_decodeFrame", function (reader, frameIndex) {
    var frameInfo = reader.frameInfo(frameIndex);
    frameInfo.pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
    reader.decodeAndBlitFrameRGBA(frameIndex, frameInfo.pixels);
    return frameInfo;
  });
};

exports.default = Decoder;