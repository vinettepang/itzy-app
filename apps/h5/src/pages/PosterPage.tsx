import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { POSTER_CANCELLED, renderPosterToObjectURL } from '@/poster/drawPosterWeb';
import { POSTER_PREVIEW_STORAGE_KEY } from '@/poster/previewBridge';
import { POSTER_HEIGHT, POSTER_TEXT_SLOTS, POSTER_WIDTH, type PosterTextSlot } from '@/poster/layout';
import { request } from '@/services/request';
import ticketBg from '@/assets/ticket-bg.png';
import './PosterPage.css';

type Tag = { id: string; name: string };
type ScheduleTagLink = { tag: Tag };
type ScheduleVenueBrief = {
  id: string;
  posterDisplayName: string;
  city: string;
  countryName: string;
};
type Schedule = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  published: boolean;
  venue?: ScheduleVenueBrief | null;
  tags: ScheduleTagLink[];
};

function isTourLikeTagName(name: string): boolean {
  const n = name.trim();
  if (!n) return false;
  if (/tour/i.test(n)) return true;
  if (n.includes('巡演')) return true;
  return false;
}

function scheduleCity(s: Schedule): string {
  const c = s.venue?.city?.trim();
  if (c) return c;
  const loc = s.location?.trim();
  if (loc) {
    const head = loc.split(/[,，]/)[0]?.trim();
    if (head) return head;
  }
  return '其他';
}

function venueLine(s: Schedule): string {
  const v = s.venue?.posterDisplayName?.trim();
  if (v) return v;
  return (s.location || '').trim();
}

