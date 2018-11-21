import '@babel/polyfill';
import React  from 'react';
import ReactDOM from 'react-dom';
import OffscreenCanvasGifler  from './OffscreenCanvasGifler';

export default class App extends React.Component {
  render() {
    return (
      <div>
        Hello world!! 12343
        <canvas id="myCanvas" width="200" height="100"></canvas>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));

// const gifler = new OffscreenCanvasGifler('https://cdn-force.vrgmetri.com/organization/g/test/tenor.gif');
const gifler = new OffscreenCanvasGifler();
gifler.init('https://media.giphy.com/media/3osxY7MLrs5wP2wRgc/giphy.gif').then(() => {
  gifler.setCanvasEl('#myCanvas');
  gifler.animate();
});

