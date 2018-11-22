/**
 * @flow
 * @format
 * Entry point for the API
 */
import '@babel/polyfill';
import { GifReader } from 'omggif';
import Decoder from './Decoder';
import Promise from 'bluebird';
import Animator from './Animator';

/**
 * Usage:
 * let gifler = new OffscreenCanvasGifler();
 * gifler.setCanvasEl('selector');
 * gifler.animate();
 */
class OffscreenCanvasGifler {
  _decoder: Decoder;
  _cb: any;
  _animator: Animator;

  constructor(cb: any = () => {}) {
    this._decoder = new Decoder();
    this._cb = cb;
  }

  init(url: string) {
    return this._getGif(url);
  }

  async _getGif(url: string) {
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
  }

  async _init(data: any) {
    const reader = new GifReader(new Uint8Array(data));
    const frames = await this._decoder.decodeFramesAsync(reader);
    this._animator = new Animator(reader, frames, this._cb);
  }

  _getCanvasElement = (selector: any) => {
    if (typeof selector === 'string') {
      return document.querySelector(selector);
    } else if (selector.tagName === 'CANVAS') {
      return selector;
    } else {
      throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
    }
  };

  setCanvasEl = (selector: any) => {
    const canvas = this._getCanvasElement(selector);
    this._animator.setCanvasEl(canvas);
  };

  animate = (setDimensions: boolean) => {
    this._animator.animateInCanvas(setDimensions);
  };
}

export default OffscreenCanvasGifler;
window.OffscreenCanvasGifler = OffscreenCanvasGifler;
