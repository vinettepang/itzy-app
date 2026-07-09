import { useEffect, useState } from 'react';
import { useHaoqiWeather } from './useHaoqiWeather';

function pad(n: number, len = 4) {
  return String(Math.max(0, Math.round(n))).padStart(len, '0');
}

export function useHaoqiLiveStatus() {
  const [clock, setClock] = useState('--:--');
  const [coords, setCoords] = useState({ x: 1, y: 1 });
  const temp = useHaoqiWeather();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const g8 = new Date(utc + 8 * 3600000);
      const hh = String(g8.getHours()).padStart(2, '0');
      const mm = String(g8.getMinutes()).padStart(2, '0');
      setClock(`${hh}:${mm}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => setCoords({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return {
    clock,
    coords,
    temp,
    coordsLabel: `${pad(coords.x)} X ${pad(coords.y)} Y`,
    weatherLabel: temp !== null ? `${temp}°C` : '--°C',
  };
}
