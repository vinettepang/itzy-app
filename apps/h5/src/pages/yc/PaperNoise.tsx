import { useEffect, useRef } from 'react';

/** Canvas2D random grayscale grain (SOURCE · fn-noise-d). */
export default function PaperNoise() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const image = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = 255 * Math.random();
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, []);

  return (
    <canvas ref={ref} className="paper-noise" width={800} height={400} aria-hidden />
  );
}
