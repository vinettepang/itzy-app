/** 与底图 `ticket-bg.png` 导出像素一致（由原先 655×1024 等比放大） */
export const POSTER_WIDTH = 1368;
export const POSTER_HEIGHT = 2136;

export type PosterTextAlign = 'left' | 'center' | 'right';

/** 价格格式：允许值前带货币符号，数字部分做千分位 */
export type PosterPriceFormat = 'krwDigits' | undefined;

export type PosterTextSlot = {
  key: string;
  label: string;
  placeholder?: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  color: string;
  align: PosterTextAlign;
  fontWeight?: 'normal' | 'bold';
  /** 绘制在输入内容前，例如 Reserved Seat ₩ */
  prefix?: string;
  suffix?: string;
  /** 多行时行距（px），首行 baseline 在 y */
  lineHeight?: number;
  /** 无换行符时按宽度自动断行（英文按词） */
  wrap?: boolean;
  priceFormat?: PosterPriceFormat;
  /** 使用多行输入（如座位） */
  multiline?: boolean;
  /** 默认 middle；座位区用 top 更易对齐票图印刷上沿 */
  textBaseline?: CanvasTextBaseline;
};

/**
 * 固定坐标：与导出画布 1368×2136 一致（由 655×1024 版式 × sx/sy 取整）。
 * sx=1368/655，sy=2136/1024。换底图请使用同比例资源或重标坐标。
 */
export const POSTER_TEXT_SLOTS: PosterTextSlot[] = [
  {
    key: 'name',
    label: '姓名',
    placeholder: '例如：MIDZY',
    x: 71,
    y: 375,
    maxWidth: 664,
    fontSize: 71,
    color: '#101010',
    align: 'left',
    fontWeight: 'bold',
  },
  {
    key: 'ticketId',
    label: '票号',
    placeholder: '例如：Y20190212 1/1',
    x: 71,
    y: 530,
    maxWidth: 706,
    fontSize: 58,
    color: '#101010',
    align: 'left',
    fontWeight: 'bold',
  },
  {
    key: 'price',
    label: '价格（填数字即可）',
    placeholder: '例如：154000',
    x: 71,
    y: 635,
    maxWidth: 800,
    fontSize: 52,
    color: '#101010',
    align: 'left',
    prefix: 'Reserved Seat ',
    priceFormat: 'krwDigits',
    fontWeight: 'bold',
  },
  {
    key: 'showTime',
    label: '演出时间',
    placeholder: '请在下方选择',
    x: 71,
    y: 725,
    maxWidth: 710,
    fontSize: 50,
    color: '#101010',
    align: 'left',
    fontWeight: 'bold',
    lineHeight: 56,
    textBaseline: 'top',
  },
  {
    key: 'venue',
    label: '地点',
    placeholder: '请在下方选择',
    x: 71,
    y: 890,
    maxWidth: 710,
    fontSize: 52,
    color: '#101010',
    align: 'left',
    fontWeight: 'bold',
    lineHeight: 58,
    wrap: true,
    textBaseline: 'top',
  },
  {
    key: 'seat',
    label: '座位',
    placeholder: '例如：Floor 15 Area 10 Row 5 Col',
    x: 71,
    y: 1020,
    maxWidth: 900,
    fontSize: 79,
    color: '#101010',
    align: 'left',
    fontWeight: 'bold',
    lineHeight: 90,
    wrap: true,
    multiline: true,
    textBaseline: 'top',
  },
];
