/**
 * @flow
 * @format
 */
import { type GifReader } from 'omggif';

export default class Decoder {
  decodeFramesSync = (reader: GifReader): any => {
    return Array.from({ length: reader.numFrames() }, (v, k) => k).map(fr => this._decodeFrame(reader, fr));
  };

  decodeFramesAsync = (reader: GifReader) => {
    const pArray = [];
    for (let fr = 0; fr < reader.numFrames(); fr++) {
      pArray.push(
        new Promise(resolve => {
          resolve(this._decodeFrame(reader, fr));
        }),
      );
    }

    return Promise.all(pArray);
  };

  _decodeFrame = (reader: GifReader, frameIndex: number) => {
    const frameInfo = reader.frameInfo(frameIndex);
    frameInfo.pixels = new Uint8ClampedArray(reader.width * reader.height * 4);
    reader.decodeAndBlitFrameRGBA(frameIndex, frameInfo.pixels);
    return frameInfo;
  };
}
