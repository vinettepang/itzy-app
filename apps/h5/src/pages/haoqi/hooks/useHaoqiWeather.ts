import { useEffect, useState } from 'react';

/** 上海坐标 — 与生产 GMT+8 CN 一致 */
const LAT = 31.23;
const LON = 121.47;

export function useHaoqiWeather() {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m&timezone=Asia%2FShanghai`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const t = data?.current?.temperature_2m;
        if (!cancelled && typeof t === 'number') setTemp(Math.round(t));
      } catch {
        /* 离线时保留 null，UI 回退占位 */
      }
    };
    void load();
    const id = window.setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return temp;
}
