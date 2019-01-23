/**
 * @flow
 * @format
 * Entry point for the API
 */
import '@babel/polyfill';
import { GifReader } from 'omggif';
import Decoder from './Decoder';
import Animator from './Animator';

/**
 * Usage:
 * let gifler = new OffscreenCanvasGifler();
 * gifler.setCanvasEl('selector');
 * gifler.animate();
 */
class OffscreenCanvasGifler {
  _cb: Function;
  _decoder: Decoder;
  _animator: Animator;
  _renderToOffscreen: boolean;

  constructor(renderToOffscreen: boolean, cb?: Function) {
    this._decoder = new Decoder();
    this._cb = cb;
    this._renderToOffscreen = renderToOffscreen;
  }

  init = (url: string): Promise<void> =>  {
    return this._getGif(url);
  };

  _getGif = async (url: string): Promise<any> =>  {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    const dataPromise = new Promise(resolve => {
      return (xhr.onload = function(e) {
        return resolve(this.response);
      });
    });
    xhr.send();

    const dataBuffer = await dataPromise;
    return await this._init(dataBuffer);
  };

  _init = async (data: ArrayBuffer): Promise<any> => {
    const reader = new GifReader(new Uint8Array(data));
    const frames = await this._decoder.decodeFramesAsync(reader);
    this._animator = new Animator(reader, frames, this._renderToOffscreen, this._cb);
  };

  _getCanvasElement(selector: string | HTMLCanvasElement): HTMLCanvasElement | null {
    if (typeof selector === 'string') {
      // $FlowFixMe
      const el: HTMLCanvasElement | null = document.querySelector(selector);
      return el;
    } else if (selector.tagName === 'CANVAS') {
      return selector;
    } else {
      throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
    }
  };

  setCanvasEl = (selector: string | HTMLCanvasElement, setDimensions: boolean): void => {
    const canvas = this._getCanvasElement(selector);
    // $FlowFixMe
    this._animator.setCanvasEl(canvas, setDimensions);
  };

  animate = () => {
    this._animator.animateInCanvas();
  };

  getFrameDataURL = () => {
    return this._animator.getFrameDataURL();
  };
}

export default OffscreenCanvasGifler;
