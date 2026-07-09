import { useEffect, useRef } from 'react';

import { createCertificateScene } from '../createCertificateScene';



type Props = {

  themeIndex?: number;

  resetTrigger?: number;

};



const THEME_FILTERS = [

  'none',

  'hue-rotate(28deg) contrast(1.2)',

  'hue-rotate(160deg)',

  'hue-rotate(90deg) contrast(1.1)',

] as const;



export default function VirgilCertificate({ themeIndex = 0, resetTrigger = 0 }: Props) {

  const mountRef = useRef<HTMLDivElement>(null);

  const pointerRef = useRef({ x: 0.5, y: 0.5 });

  const resetRef = useRef(resetTrigger);



  useEffect(() => {

    resetRef.current = resetTrigger;

  }, [resetTrigger]);



  useEffect(() => {

    const el = mountRef.current;

    if (el) {

      el.style.filter = THEME_FILTERS[themeIndex % 3] ?? 'none';

    }

  }, [themeIndex]);



  useEffect(() => {

    const onMove = (e: PointerEvent) => {

      pointerRef.current = {

        x: e.clientX / window.innerWidth,

        y: 1 - e.clientY / window.innerHeight,

      };

    };

    window.addEventListener('pointermove', onMove);

    return () => window.removeEventListener('pointermove', onMove);

  }, []);



  useEffect(() => {

    const el = mountRef.current;

    if (!el) return;

    let handle: { dispose: () => void } | null = null;

    let cancelled = false;

    void createCertificateScene(el, {

      pointer: () => pointerRef.current,

      scrollOffsetVh: 0,

      getResetTrigger: () => resetRef.current,

    }).then((h) => {

      if (cancelled) h.dispose();

      else handle = h;

    });

    return () => {

      cancelled = true;

      handle?.dispose();

    };

  }, []);



  return <div ref={mountRef} className="virgil__certificate" aria-hidden="true" />;

}


