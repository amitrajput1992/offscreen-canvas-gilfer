# Offscreen Canvas Gifler

Standalone library to render gif frames to an offscreen canvas

#### Usage
```
const gifler = new OffscreenCanvasGifler();
gifler.init('https://media.giphy.com/media/3osxY7MLrs5wP2wRgc/giphy.gif').then(() => {
  gifler.setCanvasEl('#myCanvas');
  gifler.animate();
});

```
