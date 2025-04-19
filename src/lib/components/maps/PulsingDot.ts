import type { StyleImageInterface, Map as MapLibreMap } from 'maplibre-gl';

const size = 200
export class PulsingDot implements StyleImageInterface {
  map: MapLibreMap;
  width: number;
  height: number;
  data: Uint8ClampedArray;
  context: CanvasRenderingContext2D

  constructor(map: MapLibreMap) {

    let data = new Uint8ClampedArray(size * size * 4)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    this.map = map;
    this.width = size;
    this.height = size;
    this.data = data;
    this.context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  }

  render() {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (size / 2) * 0.3;
    const outerRadius = (size / 2) * 0.7 * t + radius;
    const context = this.context;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      outerRadius,
      0,
      Math.PI * 2
    );
    context.fillStyle = `rgba(255, 200, 200,${1 - t})`;
    context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      radius,
      0,
      Math.PI * 2
    );
    context.fillStyle = 'rgba(255, 100, 100, 1)';
    // context.strokeStyle = 'rgba(255, 255, 153, 1)';
    context.strokeStyle = "white";
    context.lineWidth = 8 + 2 * (1 - 4*t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;

    // continuously repaint the map, resulting in the smooth animation of the dot
    this.map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  }
};


//   private createImageData(imageString: string): { width: number, height: number, context: CanvasRenderingContext2D, data: Uint8ClampedArray } {
//   const canvas = document.createElement('canvas');
//   const image = new Image()
//   image.src = imageString

//   canvas.width = image.width;
//   canvas.height = image.height;
//   const context = canvas.getContext('2d');

//   if (!context) {
//     throw new Error('Canvas context not available');
//   }
//   const imageData = context.getImageData(0, 0, image.width, image.height);
//   return { width: image.width, height: image.height, context: context, data: new Uint8ClampedArray(imageData.data.buffer) };
// }
// }