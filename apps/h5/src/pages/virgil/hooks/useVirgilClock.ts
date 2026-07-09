import { useEffect, useState } from 'react';

export function useVirgilClock() {
  const [clock, setClock] = useState('--:--');
  const [date, setDate] = useState('DD/MM/YY');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      setClock(`${hh}:${mm}`);
      setDate(`${dd}/${mo}/${yy}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return { clock, date };
}
