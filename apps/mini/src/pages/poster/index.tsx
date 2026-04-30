import { Canvas, Input, Picker, Radio, RadioGroup, ScrollView, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ticketBg from '@/assets/ticket-bg.png';
import { POSTER_CANCELLED, renderPosterToTempPath } from './drawPoster';
import { POSTER_PREVIEW_STORAGE_KEY } from './previewBridge';
import { normalizeMiniProgramAssetPath } from '@/utils/localAssetPath';
import { request } from '@/services/request';
import { POSTER_HEIGHT, POSTER_TEXT_SLOTS, POSTER_WIDTH, type PosterTextSlot } from './layout';
import './index.scss';

/** 与主按钮渐变一致：选中态单选圆点 */
const RADIO_ACCENT = '#7c3aed';

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

/** 海报画布：第一行 英文全称月份/日，换行 年份 + 12h 时间 + AM/PM */
function formatPosterShowTime(iso: string): string {
  const d = new Date(iso);
  const monthEn = POSTER_MONTH_EN[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let h24 = d.getHours();
  const min = d.getMinutes();
  const isAm = h24 < 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const mm = String(min).padStart(2, '0');
  const ap = isAm ? 'AM' : 'PM';
  return `${monthEn}/${day}\n${year} ${h12}:${mm} ${ap}`;
}

/** 本地自然日 YYYY-MM-DD（与行程列表展示日一致） */
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
    for (const s of schedulesForTag) {
      set.add(scheduleCity(s));
    }
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
    for (const s of slotSchedules) {
      keys.add(localDateKey(s.startsAt));
    }
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

  const tagLabels = useMemo(() => tagOptions.map((t) => t.name), [tagOptions]);
  const dateLabels = useMemo(() => dateOptions.map((o) => o.label), [dateOptions]);
  const timeSlotLabels = useMemo(() => schedulesForSelectedDate.map((s) => formatTimeSlotLabel(s)), [schedulesForSelectedDate]);

  const tagPickerValue = useMemo(() => {
    if (!selectedTagId || !tagOptions.length) return 0;
    const i = tagOptions.findIndex((t) => t.id === selectedTagId);
    return i >= 0 ? i : 0;
  }, [selectedTagId, tagOptions]);

  const cityPickerValue = useMemo(() => {
    if (!selectedCity || !cityOptions.length) return 0;
    const i = cityOptions.findIndex((c) => c === selectedCity);
    return i >= 0 ? i : 0;
  }, [selectedCity, cityOptions]);

  const datePickerValue = useMemo(() => {
    if (!selectedDateKey || !dateOptions.length) return 0;
    const i = dateOptions.findIndex((o) => o.key === selectedDateKey);
    return i >= 0 ? i : 0;
  }, [selectedDateKey, dateOptions]);

  const timeSlotPickerValue = useMemo(() => {
    if (!selectedScheduleId || !schedulesForSelectedDate.length) return 0;
    const i = schedulesForSelectedDate.findIndex((s) => s.id === selectedScheduleId);
    return i >= 0 ? i : 0;
  }, [selectedScheduleId, schedulesForSelectedDate]);

  const renderScheduleCascade = useCallback(() => {
    const tagRange = tagLabels.length ? tagLabels : ['（暂无标签）'];
    const cityRange = cityOptions.length ? cityOptions : ['（先选巡演轮次）'];
    const dateRange = dateLabels.length ? dateLabels : ['（先选城市）'];

    const tagDisabled = schedulesLoading || !tagLabels.length;
    const cityDisabled = !selectedTagId || !cityOptions.length;
    const dateDisabled = !selectedTagId || !selectedCity || !dateLabels.length;
    const showTimeStep = schedulesForSelectedDate.length > 1;
    const timeRange = timeSlotLabels.length ? timeSlotLabels : ['（先选日期）'];
    const timeDisabled = !selectedDateKey || !showTimeStep || !timeSlotLabels.length;

    const selectedTag = tagOptions.find((t) => t.id === selectedTagId);
    const tagDisplay = tagDisabled
      ? schedulesLoading
        ? '加载行程…'
        : '暂无已发布行程'
      : selectedTag
        ? selectedTag.name
        : '请选择巡演轮次';

    const cityDisplay = !selectedTagId
      ? '请先选择巡演轮次'
      : !cityOptions.length
        ? '该轮次下暂无城市'
        : selectedCity || '请选择城市';

    const selectedDateOpt = dateOptions.find((o) => o.key === selectedDateKey);
    const dateDisplay = !selectedCity
      ? '请先选择城市'
      : !dateLabels.length
        ? '该城市暂无行程日期'
        : selectedDateOpt
          ? selectedDateOpt.label
          : '请选择日期';

    const selectedSlot = schedulesForSelectedDate.find((s) => s.id === selectedScheduleId);
    const timeDisplay =
      !showTimeStep && selectedSlot
        ? formatTimeSlotLabel(selectedSlot)
        : showTimeStep
          ? selectedSlot
            ? formatTimeSlotLabel(selectedSlot)
            : '请选择开场时间'
          : '';

    return (
      <View className="cascade-block">
        <Text className="cascade-hint">
          先选巡演轮次，再选城市后再选开演日期；按单场生成。
        </Text>
        <Text className="cascade-step-label">1. 巡演轮次</Text>
        <Picker
          mode="selector"
          range={tagRange}
          value={tagPickerValue}
          disabled={tagDisabled}
          onChange={(e) => {
            const i = Number(e.detail.value);
            const safe = Math.max(0, Math.min(i, tagOptions.length - 1));
            if (!tagOptions.length) return;
            const id = tagOptions[safe]?.id ?? '';
            setSelectedTagId(id);
            setSelectedCity('');
            setSelectedDateKey('');
            setSelectedScheduleId('');
            applySchedule(undefined);
          }}
        >
          <View className={`input picker${tagDisabled ? ' disabled' : ''}`}>
            <Text>{tagDisplay}</Text>
          </View>
        </Picker>

        <Text className="cascade-step-label">2. 城市（该轮次行程）</Text>
        <Picker
          mode="selector"
          range={cityRange}
          value={cityPickerValue}
          disabled={cityDisabled}
          onChange={(e) => {
            const i = Number(e.detail.value);
            const safe = Math.max(0, Math.min(i, cityOptions.length - 1));
            if (!cityOptions.length) return;
            const city = cityOptions[safe] ?? '';
            setSelectedCity(city);
            setSelectedDateKey('');
            setSelectedScheduleId('');
            applySchedule(undefined);
          }}
        >
          <View className={`input picker${cityDisabled ? ' disabled' : ''}`}>
            <Text>{cityDisplay}</Text>
          </View>
        </Picker>

        <Text className="cascade-step-label">3. 日期（该城市行程）</Text>
        <Picker
          mode="selector"
          range={dateRange}
          value={datePickerValue}
          disabled={dateDisabled}
          onChange={(e) => {
            const i = Number(e.detail.value);
            const safe = Math.max(0, Math.min(i, dateOptions.length - 1));
            if (!dateOptions.length) return;
            const opt = dateOptions[safe];
            if (!opt) return;
            setSelectedDateKey(opt.key);
            const dayList = slotSchedules
              .filter((s) => localDateKey(s.startsAt) === opt.key)
              .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
            if (dayList.length === 1) {
              const sch = dayList[0];
              setSelectedScheduleId(sch.id);
              applySchedule(sch);
            } else {
              setSelectedScheduleId('');
              applySchedule(undefined);
            }
          }}
        >
          <View className={`input picker${dateDisabled ? ' disabled' : ''}`}>
            <Text>{dateDisplay}</Text>
          </View>
        </Picker>

        {showTimeStep ? (
          <>
            <Text className="cascade-step-label">4. 开场时间（当日多场）</Text>
            <Picker
              mode="selector"
              range={timeRange}
              value={timeSlotPickerValue}
              disabled={timeDisabled}
              onChange={(e) => {
                const i = Number(e.detail.value);
                const safe = Math.max(0, Math.min(i, schedulesForSelectedDate.length - 1));
                if (!schedulesForSelectedDate.length) return;
                const sch = schedulesForSelectedDate[safe];
                if (!sch) return;
                setSelectedScheduleId(sch.id);
                applySchedule(sch);
              }}
            >
              <View className={`input picker${timeDisabled ? ' disabled' : ''}`}>
                <Text>{timeDisplay || '请选择开场时间'}</Text>
              </View>
            </Picker>
          </>
        ) : selectedDateKey && schedulesForSelectedDate.length === 1 ? (
          <Text className="cascade-one-slot">
            当日单场：{formatTimeSlotLabel(schedulesForSelectedDate[0])}
          </Text>
        ) : null}
      </View>
    );
  }, [
    schedulesLoading,
    tagLabels,
    tagOptions,
    selectedTagId,
    cityOptions,
    selectedCity,
    dateLabels,
    dateOptions,
    selectedDateKey,
    datePickerValue,
    slotSchedules,
    schedulesForSelectedDate,
    selectedScheduleId,
    timeSlotLabels,
    timeSlotPickerValue,
    tagPickerValue,
    cityPickerValue,
    applySchedule,
  ]);

  const generate = useCallback(async () => {
    setErr(null);
    const venueOk = Boolean((values.venue || '').trim());
    const timeOk = Boolean((values.showTime || '').trim());
    if (!venueOk || !timeOk) {
      void Taro.showToast({
        title: '请先选择巡演、城市、日期与场次',
        icon: 'none',
      });
      return;
    }
    setBusy(true);
    try {
      const bgSrc = normalizeMiniProgramAssetPath(ticketBg);
      let bg = bgSrc;
      try {
        const info = await Taro.getImageInfo({ src: bgSrc });
        bg = info.path;
      } catch {
        /* 仍用已规范化的包内路径 */
      }
      const symbol =
        currencyMode === 'KRW' ? '₩' : currencyMode === 'USD' ? '$' : (customCurrency || '').trim();
      const mergedValues: Record<string, string> = {
        ...values,
        price: `${symbol}${(values.price || '').trim()}`,
      };
      const path = await renderPosterToTempPath(bg, mergedValues, {
        isAlive: () => aliveRef.current,
      });
      if (!aliveRef.current) return;
      try {
        Taro.setStorageSync(POSTER_PREVIEW_STORAGE_KEY, path);
      } catch {
        setErr('无法暂存预览路径，请重试');
        return;
      }
      void Taro.showToast({ title: '已生成', icon: 'success' });
      void Taro.navigateTo({ url: '/pages/poster/preview/index' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      if (msg === POSTER_CANCELLED) return;
      setErr(msg);
      void Taro.showToast({ title: msg, icon: 'none' });
    } finally {
      setBusy(false);
    }
  }, [values, currencyMode, customCurrency]);

  const renderField = (slot: PosterTextSlot) => {
    if (slot.key === 'venue') {
      return null;
    }
    if (slot.key === 'showTime') {
      const venueSlot = POSTER_TEXT_SLOTS.find((s) => s.key === 'venue');
      return (
        <View key="show-venue-block">
          <View className="field">
            <Text className="label">{slot.label}</Text>
            {renderScheduleCascade()}
            <View className={`input picker${values.showTime ? '' : ' disabled'}`}>
              <Text style={{ whiteSpace: 'pre-line' }}>{values.showTime || '未选择场次'}</Text>
            </View>
          </View>
          <View className="field">
            <Text className="label">{venueSlot?.label ?? '地点'}</Text>
            <View className={`input picker${values.venue ? '' : ' disabled'}`}>
              <Text>{values.venue || '未选择场次'}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key={slot.key} className="field">
        <Text className="label">{slot.label}</Text>
        {slot.key === 'price' ? (
          <View className="price-wrap">
            <RadioGroup
              className="currency-group"
              onChange={(e) => setCurrencyMode(e.detail.value as 'KRW' | 'USD' | 'CUSTOM')}
            >
              <Radio className="currency-radio" color={RADIO_ACCENT} value="KRW" checked={currencyMode === 'KRW'}>
                <Text>韩元 ₩</Text>
              </Radio>
              <Radio className="currency-radio" color={RADIO_ACCENT} value="USD" checked={currencyMode === 'USD'}>
                <Text>美元 $</Text>
              </Radio>
              <Radio className="currency-radio" color={RADIO_ACCENT} value="CUSTOM" checked={currencyMode === 'CUSTOM'}>
                <Text>自定义</Text>
              </Radio>
            </RadioGroup>

            {currencyMode === 'CUSTOM' ? (
              <Input
                className="input currency-custom"
                placeholder="输入符号/前缀，例如：RM "
                value={customCurrency}
                onInput={(e) => setCustomCurrency(e.detail.value)}
                maxlength={8}
              />
            ) : null}

            <Input
              className="input"
              placeholder={slot.placeholder ?? `填写${slot.label}`}
              value={values[slot.key]}
              onInput={(e) => onField(slot.key, (e.detail.value || '').replace(/[^\d]/g, ''))}
            />
          </View>
        ) : slot.multiline ? (
          <Textarea
            className="input textarea"
            placeholder={slot.placeholder ?? `填写${slot.label}`}
            value={values[slot.key]}
            onInput={(e) => onField(slot.key, e.detail.value)}
            maxlength={200}
          />
        ) : (
          <Input
            className="input"
            placeholder={slot.placeholder ?? `填写${slot.label}`}
            value={values[slot.key]}
            onInput={(e) => onField(slot.key, e.detail.value)}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView scrollY className="page">
      <View className="canvas-host">
        <Canvas type="2d" id="posterCanvas" className="poster-canvas" />
      </View>
      {/* <Text className="lead">
        底图与导出尺寸 {POSTER_WIDTH}×{POSTER_HEIGHT}px（ITZY 票模板）。换底图请替换{' '}
        <Text className="lead-path">src/assets/ticket-bg.png</Text>；坐标在 layout.ts 的 POSTER_TEXT_SLOTS。
      </Text> */}

      {POSTER_TEXT_SLOTS.map((slot) => renderField(slot))}

      <View className="actions">
        <View className={`btn${busy ? ' disabled' : ''}`} onClick={() => void generate()}>
          <Text>{busy ? '生成中…' : '生成图片'}</Text>
        </View>
      </View>

      {err ? <Text className="err">{err}</Text> : null}

      <Text className="hint">
        说明：画布与导出均为 {POSTER_WIDTH}×{POSTER_HEIGHT} 像素，与 layout.ts 坐标一一对应；Canvas 样式须用 Px
        以免被转成 rpx。底图建议同尺寸。生成后将进入预览页，可在预览页保存到相册（需授权）。
      </Text>
    </ScrollView>
  );
}
