import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type FormesObject = HTMLElement;

function baseRotation(el: FormesObject): number {
  if (el.dataset.formesBaseRot === undefined) {
    el.dataset.formesBaseRot = String(Number(gsap.getProperty(el, 'rotation')) || 0);
  }
  return parseFloat(el.dataset.formesBaseRot) || 0;
}

function objectCenter(el: FormesObject) {
  const x = Number(gsap.getProperty(el, 'x')) || 0;
  const y = Number(gsap.getProperty(el, 'y')) || 0;
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2 - x, y: rect.top + rect.height / 2 - y };
}

function influenceConfig() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  return mobile
    ? { influenceRadius: 260, maxDistance: 110, rotForce: 12, scaleForce: 0.1 }
    : { influenceRadius: 460, maxDistance: 380, rotForce: 30, scaleForce: 0.2 };
}

/** main `Kv` / `tC` */
export function initFormes(scope: HTMLElement): () => void {
  const wrappers = [...scope.querySelectorAll<HTMLElement>('.formes-w')];
  if (!wrappers.length) return () => {};

  const scrollTriggers: ScrollTrigger[] = [];
  const bindings: {
    wrapper: HTMLElement;
    onMove: (e: MouseEvent) => void;
    onLeave: () => void;
    objects: FormesObject[];
  }[] = [];

  wrappers.forEach((wrapper) => {
    const objects = [
      ...wrapper.querySelectorAll<FormesObject>('img, svg, [class*="-cursor"]'),
    ];
    if (!objects.length) return;

    const applyForce = (px: number, py: number) => {
      const { influenceRadius, maxDistance, rotForce, scaleForce } = influenceConfig();
      objects.forEach((obj) => {
        const center = objectCenter(obj);
        const dist = Math.hypot(px - center.x, py - center.y);
        const rot0 = baseRotation(obj);
        if (dist < influenceRadius) {
          const angle = Math.atan2(py - center.y, px - center.x);
          const falloff = Math.pow((influenceRadius - dist) / influenceRadius, 1.6);
          const push = falloff * maxDistance;
          const rot = rot0 - Math.cos(angle) * falloff * rotForce;
          gsap.to(obj, {
            x: -Math.cos(angle) * push,
            y: -Math.sin(angle) * push,
            rotation: rot,
            scale: 1 + falloff * scaleForce,
            duration: 0.45,
            ease: 'power4.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(obj, {
            x: 0,
            y: 0,
            rotation: rot0,
            scale: 1,
            duration: 1.2,
            ease: 'elastic.out(1, 0.35)',
            overwrite: 'auto',
          });
        }
      });
    };

    const resetAll = () => {
      objects.forEach((obj) => {
        gsap.to(obj, {
          x: 0,
          y: 0,
          rotation: baseRotation(obj),
          scale: 1,
          duration: 1.2,
          ease: 'elastic.out(1, 0.35)',
          overwrite: 'auto',
        });
      });
    };

    let pointerInside = false;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pointerPos = () =>
      pointerInside ? pointer : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const onMove = (e: MouseEvent) => {
      pointerInside = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      applyForce(pointer.x, pointer.y);
    };

    const onLeave = () => {
      pointerInside = false;
      const p = pointerPos();
      applyForce(p.x, p.y);
    };

    wrapper.addEventListener('mousemove', onMove);
    wrapper.addEventListener('mouseleave', onLeave);

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => {
        const p = pointerPos();
        applyForce(p.x, p.y);
      },
      onLeave: resetAll,
      onLeaveBack: resetAll,
    });

    scrollTriggers.push(st);
    bindings.push({ wrapper, onMove, onLeave, objects });
  });

  return () => {
    bindings.forEach(({ wrapper, onMove, onLeave, objects }) => {
      wrapper.removeEventListener('mousemove', onMove);
      wrapper.removeEventListener('mouseleave', onLeave);
      objects.forEach((obj) => gsap.killTweensOf(obj));
    });
    scrollTriggers.forEach((st) => st.kill());
  };
}
