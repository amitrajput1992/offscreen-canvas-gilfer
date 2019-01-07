export default class FramesManager
{
  constructor(){
    this.frames = [];
    this.frameIndex = 0;
    this.width = 0;
    this.height = 0;
    this.disposeFrame = null;
    this.canvas = null;
    this.ctx = null;
    this.loopCount = 0;
    this.loops = 0;
    this.renderWidth = 0;
    this.renderHeight = 0;
    this.isRunning = false;
    this.lastTime = new Date().valueOf();
    this.delayCompensation = 0;
  }

  init(details)
  {
    this.frames = details.frames;
    this.width = details.width;
    this.height = details.height;
    this.loopCount = details.loopCount;
    this.renderWidth = details.renderWidth;
    this.renderHeight = details.renderHeight;
    this.lastTime = new Date().valueOf();
  }

  createBufferCanvas = (frame) => {
    let bufferCanvas, bufferContext, imageData;
    bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = this.width;
    bufferCanvas.height = this.height;
    bufferContext = bufferCanvas.getContext('2d');
    imageData = bufferContext.createImageData(this.width, this.height);
    imageData.data.set(frame.pixels);
    bufferContext.putImageData(imageData, -frame.x, -frame.y);
    return bufferCanvas;
  };

  start = () => {
    this.isRunning = true;
    setTimeout(this.nextFrame, 0);
  };

  nextFrame = () => {
    requestAnimationFrame(this.nextFrameRender);
  };

  nextFrameRender = () => {
    if (!this.isRunning) {
      return;
    }
    let frame = this.frames[this.frameIndex];
    this.onFrame(frame, this.frameIndex);
    this.enqueueNextFrame();
  };

  /**
   * Called on each frame
   * @param frame
   * @param i
   */
  onFrame = (frame, i) => {
    if(!frame.buffer) {
      frame.buffer = this.createBufferCanvas(frame);
    }
    if(typeof this.disposeFrame === 'function') {
      this.disposeFrame();
    }
    this.disposeFrame = this.getNextDisposeFrame(frame);
    this.onDrawFrame(frame, i);
  };

  /**
   * draw the frame on the canvas
   * @param frame
   * @param i: frame index
   */
  onDrawFrame = (frame, i) => {
    this.ctx.drawImage(frame.buffer, frame.x, frame.y);
  };

  enqueueNextFrame = () => {
    let actualDelay, delta, frame, frameDelay;
    this.advanceFrame();
    while (this.isRunning) {
      frame = this.frames[this.frameIndex];
      delta = new Date().valueOf() - this.lastTime;
      this.lastTime += delta;
      this.delayCompensation += delta;
      frameDelay = frame.delay * 10;
      actualDelay = frameDelay - this.delayCompensation;
      this.delayCompensation -= frameDelay;
      if (actualDelay < 0) {
        this.advanceFrame();
        continue;
      } else {
        setTimeout(this.nextFrame, actualDelay);
        break;
      }
    }
  };

  advanceFrame = () => {
    this.frameIndex += 1;
    if (this.frameIndex >= this.frames.length) {
      if (this.loopCount !== 0 && this.loopCount === loops) {
        stop();
      } else {
        this.frameIndex = 0;
        this.loops += 1;
      }
    }
  };

  getNextDisposeFrame = (frame) => {

    switch(frame.disposal) {
      case 2: {
        return function() {
          this.ctx.clearRect(0, 0, this.width, this.height);
        }.bind(this);
      }
      case 3: {
        let saved = this.ctx.getImageData(0, 0, this.width, this.height);
        return function() {
          this.ctx.putImageData(saved, 0, 0);
        }.bind(this);
      }
    }
  };

  stop = () => {
    this.isRunning = false;
  };

  reset = () => {
    this.frameIndex = 0;
    this.loops = 0;
  }

}
