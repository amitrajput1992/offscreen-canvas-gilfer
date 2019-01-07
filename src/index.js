import React from 'react';
import {render}  from 'react-dom';
import OffscreenCanvasGifler  from './app/OffscreenCanvasGifler';

render(
  <div>Hello</div>,
  document.getElementById('root')
);

const gifler = new OffscreenCanvasGifler();
gifler.init('https://cdn-force.vrgmetri.com/organization/g/test/tenor.gif').then(() => {
// gifler.init('https://media.giphy.com/media/3osxY7MLrs5wP2wRgc/giphy.gif').then(() => {
    gifler.setCanvasEl('#myCanvas');
    gifler.animate();
});
