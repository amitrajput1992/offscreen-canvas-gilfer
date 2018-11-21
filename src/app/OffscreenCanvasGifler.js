/**
 * @flow
 * @format
 * Entry point for the API
 */
import {GifReader}  from 'omggif';
import Decoder  from './Decoder';
import Promise  from 'bluebird';
import Animator  from './Animator';

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

  constructor(url: string, cb: any = () => {}) {
    this._decoder = new Decoder();
    this._cb = cb;
    return this._getGif(url);
  }

  async _getGif (url: string) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    const dataPromise = new Promise(resolve => {
      return xhr.onload = function(e) {
        return resolve(this.response);
      }
    });
    xhr.send();

    const dataBuffer = await dataPromise;
    console.log(dataBuffer);
    return await this._init(dataBuffer);
  }

  async _init(data: any) {
    const reader = new GifReader(new Uint8Array(data));
    console.log(reader);
    const frames = await this._decoder.decodeFramesAsync(reader);
    this._animator = new Animator(reader, frames);
  }

  _getCanvasElement = (selector: any) => {
    if(typeof selector === 'string') {
      return document.querySelector(selector);
    } else if(selector.tagName === 'CANVAS') {
      return selector;
    } else {
      throw new Error('Unexpected selector type. Valid types are query-selector-string/canvas-element');
    }
  };

  setCanvasEl = (selector: any)=> {
    const canvas = this._getCanvasElement(selector);
    this._animator.setCanvasEl(canvas);
  };

  animate = () => {
    this._animator.animateInCanvas();
  };
}

export default OffscreenCanvasGifler;
