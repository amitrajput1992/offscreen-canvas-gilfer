import React from 'react';
import {render}  from 'react-dom';
import OffscreenCanvasGifler  from './app/OffscreenCanvasGifler';

render(
  <React.Fragment>
    <div>Canvas GIF</div>
  </React.Fragment>,
  document.getElementById('root')
);

function h (frameIndex) {
  console.log('rendering frame', frameIndex);
}

const gifler = new OffscreenCanvasGifler(true, h);
gifler.init('https://cdn-force.vrgmetri.com/organization/g/test/tenor.gif').then(() => {
// gifler.init('https://media.giphy.com/media/3osxY7MLrs5wP2wRgc/giphy.gif').then(() => {
    gifler.setCanvasEl('#myCanvas');
    gifler.animate();
});
