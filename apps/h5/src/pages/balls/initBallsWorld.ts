import {
  Bodies,
  Body,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
  type Body as MatterBody,
} from 'matter-js';

const POINTER_RADIUS = 76;
const PUSH_SCALE = 0.0009;
const MAX_MOUSE_SPEED = 34;
const SLOW_MOVE_THRESHOLD = 11;
const SWIPE_MIN_SPEED = 2.8;
const THROW_VELOCITY_SCALE = 0.22;

type BallBody = MatterBody & {
  ballTexture?: HTMLImageElement;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createWalls(width: number, height: number) {
  const thickness = 80;
  const groundY = height - thickness / 2 + 8;

  return [
    Bodies.rectangle(width / 2, groundY, width + 200, thickness, {
      isStatic: true,
      friction: 0.9,
      render: { visible: false },
    }),
    Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      render: { visible: false },
    }),
    Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
      isStatic: true,
      render: { visible: false },
    }),
  ];
}

function createBalls(width: number, textures: HTMLImageElement[]) {
  const balls: BallBody[] = [];

  for (let i = 0; i < textures.length; i += 1) {
    const radius = randomBetween(26, 50);
    const x = randomBetween(radius + 16, width - radius - 16);
    const y = randomBetween(-120 - i * 28, -20 - i * 8);
    const texture = textures[i];

    const ball = Bodies.circle(x, y, radius, {
      restitution: 0.62,
      friction: 0.12,
      frictionAir: 0.018,
      density: 0.0016,
      render: { visible: false },
    }) as BallBody;

    ball.ballTexture = texture;
    balls.push(ball);
  }

  return balls;
}

function findBallAt(balls: BallBody[], x: number, y: number) {
  for (let i = balls.length - 1; i >= 0; i -= 1) {
    const body = balls[i];
    const r = body.circleRadius ?? 0;
    const dx = body.position.x - x;
    const dy = body.position.y - y;
    if (dx * dx + dy * dy <= r * r) return body;
  }
  return null;
}

function applyPointerForce(
  balls: BallBody[],
  x: number,
  y: number,
  vx: number,
  vy: number,
) {
  const speed = Math.min(Math.hypot(vx, vy), MAX_MOUSE_SPEED);
  if (speed < SWIPE_MIN_SPEED) return;

  const dirX = speed > 0.001 ? vx / speed : 0;
  const dirY = speed > 0.001 ? vy / speed : 0;

  balls.forEach((body) => {
    const dx = body.position.x - x;
    const dy = body.position.y - y;
    const dist = Math.hypot(dx, dy);
    const reach = POINTER_RADIUS + (body.circleRadius ?? 0);
    if (dist > reach) return;

    const falloff = 1 - dist / reach;
    const nx = dist > 0.001 ? dx / dist : 0;
    const ny = dist > 0.001 ? dy / dist : 0;
    const forceMag = PUSH_SCALE * body.mass * speed * falloff;

    Body.applyForce(body, body.position, {
      x: (nx * 0.6 + dirX * 0.9) * forceMag,
      y: (ny * 0.6 + dirY * 0.9) * forceMag,
    });
  });
}

function setCanvasCursor(canvas: HTMLCanvasElement, cursor: string) {
  if (canvas.style.cursor !== cursor) {
    canvas.style.cursor = cursor;
  }
}

