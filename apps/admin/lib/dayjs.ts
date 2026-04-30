/**
 * Ant Design DatePicker（rc-picker）依赖 dayjs 的 weekday / localeData 等扩展；
 * 未 extend 时会出现 clone.weekday is not a function。
 * 在任意使用 DatePicker 的页面加载前执行一次即可（由 providers 侧 effect import）。
 */
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

export default dayjs;