const POSTER_MONTH_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function formatPosterShowTime(iso: string): string {
  const d = new Date(iso);
  const monthEn = POSTER_MONTH_EN[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const h24 = d.getHours();
  const min = d.getMinutes();
  const isAm = h24 < 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const mm = String(min).padStart(2, '0');
  const ap = isAm ? 'AM' : 'PM';
  return `${monthEn}/${day}\n${year} ${h12}:${mm} ${ap}`;
}

function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  const y = parts[0];
  const mo = parts[1];
  const da = parts[2];
  if (!y || !mo || !da) return dateKey;
  const dt = new Date(y, mo - 1, da);
  return dt.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function formatTimeSlotLabel(s: Schedule): string {
  const d = new Date(s.startsAt);
  const t = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const place = venueLine(s);
  return place ? `${t} · ${place}` : t;
}

function collectTagOptions(schedules: Schedule[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const s of schedules) {
    for (const { tag } of s.tags) {
      if (!map.has(tag.id)) map.set(tag.id, tag.name);
    }
  }
  const all = [...map.entries()].map(([id, name]) => ({ id, name }));
  const tourish = all.filter((t) => isTourLikeTagName(t.name));
  const pick = tourish.length > 0 ? tourish : all;
  pick.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
  return pick;
}

function initialValues(): Record<string, string> {
  const defaults: Record<string, string> = {
    name: 'MIDZY',
    ticketId: 'Y20190212 1/1',
    price: '154000',
    seat: 'Floor 19 Area 02 Row 12 Col',
    showTime: '',
    venue: '',
  };
  const o: Record<string, string> = { ...defaults };
  POSTER_TEXT_SLOTS.forEach((s) => {
    if (o[s.key] === undefined) o[s.key] = '';
  });
  return o;
}

export default function PosterPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aliveRef = useRef(true);

  const [values, setValues] = useState(initialValues);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [currencyMode, setCurrencyMode] = useState<'KRW' | 'USD' | 'CUSTOM'>('KRW');
  const [customCurrency, setCustomCurrency] = useState('RM ');

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSchedulesLoading(true);
    void (async () => {
      try {
        const res = await request<Schedule[]>({ url: '/api/schedules', method: 'GET' });
        if (cancelled) return;
        if (res.code === 0 && Array.isArray(res.data)) {
          setSchedules(res.data);
        } else {
          setSchedules([]);
        }
      } catch {
        if (!cancelled) setSchedules([]);
      } finally {
        if (!cancelled) setSchedulesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tagOptions = useMemo(() => collectTagOptions(schedules), [schedules]);
  const schedulesForTag = useMemo(() => {
    if (!selectedTagId) return [];
    return schedules.filter((s) => s.tags.some((x) => x.tag.id === selectedTagId));
  }, [schedules, selectedTagId]);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of schedulesForTag) set.add(scheduleCity(s));
    const arr = [...set];
    arr.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    return arr;
  }, [schedulesForTag]);

  const slotSchedules = useMemo(() => {
    if (!selectedTagId || !selectedCity) return [];
    return schedulesForTag
      .filter((s) => scheduleCity(s) === selectedCity)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [schedulesForTag, selectedTagId, selectedCity]);

  const dateOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const s of slotSchedules) keys.add(localDateKey(s.startsAt));
    const sorted = [...keys].sort();
    return sorted.map((key) => ({ key, label: formatDateLabel(key) }));
  }, [slotSchedules]);

  const schedulesForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return slotSchedules
      .filter((s) => localDateKey(s.startsAt) === selectedDateKey)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [slotSchedules, selectedDateKey]);

  const applySchedule = useCallback((s: Schedule | undefined) => {
    if (!s) {
      setValues((prev) => ({ ...prev, showTime: '', venue: '' }));
      return;
    }
    setValues((prev) => ({
      ...prev,
      showTime: formatPosterShowTime(s.startsAt),
      venue: venueLine(s) || prev.venue,
    }));
  }, []);

  const onField = useCallback((key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const showTimeStep = schedulesForSelectedDate.length > 1;
  const tagDisabled = schedulesLoading || !tagOptions.length;
  const cityDisabled = !selectedTagId || !cityOptions.length;
  const dateDisabled = !selectedTagId || !selectedCity || !dateOptions.length;
  const timeDisabled = !selectedDateKey || !showTimeStep || !schedulesForSelectedDate.length;

  const generate = useCallback(async () => {
    setErr(null);
    const venueOk = Boolean((values.venue || '').trim());
    const timeOk = Boolean((values.showTime || '').trim());
    if (!venueOk || !timeOk) {
      alert('请先选择巡演、城市、日期与场次');
      return;
    }
    const el = canvasRef.current;
    if (!el) {
      setErr('Canvas 未就绪');
      return;
    }
    setBusy(true);
    try {
      // 默认底图：src/assets/ticket-bg.png（Vite 会生成可访问的 URL）
      const bgSrc = new URL(ticketBg, window.location.href).href;
      const symbol =
        currencyMode === 'KRW' ? '₩' : currencyMode === 'USD' ? '$' : (customCurrency || '').trim();
      const mergedValues: Record<string, string> = {
        ...values,
        price: `${symbol}${(values.price || '').trim()}`,
      };
      const objectUrl = await renderPosterToObjectURL(el, bgSrc, mergedValues, {
        isAlive: () => aliveRef.current,
      });
      if (!aliveRef.current) return;
      try {
        const prev = sessionStorage.getItem(POSTER_PREVIEW_STORAGE_KEY) ?? '';
        if (typeof prev === 'string' && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
      } catch {
        /* ignore */
      }
      sessionStorage.setItem(POSTER_PREVIEW_STORAGE_KEY, objectUrl);
      navigate('/poster/preview');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      if (msg === POSTER_CANCELLED) return;
      setErr(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  }, [values, currencyMode, customCurrency, navigate]);

  const renderScheduleCascade = () => (
    <div className="cascade-block">
      <p className="cascade-hint">先选巡演轮次，再选城市后再选开演日期；按单场生成。</p>
      <p className="cascade-step-label">1. 巡演轮次</p>
      <select
        className="input select picker"
        value={selectedTagId}
        disabled={tagDisabled}
        onChange={(e) => {
          const id = e.target.value;
          setSelectedTagId(id);
          setSelectedCity('');
          setSelectedDateKey('');
          setSelectedScheduleId('');
          applySchedule(undefined);
        }}
      >
        <option value="">
          {tagDisabled ? (schedulesLoading ? '加载行程…' : '暂无已发布行程') : '请选择巡演轮次'}
        </option>
        {tagOptions.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <p className="cascade-step-label">2. 城市（该轮次行程）</p>
      <select
        className="input select picker"
        value={selectedCity}
        disabled={cityDisabled}
        onChange={(e) => {
          setSelectedCity(e.target.value);
          setSelectedDateKey('');
          setSelectedScheduleId('');
          applySchedule(undefined);
        }}
      >
        <option value="">
          {!selectedTagId ? '请先选择巡演轮次' : !cityOptions.length ? '该轮次下暂无城市' : '请选择城市'}
        </option>
        {cityOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <p className="cascade-step-label">3. 日期（该城市行程）</p>
      <select
        className="input select picker"
        value={selectedDateKey}
        disabled={dateDisabled}
        onChange={(e) => {
          const key = e.target.value;
          setSelectedDateKey(key);
          const dayList = slotSchedules
            .filter((s) => localDateKey(s.startsAt) === key)
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
          if (dayList.length === 1) {
            const sch = dayList[0];
            if (sch) {
              setSelectedScheduleId(sch.id);
              applySchedule(sch);
            }
          } else {
            setSelectedScheduleId('');
            applySchedule(undefined);
          }
        }}
      >
        <option value="">
          {!selectedCity ? '请先选择城市' : !dateOptions.length ? '该城市暂无行程日期' : '请选择日期'}
        </option>
        {dateOptions.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>

      {showTimeStep ? (
        <>
          <p className="cascade-step-label">4. 开场时间（当日多场）</p>
          <select
            className="input select picker"
            value={selectedScheduleId}
            disabled={timeDisabled}
            onChange={(e) => {
              const sid = e.target.value;
              const sch = schedulesForSelectedDate.find((s) => s.id === sid);
              setSelectedScheduleId(sid);
              applySchedule(sch);
            }}
          >
            <option value="">{timeDisabled ? '（先选日期）' : '请选择开场时间'}</option>
            {schedulesForSelectedDate.map((s) => (
              <option key={s.id} value={s.id}>
                {formatTimeSlotLabel(s)}
              </option>
            ))}
          </select>
        </>
      ) : selectedDateKey && schedulesForSelectedDate.length === 1 ? (
        <p className="cascade-one-slot">
          当日单场：{formatTimeSlotLabel(schedulesForSelectedDate[0])}
        </p>
      ) : null}
    </div>
  );

  const renderField = (slot: PosterTextSlot) => {
    if (slot.key === 'venue') return null;

    if (slot.key === 'showTime') {
      const venueSlot = POSTER_TEXT_SLOTS.find((s) => s.key === 'venue');
      return (
        <div key="show-venue-block">
          <div className="field">
            <span className="label">{slot.label}</span>
            {renderScheduleCascade()}
            <div className={`input picker${values.showTime ? '' : ' disabled'}`}>
              <span style={{ whiteSpace: 'pre-line' }}>{values.showTime || '未选择场次'}</span>
            </div>
          </div>
          <div className="field">
            <span className="label">{venueSlot?.label ?? '地点'}</span>
            <div className={`input picker${values.venue ? '' : ' disabled'}`}>
              <span>{values.venue || '未选择场次'}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={slot.key} className="field">
        <span className="label">{slot.label}</span>
        {slot.key === 'price' ? (
          <div className="price-wrap">
            <div className="currency-group">
              <label className="currency-radio">
                <input
                  type="radio"
                  name="currencyMode"
                  checked={currencyMode === 'KRW'}
                  onChange={() => setCurrencyMode('KRW')}
                />
                韩元 ₩
              </label>
              <label className="currency-radio">
                <input
                  type="radio"
                  name="currencyMode"
                  checked={currencyMode === 'USD'}
                  onChange={() => setCurrencyMode('USD')}
                />
                美元 $
              </label>
              <label className="currency-radio">
                <input
                  type="radio"
                  name="currencyMode"
                  checked={currencyMode === 'CUSTOM'}
                  onChange={() => setCurrencyMode('CUSTOM')}
                />
                自定义
              </label>
            </div>
            {currencyMode === 'CUSTOM' ? (
              <input
                className="input currency-custom"
                placeholder="输入符号/前缀，例如：RM "
                value={customCurrency}
                maxLength={8}
                onChange={(e) => setCustomCurrency(e.target.value)}
              />
            ) : null}
            <input
              className="input"
              placeholder={slot.placeholder ?? `填写${slot.label}`}
              value={values[slot.key]}
              onChange={(e) => onField(slot.key, (e.target.value || '').replace(/[^\d]/g, ''))}
            />
          </div>
        ) : slot.multiline ? (
          <textarea
            className="input textarea"
            placeholder={slot.placeholder ?? `填写${slot.label}`}
            value={values[slot.key]}
            maxLength={200}
            onChange={(e) => onField(slot.key, e.target.value)}
          />
        ) : (
          <input
            className="input"
            placeholder={slot.placeholder ?? `填写${slot.label}`}
            value={values[slot.key]}
            onChange={(e) => onField(slot.key, e.target.value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="canvas-host">
        <canvas ref={canvasRef} id="posterCanvas" className="poster-canvas" />
      </div>

      {POSTER_TEXT_SLOTS.map((slot) => renderField(slot))}

      <div className="actions">
        <button type="button" className={`btn${busy ? ' disabled' : ''}`} onClick={() => void generate()} disabled={busy}>
          {busy ? '生成中…' : '生成图片'}
        </button>
      </div>

      {err ? <p className="err">{err}</p> : null}

      <p className="hint">
        说明：画布导出为 {POSTER_WIDTH}×{POSTER_HEIGHT} 像素，与 layout 坐标对应；底图为 src/assets/ticket-bg.png。
        Web 预览使用 Blob URL；生成后跳转预览页下载 PNG。
      </p>
    </div>
  );
}
