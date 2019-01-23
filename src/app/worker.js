/**
 * Use this file to perform any heavy operations such as generating frames of the gif on the canvas.
 * We will be using OffscreenCanvas() here to print frames and send blobs to main thread for treatment
 */

// define vars required
// internal
export const bridgeCode = `let lastTime;
let delayCompensation;
let isRunning;

// external
let frames = [];
let frameIndex = 0;
let width = 0;
let height = 0;
let disposeFrame = null;
let canvas = null;
let ctx = null;
let loopCount = 0;
let loops = 0;
let renderWidth = 0;
let renderHeight = 0;

onmessage = function(e) {
  const detail = e.data.detail;
  switch(e.data.type) {
    case 'init': {
      frames = detail.frames;
      width = detail.width;
      height = detail.height;
      loopCount = detail.loopCount;
      renderWidth = detail.renderWidth;
      renderHeight = detail.renderHeight;
      break;
    }

    case 'canvasCtx': {
      canvas = detail.canvas;
      ctx = canvas.getContext('2d');
      break;
    }

    case 'start': {
      start();
      break;
    }

    case 'stop': {
      stop();
      break;
    }
  }
};

function createBufferCanvas(frame) {
  let bufferCanvas, bufferContext, imageData;
  bufferCanvas = new OffscreenCanvas(frame.width, frame.height);
  bufferContext = bufferCanvas.getContext('2d');
  imageData = bufferContext.createImageData(width, height);
  imageData.data.set(frame.pixels);
  bufferContext.putImageData(imageData, -frame.x, -frame.y);
  return bufferCanvas;
}

/*---
  head : 'animator.animateInCanvas()'
  text :
    - >
      This method prepares the canvas to be drawn into and sets up
      the callbacks for each frame while the animation is running.
    - >
      To change how each frame is drawn into the canvas, override
      <b>animator.onDrawFrame()</b> before calling this method.
      If <b>animator.onDrawFrame()</b> is not set, we simply draw
      the frame directly into the canvas as is.
    - >
      You may also override <b>animator.onFrame()</b> before calling
      this method. onFrame handles the lazy construction of canvas
      buffers for each frame as well as the disposal method for each frame.
  args :
    setDimensions : 'OPTIONAL. If true, the canvas width/height will be set to match the GIF. default: true.'

    animateInCanvas -> start -> onFrame -> onDrawFrame

   */
function start () {
  lastTime = new Date().valueOf();
  delayCompensation = 0;
  isRunning = true;
  setTimeout(nextFrame, 0);
}

function nextFrame() {
  requestAnimationFrame(nextFrameRender);
}

function nextFrameRender() {
  if(!isRunning) {
    return;
  }
  let frame = frames[frameIndex];
  onFrame(frame, frameIndex);
  enqueueNextFrame();
}

/**
 * Called on each frame
 * @param frame
 * @param i
 */
function onFrame(frame, i) {
  if(!frame.buffer) {
    frame.buffer = createBufferCanvas(frame);
  }
  if(typeof disposeFrame === 'function') {
    disposeFrame();
  }
  disposeFrame = getNextDisposeFrame(frame);
  onDrawFrame(frame, i);
}

/**
 * draw the frame on the canvas
 * @param frame
 * @param i: frame index
 */
function onDrawFrame(frame, i) {
  ctx.drawImage(frame.buffer, frame.x, frame.y); 
  postMessage({
    type: 'onDrawFrame',
    frameIndex: i
  });
}

function enqueueNextFrame() {
  let actualDelay, delta, frame, frameDelay;
  advanceFrame();
  while (isRunning) {
    frame = frames[frameIndex];
    delta = new Date().valueOf() - lastTime;
    lastTime += delta;
    delayCompensation += delta;
    frameDelay = frame.delay * 10;
    actualDelay = frameDelay - delayCompensation;
    delayCompensation -= frameDelay;
    if (actualDelay < 0) {
      advanceFrame();
      continue;
    } else {
      setTimeout(nextFrame, actualDelay);
      break;
    }
  }
}

function advanceFrame() {
  frameIndex += 1;
  if (frameIndex >= frames.length) {
    if (loopCount !== 0 && loopCount === loops) {
      stop();
    } else {
      frameIndex = 0;
      loops += 1;
    }
  }
}

function getNextDisposeFrame(frame) {
  switch(frame.disposal) {
    case 2: {
      return function() {
        ctx.clearRect(0, 0, width, height);
      }
    }
    case 3: {
      let saved = ctx.getImageData(0, 0, width, height);
      return function() {
        ctx.putImageData(saved, 0, 0);
      }
    }
  }
}

function stop() {
  isRunning = false;
}

function reset() {
  frameIndex = 0;
  loops = 0;
}
`;