export async function initBallsWorld(container: HTMLElement) {
  const albumHeadModules = import.meta.glob<string>(
    '@/assets/img/albumhead/*.{jpg,jpeg,png,webp}',
    {
      eager: true,
      import: 'default',
    },
  );

  const textures = await Promise.all(
    Object.keys(albumHeadModules)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((key) => loadImage(albumHeadModules[key])),
  );

  if (!textures.length) return () => undefined;

  const engine = Engine.create({ gravity: { x: 0, y: 1.1, scale: 0.001 } });
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const render = Render.create({
    element: container,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: '#ecece8',
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    },
  });

  const balls = createBalls(width, textures);
  const walls = createWalls(width, height);
  World.add(engine.world, [...walls, ...balls]);

  const canvas = render.canvas;
  const mouse = Mouse.create(canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.16,
      damping: 0.06,
      length: 0,
      render: { visible: false },
    },
  });

  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    if (!ctx) return;

    balls.forEach((body) => {
      const img = body.ballTexture;
      const r = body.circleRadius;
      if (!img || !r) return;

      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, -r, -r, r * 2, r * 2);
      ctx.restore();

      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });
  });

  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  let lastX = 0;
  let lastY = 0;
  let dragVelX = 0;
  let dragVelY = 0;
  let grabbedBody: BallBody | null = null;

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasPoint(clientX, clientY);
    const vx = x - lastX;
    const vy = y - lastY;
    const speed = Math.hypot(vx, vy);
    lastX = x;
    lastY = y;

    const draggingBody = mouseConstraint.body as BallBody | null;
    if (draggingBody) {
      dragVelX = dragVelX * 0.55 + vx * 0.45;
      dragVelY = dragVelY * 0.55 + vy * 0.45;
      setCanvasCursor(canvas, 'grabbing');
      return;
    }

    const hoveredBall = findBallAt(balls, x, y);
    if (hoveredBall && speed < SLOW_MOVE_THRESHOLD) {
      setCanvasCursor(canvas, 'grab');
      return;
    }

    setCanvasCursor(canvas, 'default');
    applyPointerForce(balls, x, y, vx, vy);
  };

  const onMouseMove = (e: MouseEvent) => {
    onPointerMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!e.touches[0]) return;
    onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onPointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasPoint(clientX, clientY);
    grabbedBody = findBallAt(balls, x, y);
    if (grabbedBody) {
      setCanvasCursor(canvas, 'grabbing');
    }
  };

  const onMouseDown = (e: MouseEvent) => {
    onPointerDown(e.clientX, e.clientY);
  };

  const onTouchStart = (e: TouchEvent) => {
    if (!e.touches[0]) return;
    const { x, y } = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
    lastX = x;
    lastY = y;
    onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
  };

  const releaseGrabbedBody = () => {
    if (!grabbedBody) return;

    const body = grabbedBody;
    const throwX = body.velocity.x + dragVelX * THROW_VELOCITY_SCALE;
    const throwY = body.velocity.y + dragVelY * THROW_VELOCITY_SCALE;
    const maxThrow = 28;
    const throwSpeed = Math.hypot(throwX, throwY);
    const scale = throwSpeed > maxThrow ? maxThrow / throwSpeed : 1;

    Body.setVelocity(body, {
      x: throwX * scale,
      y: throwY * scale,
    });

    grabbedBody = null;
    dragVelX = 0;
    dragVelY = 0;
  };

  const onMouseUp = () => {
    releaseGrabbedBody();
    const hoveredBall = findBallAt(balls, lastX, lastY);
    setCanvasCursor(canvas, hoveredBall ? 'grab' : 'default');
  };

  const onTouchEnd = () => {
    releaseGrabbedBody();
    setCanvasCursor(canvas, 'default');
  };

  const onResize = () => {
    const nextW = container.clientWidth || window.innerWidth;
    const nextH = container.clientHeight || window.innerHeight;
    render.canvas.width = nextW;
    render.canvas.height = nextH;
    render.options.width = nextW;
    render.options.height = nextH;
    Render.setPixelRatio(render, Math.min(window.devicePixelRatio || 1, 2));
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: nextW, y: nextH },
    });

    const ground = walls[0];
    const left = walls[1];
    const right = walls[2];
    Body.setPosition(ground, { x: nextW / 2, y: nextH - 32 });
    Body.setPosition(left, { x: -40, y: nextH / 2 });
    Body.setPosition(right, { x: nextW + 40, y: nextH / 2 });
  };

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseUp);
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  window.addEventListener('resize', onResize);

  return () => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('mouseleave', onMouseUp);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onResize);
    Render.stop(render);
    Runner.stop(runner);
    Engine.clear(engine);
    render.canvas.remove();
    render.textures = {};
  };
}
