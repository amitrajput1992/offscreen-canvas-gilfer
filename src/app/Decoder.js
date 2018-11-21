/**
 * @flow
 * @format
 */
import {type GifReader}  from 'omggif';
import Promise  from 'bluebird';

export default class Decoder {
  decodeFramesSync = (reader: GifReader) => {
    return [...reader.numFrames()].map(fr => this._decodeFrame(reader, fr));
  };

  decodeFramesAsync = (reader: GifReader) => {
    return Promise.map([...reader.numFrames()], fr => this._decodeFrame(reader, fr), 1);
  };

  _decodeFrame = (reader: GifReader, frameIndex: number) => {
    const frameInfo = reader.frameInfo(frameIndex);
    frameInfo.pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
    reader.decodeAndBlitFrameRGBA(frameIndex, frameInfo.pixels);
    return frameInfo
  };
}
