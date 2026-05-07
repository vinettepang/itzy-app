/**
 * 数据源开关（不依赖后端 / Nest 时关闭即可）
 *
 * - `false`（默认）：不发起 HTTP，数据来自 `src/mock-data/*.json`，外壳与 `{ code, data, message }` 一致。
 * - `true`：走 `VITE_API_BASE` / `getApiBase()` 对应的真实接口。
 */
export const USE_LIVE_API = false;
